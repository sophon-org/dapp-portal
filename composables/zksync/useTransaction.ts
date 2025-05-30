import { useMemoize } from "@vueuse/core";
import { type BigNumberish } from "ethers";
import { utils } from "zksync-ethers";

import { isCustomNode } from "@/data/networks";
import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import type { TokenAmount } from "@/types";
import type { Provider, Signer } from "zksync-ethers";

type TransactionParams = {
  type: "transfer" | "withdrawal";
  to: string;
  tokenAddress: string;
  amount: BigNumberish;
};

export const isWithdrawalManualFinalizationRequired = (_token: TokenAmount, l1NetworkId: number) => {
  return l1NetworkId === 1 || isCustomNode;
};

export default (getSigner: () => Promise<Signer | undefined>, getProvider: () => Provider) => {
  const status = ref<"not-started" | "processing" | "waiting-for-signature" | "done">("not-started");
  const error = ref<Error | undefined>();
  const transactionHash = ref<string | undefined>();
  const eraWalletStore = useZkSyncWalletStore();
  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;

  const retrieveBridgeAddresses = useMemoize(() => getProvider().getDefaultBridgeAddresses());
  const { validateAddress } = useScreening();

  const commitTransaction = async (
    transaction: TransactionParams,
    fee: { gasPrice: BigNumberish; gasLimit: BigNumberish }
  ) => {
    try {
      error.value = undefined;

      status.value = "processing";
      const signer = await getSigner();
      if (!signer) throw new Error("ZKsync Signer is not available");
      const provider = getProvider();

      const getRequiredBridgeAddress = async () => {
        if (transaction.tokenAddress === L2_BASE_TOKEN_ADDRESS) return undefined;
        const bridgeAddresses = await retrieveBridgeAddresses();
        return bridgeAddresses.sharedL2;
      };
      let bridgeAddress;
      let nonce;
      if (transaction.type === "withdrawal") {
        if (transaction.tokenAddress === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.address) {
          bridgeAddress = NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l2BridgeAddress!;
          nonce = await provider.getTransactionCount(await signer.getAddress(), "pending");
        } else {
          bridgeAddress = await getRequiredBridgeAddress();
        }
      }

      await eraWalletStore.walletAddressValidate();
      await validateAddress(transaction.to);

      status.value = "waiting-for-signature";

      // Don't use paymaster for SOPH token transfers/withdrawals
      const usePaymaster = transaction.tokenAddress !== L2_BASE_TOKEN_ADDRESS;

      const txRequest = await provider[transaction.type === "transfer" ? "getTransferTx" : "getWithdrawTx"]({
        from: await signer.getAddress(),
        to: transaction.to,
        token: transaction.tokenAddress,
        amount: transaction.amount,
        bridgeAddress,
        paymasterParams: usePaymaster
          ? utils.getPaymasterParams(NETWORK_CONFIG.L2_GLOBAL_PAYMASTER.address, {
              type: "General",
              innerInput: new Uint8Array(),
            })
          : undefined,
        overrides: {
          gasPrice: fee.gasPrice,
          gasLimit: fee.gasLimit,
          nonce,
        },
      });

      const txResponse = await signer.sendTransaction(txRequest);

      transactionHash.value = txResponse.hash;
      status.value = "done";

      return txResponse;
    } catch (err) {
      error.value = formatError(err as Error);
      status.value = "not-started";
    }
  };

  return {
    status,
    error,
    transactionHash,
    commitTransaction,
  };
};
