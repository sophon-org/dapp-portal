import { useStorage } from "@vueuse/core";
import { getBalance } from "@wagmi/core";
import { utils } from "zksync-ethers";

import { l1Networks } from "@/data/networks";
import { wagmiConfig } from "@/data/wagmi";

import type { Hash, Token, TokenAmount } from "@/types";

export const useZkSyncEthereumBalanceStore = defineStore("zkSyncEthereumBalances", () => {
  const portalRuntimeConfig = usePortalRuntimeConfig();

  const onboardStore = useOnboardStore();
  const ethereumBalancesStore = useEthereumBalanceStore();
  const tokensStore = useZkSyncTokensStore();
  const { l1Network, selectedNetwork } = storeToRefs(useNetworkStore());
  const { account } = storeToRefs(onboardStore);
  const { balance: ethereumBalance } = storeToRefs(ethereumBalancesStore);
  const { l1Tokens } = storeToRefs(tokensStore);
  const additionalTokenAddresses = useStorage<string[]>("additionalTokenAddresses", []);

  const getBalancesFromApi = async (): Promise<TokenAmount[]> => {
    await Promise.all([ethereumBalancesStore.requestBalance(), tokensStore.requestTokens()]);

    if (!ethereumBalance.value) throw new Error("Ethereum balances are not available");

    // Get balances from Ankr API and merge them with tokens data from explorer
    return [
      ...ethereumBalance.value.map((e) => {
        const tokenFromExplorer = l1Tokens.value?.[e.address];
        return {
          ...e,
          symbol: tokenFromExplorer?.symbol ?? e.symbol,
          name: tokenFromExplorer?.name ?? e.name,
          iconUrl: tokenFromExplorer?.iconUrl ?? e.iconUrl,
          price: tokenFromExplorer?.price ?? e.price,
        };
      }),
      ...Object.values(l1Tokens.value ?? []) // Add tokens that are not in Ankr API
        .filter((token) => !ethereumBalance.value?.find((e) => e.address === token.address))
        .map((e) => ({
          ...e,
          amount: 0n,
        })),
    ].sort((a, b) => {
      if (a.address.toUpperCase() === utils.ETH_ADDRESS.toUpperCase()) return -1; // Always bring ETH to the beginning
      if (b.address.toUpperCase() === utils.ETH_ADDRESS.toUpperCase()) return 1; // Keep ETH at the beginning if comparing with any other token
      return 0; // Keep other tokens' order unchanged
    });
  };
  const getBalancesFromRPC = async (): Promise<TokenAmount[]> => {
    await tokensStore.requestTokens();
    if (!l1Tokens.value) throw new Error("Tokens are not available");
    if (!account.value.address) throw new Error("Account is not available");

    const baseTokens = Object.values(l1Tokens.value ?? []);
    const additionalTokens =
      additionalTokenAddresses.value.length > 0
        ? additionalTokenAddresses.value.map((address) => ({ address } as Token))
        : [];

    const allTokens = [...baseTokens, ...additionalTokens];

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const getBalanceWithRetry = async (
      config: typeof wagmiConfig,
      params: Parameters<typeof getBalance>[1],
      retries = 3,
      backoff = 1000
    ) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await getBalance(config, params);
        } catch (error) {
          if (i === retries - 1) throw error;
          await delay(backoff);
          backoff *= 2;
        }
      }
    };

    return await Promise.all(
      allTokens.map(async (token) => {
        try {
          const balance = await getBalanceWithRetry(wagmiConfig, {
            address: account.value.address!,
            chainId: l1Network.value!.id,
            token:
              token.address.toUpperCase() === utils.ETH_ADDRESS.toUpperCase() ? undefined : (token.address! as Hash),
          });

          if (!balance) {
            throw new Error(`Balance for token ${token.symbol} is undefined`);
          }

          return {
            ...token,
            symbol: token.symbol ?? balance.symbol,
            decimals: token.decimals ?? balance.decimals,
            amount: balance.value,
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to fetch ${token.symbol} balance after retries:`, error);
          return {
            ...token,
            amount: 0n,
          };
        }
      })
    );
  };
  const {
    result: balance,
    inProgress: balanceInProgress,
    error: balanceError,
    execute: requestBalance,
    reset: resetBalance,
  } = usePromise<TokenAmount[]>(
    async () => {
      if (!l1Network.value) throw new Error(`L1 network is not available on ${selectedNetwork.value.name}`);

      const alchemyApiKey =
        portalRuntimeConfig.alchemyApiKey ?? l1Network.value?.rpcUrls.public.http[0].split("/").pop();

      if (([l1Networks.mainnet.id, l1Networks.sepolia.id] as number[]).includes(l1Network.value?.id) && alchemyApiKey) {
        return await getBalancesFromApi();
      } else {
        return await getBalancesFromRPC();
      }
    },
    { cache: 30000 }
  );

  onboardStore.subscribeOnAccountChange(() => {
    resetBalance();
  });

  return {
    balance,
    balanceInProgress,
    balanceError,
    requestBalance,

    deductBalance: ethereumBalancesStore.deductBalance,
  };
});
