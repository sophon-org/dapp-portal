import { ethers } from "ethers";
import { type Hash } from "viem";

import { useOnboardStore } from "~/store/onboard";

import { OFT } from "./oftAbi";

import type { TransactionInfo } from "~/store/zksync/transactionStatus";

export default (transactionInfo: ComputedRef<TransactionInfo>) => {
  const status = ref<"not-started" | "processing" | "completed" | "failed">("not-started");
  const error = ref<Error | undefined>();
  const l1TransactionHash = ref<Hash | undefined>();

  const walletStore = useZkSyncWalletStore();
  const onboardStore = useOnboardStore();

  const checkTransactionStatus = async () => {
    try {
      status.value = "processing";
      error.value = undefined;

      // Get L2 transaction receipt
      const publicClient = onboardStore.getPublicClient();
      if (!publicClient) throw new Error("Public client not available");

      const l1Signer = await walletStore.getL1Signer();

      // Create contract instance for the token on L1
      const tokenContract = new ethers.Contract(transactionInfo.value.token.l1Address!, OFT, l1Signer);

      // Poll for Transfer event
      const pollInterval = 15000; // 15 seconds
      const maxAttempts = 40; // 10 minutes total
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          // TODO: get the latest block number? limit to 24 hours of blocks

          // Look for Transfer events in the last few blocks
          const events = await tokenContract.queryFilter(
            tokenContract.filters.Transfer(
              "0x0000000000000000000000000000000000000000",
              transactionInfo.value.to.address
            )
          );

          // Check if we find a matching transfer
          const matchingTransfer = events.find((event) => {
            if (!event.args?.value) return false;
            const amount = ethers.BigNumber.from(event.args.value);
            const expectedAmount = ethers.BigNumber.from(transactionInfo.value.token.amount);
            return amount.eq(expectedAmount);
          });

          if (matchingTransfer) {
            l1TransactionHash.value = matchingTransfer.transactionHash as Hash;
            status.value = "completed";
            return;
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Error checking L1 transfer:", err);
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        attempts++;
      }

      if (status.value !== "completed") {
        error.value = new Error("Timeout waiting for L1 transfer confirmation");
      }
    } catch (err) {
      error.value = err as Error;
      status.value = "failed";
    }
  };

  // Start checking status when the composable is created
  if (transactionInfo.value.token.isOft) {
    checkTransactionStatus();
  }

  return {
    status,
    error,
    l1TransactionHash,
    checkTransactionStatus,
  };
};
