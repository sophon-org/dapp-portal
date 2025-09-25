import { $fetch } from "ofetch";

import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import type { Api } from "@/types";

const FETCH_TIME_LIMIT = 180 * 24 * 60 * 60 * 1000; // 180 days (6 months)

export const useZkSyncWithdrawalsStore = defineStore("zkSyncWithdrawals", () => {
  const onboardStore = useOnboardStore();
  const providerStore = useZkSyncProviderStore();
  const transactionStatusStore = useZkSyncTransactionStatusStore();
  const { account, isConnected } = storeToRefs(onboardStore);
  const { eraNetwork } = storeToRefs(providerStore);
  const { userTransactions } = storeToRefs(transactionStatusStore);
  const { destinations } = storeToRefs(useDestinationsStore());

  const updateWithdrawals = async () => {
    if (!isConnected.value) throw new Error("Account is not available");
    if (!eraNetwork.value.blockExplorerApi)
      throw new Error(`Block Explorer API is not available on ${eraNetwork.value.name}`);

    const response: Api.Response.Collection<Api.Response.Transfer> = await $fetch(
      `${eraNetwork.value.blockExplorerApi}/address/${account.value.address}/transfers?type=withdrawal`
    );

    for (const withdrawal of response.items.map(mapApiTransfer)) {
      if (!withdrawal.transactionHash) continue;

      const transactionFromStorage = transactionStatusStore.getTransaction(withdrawal.transactionHash);
      if (transactionFromStorage?.info.completed) continue;

      if (new Date(withdrawal.timestamp).getTime() < Date.now() - FETCH_TIME_LIMIT) break;
      const transactionDetails = await retry(() =>
        providerStore.requestProvider().getTransactionDetails(withdrawal.transactionHash!)
      );

      const withdrawalFinalizationAvailable = !!transactionDetails.ethExecuteTxHash;

      let isFinalized = false;
      if (withdrawalFinalizationAvailable) {
        // Check if this is a USDC withdrawal
        const { selectedNetwork } = storeToRefs(useNetworkStore());
        const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;
        const isUSDCWithdrawal = withdrawal.token?.address === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.address;

        try {
          if (isUSDCWithdrawal) {
            // For USDC, we need to check using the custom bridge contract
            // The issue is that the SDK uses the wrong bridge address for USDC
            // We need to call isWithdrawalFinalized on the correct bridge contract directly
            const publicClient = onboardStore.getPublicClient();
            const customBridgeAddress = NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l1BridgeAddress;

            // Get the withdrawal parameters from the transaction receipt
            const provider = providerStore.requestProvider();
            const receipt = await provider.getTransactionReceipt(withdrawal.transactionHash);
            const l2ToL1Log = receipt?.l2ToL1Logs?.[0];
            if (!l2ToL1Log) {
              throw new Error("No L2ToL1Log found in transaction receipt");
            }

            // Call the isWithdrawalFinalized function on the correct bridge with proper parameters
            isFinalized = await publicClient.readContract({
              address: customBridgeAddress as `0x${string}`,
              abi: [
                {
                  inputs: [
                    { name: "chainId", type: "uint256" },
                    { name: "l2BatchNumber", type: "uint256" },
                    { name: "l2ToL1MessageNumber", type: "uint256" },
                  ],
                  name: "isWithdrawalFinalized",
                  outputs: [{ name: "", type: "bool" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "isWithdrawalFinalized",
              args: [BigInt(eraNetwork.value.id), BigInt(receipt?.l1BatchNumber ?? 0), BigInt(l2ToL1Log.logIndex)],
            });
          } else {
            // For non-USDC tokens, use the regular SDK method
            isFinalized = await useZkSyncWalletStore()
              .getL1VoidSigner(true)
              ?.isWithdrawalFinalized(withdrawal.transactionHash)
              .catch(() => false);
          }
        } catch (error) {
          isFinalized = false;
        }
      }

      if (withdrawalFinalizationAvailable && transactionDetails.status === "failed") {
        isFinalized = false; // Allow claiming again if status is failed
      }

      transactionStatusStore.saveTransaction({
        type: "withdrawal",
        transactionHash: withdrawal.transactionHash,
        timestamp: withdrawal.timestamp,
        token: {
          ...withdrawal.token!,
          amount: BigInt(withdrawal.amount!),
        },
        from: {
          address: withdrawal.from,
          destination: destinations.value.era,
        },
        to: {
          address: withdrawal.to,
          destination: destinations.value.ethereum,
        },
        info: {
          expectedCompleteTimestamp: new Date(
            new Date(withdrawal.timestamp).getTime() + WITHDRAWAL_DELAY
          ).toISOString(),
          completed: isFinalized,
          withdrawalFinalizationAvailable,
        },
      });
    }
  };

  const withdrawalsAvailableForClaiming = computed(() =>
    userTransactions.value.filter(
      (tx) => tx.type === "withdrawal" && !tx.info.completed && tx.info.withdrawalFinalizationAvailable
    )
  );

  const updateWithdrawalsIfPossible = async () => {
    if (!isConnected.value || !eraNetwork.value.blockExplorerApi) {
      return;
    }
    await updateWithdrawals();
  };
  const { reset: resetAutoUpdate, stop: stopAutoUpdate } = useInterval(() => {
    updateWithdrawalsIfPossible();
  }, 60_000);

  onboardStore.subscribeOnAccountChange((account) => {
    if (account) {
      resetAutoUpdate();
      updateWithdrawalsIfPossible();
    } else {
      stopAutoUpdate();
    }
  });

  return {
    withdrawalsAvailableForClaiming,
    updateWithdrawals,
    updateWithdrawalsIfPossible,
  };
});
