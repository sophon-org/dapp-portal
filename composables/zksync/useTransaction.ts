import { useMemoize } from "@vueuse/core";
import { type BigNumberish } from "ethers";
import { utils } from "zksync-ethers";

import { isCustomNode } from "@/data/networks";
import { MOCK_USDC_TOKEN } from "~/data/mandatoryTokens";
import { GLOBAL_PAYMASTER } from "~/data/paymasters";

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
      if (!signer) throw new Error("zkSync Signer is not available");
      const provider = getProvider();

      const getRequiredBridgeAddress = async () => {
        if (transaction.tokenAddress === L2_BASE_TOKEN_ADDRESS) return undefined;
        const bridgeAddresses = await retrieveBridgeAddresses();
        return bridgeAddresses.sharedL2;
      };
      let bridgeAddress;
      let nonce;
      if (transaction.type === "withdrawal") {
        if (transaction.tokenAddress === MOCK_USDC_TOKEN.address) {
          bridgeAddress = MOCK_USDC_TOKEN.l2BridgeAddress!;
          nonce = await provider.getTransactionCount(await signer.getAddress(), "pending");
        } else {
          bridgeAddress = await getRequiredBridgeAddress();
        }
      }

      await eraWalletStore.walletAddressValidate();
      await validateAddress(transaction.to);

      status.value = "waiting-for-signature";
      const txRequest = await provider[transaction.type === "transfer" ? "getTransferTx" : "getWithdrawTx"]({
        from: await signer.getAddress(),
        to: transaction.to,
        token: transaction.tokenAddress,
        amount: transaction.amount,
        bridgeAddress,
        paymasterParams: utils.getPaymasterParams(GLOBAL_PAYMASTER.address, {
          type: "General",
          innerInput: new Uint8Array(),
        }),
        overrides: {
          gasPrice: fee.gasPrice,
          gasLimit: fee.gasLimit,
          nonce,
        },
      });

      const txResponse = await signer.sendTransaction(txRequest);
      const tx = getProvider()._wrapTransaction(txResponse);

      transactionHash.value = tx.hash;
      status.value = "done";

      return tx;
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
