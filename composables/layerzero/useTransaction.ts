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

const HELPER_ADDRESS = "0x88172F3041Bd0787520dbc9Bd33D3d48e1fb46dc";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default (getL1Signer: () => Promise<any>) => {
  const status = ref<"not-started" | "processing" | "waiting-for-signature" | "done">("not-started");
  const error = ref<Error | undefined>();
  const transactionHash = ref<string | undefined>();

  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;

  const getEndpointId = (): number => {
    return 30101; // Ethereum mainnet
  };

  const toBytes32Address = (address: string): string => {
    return hexZeroPad(getAddress(address), 32);
  };

  const commitTransaction = async (transaction: {
    token: Token;
    amount: BigNumberish;
    fromChainId: number;
    toChainId: number;
    from: string;
    to: string;
    nativeFee: BigNumberish;
  }) => {
    try {
      error.value = undefined;
      status.value = "processing";

      // Get signer
      const wallet = await getL1Signer();
      if (!wallet) throw new Error("Wallet is not available");
      if (!transaction.to || !transaction.amount) {
        throw new Error("Invalid transaction parameters");
      }

      const dstChainId = getEndpointId();
      const toAddressBytes32 = toBytes32Address(transaction.to);

      // Default adapter params (can be customized if needed)
      const adapterParams = "0x"; // We'll need to implement proper adapter params later

      status.value = "waiting-for-signature";

      // L2 to L1
      const helperContract = new Contract(HELPER_ADDRESS, LZ_OFT_HELPER_ABI, wallet);

      // Add paymaster params for L2 transactions
      const paymasterParams = utils.getPaymasterParams(NETWORK_CONFIG.L2_GLOBAL_PAYMASTER.address, {
        type: "General",
        innerInput: new Uint8Array(),
      });

      const tx = await helperContract.sendToL1(
        transaction.token.address,
        dstChainId,
        toAddressBytes32,
        transaction.amount,
        transaction.from,
        ZERO_ADDRESS,
        adapterParams,
        {
          value: transaction.nativeFee,
          customData: {
            paymasterParams,
          },
        }
      );

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
