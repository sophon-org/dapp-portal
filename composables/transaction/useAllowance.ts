import { L1Signer, utils } from "zksync-ethers";
import IERC20 from "zksync-ethers/abi/IERC20.json";

import type { DepositFeeValues } from "../zksync/deposit/useFee";
import type { Hash, TokenAllowance } from "@/types";
import type { BigNumberish } from "ethers";
import type { WalletClient } from "viem";

export default (
  accountAddress: Ref<string | undefined>,
  tokenAddress: Ref<string | undefined>,
  getContractAddress: () => Promise<string | undefined>,
  getL1Signer: () => Promise<L1Signer | undefined>,
  getWallet: () => Promise<WalletClient | undefined>
) => {
  const { getPublicClient } = useOnboardStore();
  const {
    result,
    inProgress,
    error,
    execute: getAllowance,
    reset,
  } = usePromise(
    async () => {
      if (!accountAddress.value) throw new Error("Account address is not available");

      const contractAddress = await getContractAddress();
      if (!contractAddress) throw new Error("Contract address is not available");

      const publicClient = getPublicClient();
      const allowance = (await publicClient!.readContract({
        address: tokenAddress.value as Hash,
        abi: IERC20,
        functionName: "allowance",
        args: [accountAddress.value, contractAddress],
      })) as bigint;
      return BigInt(allowance);
    },
    { cache: false }
  );

  const requestAllowance = async () => {
    if (accountAddress.value && tokenAddress.value && tokenAddress.value !== utils.ETH_ADDRESS) {
      await getAllowance();
    } else {
      reset();
    }
  };

  let approvalAmounts: TokenAllowance[] = [];
  const setAllowanceStatus = ref<"not-started" | "processing" | "waiting-for-signature" | "sending" | "done">(
    "not-started"
  );
  const setAllowanceTransactionHash = ref<Hash | undefined>(undefined);

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

        const contractAddress = await getContractAddress();
        if (!contractAddress) throw new Error("Contract address is not available");

        const wallet = await getWallet();
        setAllowanceStatus.value = "waiting-for-signature";

        setAllowanceTransactionHash.value = await wallet?.writeContract({
          address: tokenAddress.value as Hash,
          abi: IERC20,
          functionName: "approve",
          args: [contractAddress, approvalAmounts[1].allowance],
          chain: getPublicClient().chain,
          account: accountAddress.value as `0x${string}`,
        });

        setAllowanceStatus.value = "sending";
        const receipt = await getPublicClient().waitForTransactionReceipt({
          hash: setAllowanceTransactionHash.value!,
          onReplaced: (replacement) => {
            setAllowanceTransactionHash.value = replacement.transaction.hash;
          },
        });

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
  const getApprovalAmounts = async (amount: BigNumberish, fee: DepositFeeValues) => {
    const wallet = await getL1Signer();
    if (!wallet) throw new Error("Wallet is not available");

    // We need to pass the overrides in order to get the correct deposits allowance params
    const overrides = {
      gasPrice: fee.gasPrice,
      gasLimit: fee.l1GasLimit,
      maxFeePerGas: fee.maxFeePerGas,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
    };
    if (overrides.gasPrice && overrides.maxFeePerGas) {
      overrides.gasPrice = undefined;
    }

    approvalAmounts = (await wallet.getDepositAllowanceParams(
      tokenAddress.value!,
      amount,
      overrides
    )) as TokenAllowance[];

    return approvalAmounts;
  };

  const setAllowance = async (amount: BigNumberish, fee: DepositFeeValues) => {
    await getApprovalAmounts(amount, fee);
    await executeSetAllowance();
  };

  const resetSetAllowance = () => {
    approvalAmounts = [];
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
    getApprovalAmounts,
  };
};
