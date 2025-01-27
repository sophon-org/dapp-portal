import { BigNumber, ethers, type BigNumberish } from "ethers";
import { utils } from "zksync-ethers";
import { type Provider } from "zksync-ethers";
import IERC20 from "zksync-ethers/abi/IERC20.json";

import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import type { Hash } from "~/types";

const OFT_HELPER_ADDRESS = "0x88172F3041Bd0787520dbc9Bd33D3d48e1fb46dc";

export default (
  getProvider: () => Provider,
  accountAddress: Ref<string | undefined>,
  tokenAddress: Ref<string | undefined>,
  isOft: Ref<boolean | undefined>
) => {
  const { getSigner } = useZkSyncWalletStore();
  const approvalNeeded = ref(false);
  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;
  let approvalAmount: BigNumberish | undefined;

  const fetchAllowance = async (owner: string): Promise<BigNumber> => {
    if (!tokenAddress.value) throw new Error("Token address is not available");
    let spender;
    if (isOft.value) {
      spender = OFT_HELPER_ADDRESS;
    } else {
      spender = NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l2BridgeAddress;
    }
    const provider = getProvider();
    const tokenContract = new ethers.Contract(tokenAddress.value, IERC20, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    approvalNeeded.value = BigNumber.from(allowance).isZero();
    return BigNumber.from(allowance);
  };

  const {
    result,
    inProgress,
    error,
    execute: getAllowance,
    reset,
  } = usePromise(() => fetchAllowance(accountAddress.value!), {
    cache: false,
  });

  const setAllowanceStatus = ref<"not-started" | "processing" | "waiting-for-signature" | "sending" | "done">(
    "not-started"
  );
  const setAllowanceTransactionHash = ref<Hash | undefined>();

  const {
    result: setAllowanceReceipt,
    inProgress: setAllowanceInProgress,
    error: setAllowanceError,
    execute: executeSetAllowance,
    reset: resetExecuteSetAllowance,
  } = usePromise(
    async () => {
      try {
        setAllowanceStatus.value = "processing";
        if (!accountAddress.value) throw new Error("Account address is not available");

        let contractAddress;
        if (tokenAddress.value === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.address) {
          contractAddress = NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l2BridgeAddress;
        } else {
          contractAddress = OFT_HELPER_ADDRESS;
        }
        if (!contractAddress) throw new Error("Contract address is not available");

        setAllowanceStatus.value = "waiting-for-signature";
        const signer = await getSigner();
        const tokenContract = new ethers.Contract(tokenAddress.value!, IERC20, signer);

        setAllowanceStatus.value = "sending";
        const tx = await tokenContract.approve(contractAddress, approvalAmount!.toString(), {
          customData: {
            paymasterParams: utils.getPaymasterParams(NETWORK_CONFIG.L2_GLOBAL_PAYMASTER.address, {
              type: "General",
              innerInput: new Uint8Array(),
            }),
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          },
        });
        const receipt = await tx.wait();

        await requestAllowance();

        setAllowanceStatus.value = "done";
        return receipt;
      } catch (err) {
        setAllowanceStatus.value = "not-started";
        throw err;
      }
    },
    { cache: false }
  );

  const requestAllowance = async () => {
    if (
      accountAddress.value &&
      tokenAddress.value &&
      (tokenAddress.value === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.address || isOft.value)
    ) {
      await getAllowance();
    } else {
      reset();
    }
  };

  const setAllowance = async (amount: BigNumberish) => {
    approvalAmount = amount;
    await executeSetAllowance();
  };

  const resetSetAllowance = () => {
    approvalAmount = undefined;
    setAllowanceStatus.value = "not-started";
    setAllowanceTransactionHash.value = undefined;
    resetExecuteSetAllowance();
  };

  watch(
    [accountAddress, tokenAddress],
    () => {
      requestAllowance();
      resetSetAllowance();
    },
    { immediate: true }
  );

  return {
    result: computed(() => result.value),
    inProgress: computed(() => inProgress.value),
    error: computed(() => error.value),
    requestAllowance,

    setAllowanceTransactionHash,
    setAllowanceReceipt,
    setAllowanceStatus,
    setAllowanceInProgress,
    setAllowanceError,
    setAllowance,
    resetSetAllowance,
  };
};
