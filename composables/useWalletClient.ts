import { getWalletClient } from "@wagmi/core";
import { ref, onMounted } from "vue";

import { wagmiConfig } from "@/data/wagmi";

import type { WalletClient } from "viem";

export function useWalletClient() {
  const walletClient = ref<WalletClient | null>(null);

  onMounted(async () => {
    try {
      walletClient.value = await getWalletClient(wagmiConfig);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get wallet client:", error);
    }
  });

  return walletClient;
}
