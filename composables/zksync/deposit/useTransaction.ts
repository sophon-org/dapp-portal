import type { DepositFeeValues } from "@/composables/zksync/deposit/useFee";
import type { BigNumberish } from "ethers";
import type { L1Signer } from "zksync-ethers";

export default (getL1Signer: () => Promise<L1Signer | undefined>) => {
  const status = ref<"not-started" | "processing" | "waiting-for-signature" | "done">("not-started");
  const error = ref<Error | undefined>();
  const ethTransactionHash = ref<string | undefined>();
  const eraWalletStore = useZkSyncWalletStore();

  const { validateAddress } = useScreening();

  const commitTransaction = async (
    transaction: {
      to: string;
      tokenAddress: string;
      amount: BigNumberish;
    },
    fee: DepositFeeValues
  ) => {
    try {
      error.value = undefined;

      status.value = "processing";
      const wallet = await getL1Signer();
      if (!wallet) throw new Error("Wallet is not available");

      await eraWalletStore.walletAddressValidate();
      await validateAddress(transaction.to);

      const overrides = {
        gasPrice: fee.gasPrice,
        gasLimit: fee.l1GasLimit,
        maxFeePerGas: fee.maxFeePerGas,
        maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
      };
      if (overrides.gasPrice && overrides.maxFeePerGas) {
        overrides.gasPrice = undefined;
      }

      status.value = "waiting-for-signature";
      let depositResponse;
      if (transaction.tokenAddress == "0xBF4FdF7BF4014EA78C0A07259FBc4315Cb10d94E") {
        depositResponse = await wallet.deposit({
          to: transaction.to,
          token: transaction.tokenAddress,
          amount: transaction.amount,
          l2GasLimit: fee.l2GasLimit,
          approveBaseERC20: false,
          bridgeAddress: "0x3f842b5FaD08Bac49D0517C975d393f5f466Fd3b",
          overrides,
        });
      } else {
        depositResponse = await wallet.deposit({
          to: transaction.to,
          token: transaction.tokenAddress,
          amount: transaction.amount,
          l2GasLimit: fee.l2GasLimit,
          approveBaseERC20: false,
          overrides,
        });
      }

      ethTransactionHash.value = depositResponse.hash;
      status.value = "done";
      return depositResponse;
    } catch (err) {
      error.value = formatError(err as Error);
      status.value = "not-started";
    }
  };

  return {
    status,
    error,
    ethTransactionHash,
    commitTransaction,
  };
};
