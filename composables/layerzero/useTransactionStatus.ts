import { type Hash } from "viem";
import { ref, type ComputedRef } from "vue";

import type { TransactionInfo } from "~/store/zksync/transactionStatus";

const LAYERZERO_SCAN_API = "https://scan.layerzero-api.com/v1";
const POLL_INTERVAL = 15000; // 15 seconds
const MAX_ATTEMPTS = 40; // 10 minutes total

interface LayerZeroTransaction {
  pathway: {
    srcEid: number;
    dstEid: number;
    sender: {
      address: string;
      chain: string;
    };
    receiver: {
      address: string;
      chain: string;
    };
  };
  source: {
    status: string;
    tx: {
      txHash: string;
      blockNumber: string;
      from: string;
    };
  };
  destination: {
    status: string;
    tx?: {
      txHash: string;
    };
  };
  verification: {
    dvn: {
      status: string;
    };
    sealer: {
      status: string;
    };
  };
}

interface LayerZeroApiResponse {
  data: LayerZeroTransaction[];
}

export default (transactionInfo: ComputedRef<TransactionInfo>) => {
  const status = ref<"not-started" | "processing" | "completed" | "failed">("not-started");
  const error = ref<Error | undefined>();
  const l1TransactionHash = ref<Hash | undefined>();

  const checkLzScanApi = async (txHash: string) => {
    const response = await fetch(`${LAYERZERO_SCAN_API}/messages/tx/${txHash}`);
    if (!response.ok) {
      throw new Error(`LayerZero API error: ${response.statusText}`);
    }
    const { data }: LayerZeroApiResponse = await response.json();

    if (!data?.length) {
      return null;
    }

    const transaction = data[0];

    // Check overall status
    if (transaction.destination.status === "SUCCEEDED" && transaction.destination.tx?.txHash) {
      return {
        status: "completed" as const,
        hash: transaction.destination.tx.txHash as Hash,
      };
    }

    if (transaction.source.status === "FAILED" || transaction.destination.status === "FAILED") {
      throw new Error("LayerZero message delivery failed");
    }
    // Still in progress
    return null;
  };

  const checkTransactionStatus = async () => {
    try {
      status.value = "processing";
      error.value = undefined;
      let attempts = 0;

      while (attempts < MAX_ATTEMPTS) {
        try {
          const result = await checkLzScanApi(transactionInfo.value.transactionHash);
          if (result) {
            l1TransactionHash.value = result.hash;
            status.value = result.status;
            return;
          }

          // If we get here, the transaction is still pending
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          attempts++;
        } catch (err) {
          if (attempts === MAX_ATTEMPTS - 1) {
            throw err;
          }
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }
      }

      throw new Error("Timeout waiting for LayerZero message delivery");
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
