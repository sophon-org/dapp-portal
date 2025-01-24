import { getAddress } from "@ethersproject/address";
import { hexZeroPad } from "@ethersproject/bytes";
import { type BigNumberish, Contract } from "ethers";
import { ref } from "vue";

import usePromise from "~/composables/usePromise";

import LZ_OFT_HELPER_ABI from "./oftHelperAbi";

import type { Token } from "~/types";

export interface LayerZeroFeeValues {
  nativeFee: BigNumberish;
  zroFee: BigNumberish;
}

const HELPER_ADDRESS = "0x88172F3041Bd0787520dbc9Bd33D3d48e1fb46dc";

export type LayerZeroFeeParams = {
  token: Token;
  amount: BigNumberish;
  fromChainId: number;
  toChainId: number;
  to: string;
};

export default (getL1Signer: () => Promise<any>) => {
  const getEndpointId = (): number => {
    return 30101; // Ethereum mainnet
  };

  const toBytes32Address = (address: string): string => {
    return hexZeroPad(getAddress(address), 32);
  };

  let currentParams: LayerZeroFeeParams | undefined;
  const result = ref<LayerZeroFeeValues | undefined>();

  const {
    inProgress,
    error,
    execute: executeEstimateFee,
  } = usePromise(
    async () => {
      if (!currentParams) throw new Error("Fee estimation params not set");
      const params = currentParams;

      const wallet = await getL1Signer();
      if (!wallet) throw new Error("No provider available");

      const dstChainId = getEndpointId();
      const toAddressBytes32 = toBytes32Address(params.to);

      // L2 to L1
      const helperContract = new Contract(HELPER_ADDRESS, LZ_OFT_HELPER_ABI, wallet);
      const [nativeFee, zroFee] = await helperContract.quoteSendToL1(
        params.token.address,
        dstChainId,
        toAddressBytes32,
        params.amount
      );
      return { nativeFee, zroFee };
    },
    { cache: false }
  );

  const estimateFee = async (params: LayerZeroFeeParams) => {
    currentParams = params;
    const fee = await executeEstimateFee();
    result.value = fee;
    return fee;
  };

  return {
    result,
    inProgress,
    error,
    estimateFee,
  };
};
