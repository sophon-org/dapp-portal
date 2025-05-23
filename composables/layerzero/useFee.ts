import { getAddress } from "@ethersproject/address";
import { hexZeroPad } from "@ethersproject/bytes";
import { type BigNumberish, Contract, ethers } from "ethers";
import { ref } from "vue";
import IERC20 from "zksync-ethers/abi/IERC20.json";

import usePromise from "~/composables/usePromise";
import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import LZ_OFT_HELPER_ABI from "./oftHelperAbi";

import type { Provider } from "zksync-ethers";
import type { Token } from "~/types";

export interface LayerZeroFeeValues {
  nativeFee: BigNumberish;
}

export type LayerZeroFeeParams = {
  type: "transfer" | "withdrawal";
  token: Token;
  amount: BigNumberish;
  from: string;
  to: string;
  fromChainId?: number;
  toChainId?: number;
};

export default (getSigner: () => Promise<any>, getProvider: () => Provider) => {
  const allowanceValue = ref<bigint | undefined>();
  const approvalNeeded = ref(false);
  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;
  const getEndpointId = (): number => {
    return NETWORK_CONFIG.LAYER_ZERO_CONFIG.l1Eid;
  };

  const toBytes32Address = (address: string): string => {
    return hexZeroPad(getAddress(address), 32);
  };

  async function checkApproval(
    tokenAddress: string,
    owner: string,
    spender: string,
    amount: BigNumberish
  ): Promise<boolean> {
    const provider = getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, IERC20, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    allowanceValue.value = BigInt(allowance);

    if (allowanceValue.value === 0n) return false;

    const isApproved = allowanceValue.value > BigInt(amount);

    approvalNeeded.value = !isApproved;
    return isApproved;
  }

  let currentParams: LayerZeroFeeParams | undefined;
  const result = ref<LayerZeroFeeValues | undefined>();
  const gasLimit = ref<bigint | undefined>();
  const gasPrice = ref<bigint | undefined>();

  const {
    inProgress,
    error,
    execute: executeEstimateFee,
  } = usePromise(
    async () => {
      if (!currentParams) throw new Error("Fee estimation params not set");
      const params = currentParams;
      const wallet = await getSigner();
      const provider = getProvider();

      if (!wallet) throw new Error("No provider available");
      if (!provider) throw new Error("No provider available");

      const dstChainId = getEndpointId();
      const toAddressBytes32 = toBytes32Address(params.to);

      const helperContract = new Contract(NETWORK_CONFIG.LAYER_ZERO_CONFIG.oftHelperAddress, LZ_OFT_HELPER_ABI, wallet);
      const sendParam = {
        dstEid: dstChainId, // Ethereum mainnet
        to: toAddressBytes32,
        amountLD: params.amount,
        minAmountLD: params.amount,
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
      };

      const { nativeFee } = await helperContract.quoteSend(params.token.address, sendParam);
      const price = await provider.getGasPrice();
      gasPrice.value = price;

      try {
        const sendData = helperContract.interface.encodeFunctionData("send", [params.token.address, sendParam]);
        const gasEstimate = await provider.estimateGas({
          to: NETWORK_CONFIG.LAYER_ZERO_CONFIG.oftHelperAddress,
          data: sendData,
          from: params.from,
          value: "0x0", // Set value to 0 for estimation purposes
        });
        gasLimit.value = BigInt(gasEstimate.toString());
      } catch (err) {
        // Fallback estimate
        gasLimit.value = 300000n;
      }

      result.value = { nativeFee };
    },
    { cache: false }
  );

  return {
    gasLimit,
    gasPrice,
    result,
    inProgress,
    error,
    estimateFee: async (estimationParams: LayerZeroFeeParams, enoughAllowance: boolean) => {
      currentParams = estimationParams;
      if (!enoughAllowance) {
        const isApproved = await checkApproval(
          estimationParams.token.address,
          estimationParams.from,
          NETWORK_CONFIG.LAYER_ZERO_CONFIG.oftHelperAddress,
          estimationParams.amount
        );
        if (!isApproved) return;
      }
      await executeEstimateFee();
    },
  };
};
