import { getAddress } from "@ethersproject/address";
import { hexZeroPad } from "@ethersproject/bytes";
import { type BigNumberish, Contract } from "ethers";
import { storeToRefs } from "pinia";
import { utils } from "zksync-ethers";

import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";
import { useNetworkStore } from "~/store/network";

import LZ_OFT_HELPER_ABI from "./oftHelperAbi";

import type { Token } from "~/types";

export default (getL1Signer: () => Promise<any>) => {
  const status = ref<"not-started" | "processing" | "waiting-for-signature" | "done">("not-started");
  const error = ref<Error | undefined>();
  const transactionHash = ref<string | undefined>();

  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;

  const getEndpointId = (): number => {
    return NETWORK_CONFIG.LAYER_ZERO_CONFIG.l1Eid;
  };

  const toBytes32Address = (address: string): string => {
    return hexZeroPad(getAddress(address), 32);
  };

  const commitTransaction = async (transaction: {
    token: Token;
    amount: BigNumberish;
    from: string;
    to: string;
    nativeFee: BigNumberish;
    gasLimit: BigNumberish;
    gasPrice: BigNumberish;
  }) => {
    try {
      error.value = undefined;
      status.value = "processing";

      // Get signer
      const signer = await getL1Signer();
      if (!signer) throw new Error("Signer is not available");
      if (!transaction.to || !transaction.amount) {
        throw new Error("Invalid transaction parameters");
      }

      const dstChainId = getEndpointId();
      const toAddressBytes32 = toBytes32Address(transaction.to);

      const sendParam = {
        dstEid: dstChainId,
        to: toAddressBytes32,
        amountLD: transaction.amount,
        minAmountLD: transaction.amount,
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
      };

      status.value = "waiting-for-signature";

      const helperContract = new Contract(NETWORK_CONFIG.LAYER_ZERO_CONFIG.oftHelperAddress, LZ_OFT_HELPER_ABI, signer);

      const paymasterParams = utils.getPaymasterParams(NETWORK_CONFIG.L2_GLOBAL_PAYMASTER.address, {
        type: "General",
        innerInput: new Uint8Array(),
      });

      const tx = await helperContract.send(transaction.token.address, sendParam, {
        customData: {
          paymasterParams,
          value: transaction.nativeFee,
        },
        gasLimit: transaction.gasLimit,
        gasPrice: transaction.gasPrice,
      });

      transactionHash.value = tx.hash;
      status.value = "done";
      return tx;
    } catch (err) {
      error.value = err as Error;
      status.value = "not-started";
      throw err;
    }
  };

  return {
    status,
    error,
    transactionHash,
    commitTransaction,
  };
};
