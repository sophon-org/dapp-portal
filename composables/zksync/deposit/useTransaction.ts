import { utils, type L1Signer } from "zksync-ethers";

import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import type { DepositFeeValues } from "@/composables/zksync/deposit/useFee";
import type { BigNumberish, BytesLike, ethers, Overrides } from "ethers";
import type { Address } from "zksync-ethers/build/types";

type DepositParams = {
  token: Address;
  amount: BigNumberish;
  to?: Address;
  operatorTip?: BigNumberish;
  bridgeAddress?: Address;
  approveERC20?: boolean;
  approveBaseERC20?: boolean;
  l2GasLimit?: BigNumberish;
  gasPerPubdataByte?: BigNumberish;
  refundRecipient?: Address;
  overrides?: ethers.PayableOverrides;
  approveOverrides?: Overrides;
  approveBaseOverrides?: Overrides;
  customBridgeData?: BytesLike;
};

export default (getL1Signer: () => Promise<L1Signer | undefined>) => {
  const status = ref<"not-started" | "processing" | "waiting-for-signature" | "done">("not-started");
  const error = ref<Error | undefined>();
  const ethTransactionHash = ref<string | undefined>();
  const eraWalletStore = useZkSyncWalletStore();
  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;

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

      // Validate wallet and parameters
      const wallet = await getL1Signer();
      if (!wallet) throw new Error("Wallet is not available");
      if (!transaction.to || !transaction.tokenAddress || !transaction.amount) {
        throw new Error("Invalid transaction parameters");
      }

      // Validate addresses
      await eraWalletStore.walletAddressValidate();
      await validateAddress(transaction.to);

      // Prepare fee overrides
      const overrides = {
        gasPrice: fee.gasPrice,
        gasLimit: transaction.tokenAddress === utils.ETH_ADDRESS ? fee.l1GasLimit : undefined,
        maxFeePerGas: fee.maxFeePerGas,
        maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
      };

      // Clear gasPrice if maxFeePerGas is set
      if (overrides.gasPrice && overrides.maxFeePerGas) {
        overrides.gasPrice = undefined;
      }

      // Prepare deposit parameters
      console.log("transaction.tokenAddress", transaction.tokenAddress);
      console.log("NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l1Address", NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l1Address);
      console.log("transaction.tokenAddress === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l1Address", transaction.tokenAddress === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l1Address);
      const depositParams = {
        to: transaction.to,
        token: transaction.tokenAddress,
        amount: transaction.amount,
        l2GasLimit: fee.l2GasLimit,
        approveBaseERC20: false,
        overrides,
        bridgeAddress:
          transaction.tokenAddress === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l1Address
            ? (NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l1BridgeAddress as Address)
            : undefined,
      } satisfies DepositParams;

      status.value = "waiting-for-signature";
      const depositResponse = await wallet.deposit(depositParams);

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
