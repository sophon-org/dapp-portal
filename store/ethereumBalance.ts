import { Alchemy, Network } from "alchemy-sdk";
import { utils } from "zksync-ethers";

import { l1Networks } from "@/data/networks";

import type { TokenAmount } from "@/types";

export const useEthereumBalanceStore = defineStore("ethereumBalance", () => {
  const portalRuntimeConfig = usePortalRuntimeConfig();
  const { l1Network } = storeToRefs(useNetworkStore());

  const onboardStore = useOnboardStore();
  const { account } = storeToRefs(onboardStore);
  const { eraNetwork } = storeToRefs(useZkSyncProviderStore());

  const alchemyApiKey = portalRuntimeConfig.alchemyApiKey ?? l1Network.value?.rpcUrls.public.http[0].split("/").pop();

  const {
    result: balance,
    inProgress: balanceInProgress,
    error: balanceError,
    execute: requestBalance,
    reset: resetBalance,
  } = usePromise<TokenAmount[]>(
    async () => {
      if (!account.value.address) throw new Error("Account is not available");
      if (!eraNetwork.value.l1Network) throw new Error(`L1 network is not available on ${eraNetwork.value.name}`);
      if (!alchemyApiKey) throw new Error("Alchemy API key is not available");

      const networkIdToAlchemy = new Map<number, Network>([
        [l1Networks.mainnet.id, Network.ETH_MAINNET],
        [l1Networks.sepolia.id, Network.ETH_SEPOLIA],
      ]);

      const configTokens = (await eraNetwork.value.getTokens?.()) ?? [];

      if (!networkIdToAlchemy.has(eraNetwork.value.l1Network.id)) {
        throw new Error(`Alchemy does not support ${eraNetwork.value.l1Network.name}`);
      }

      const alchemy = new Alchemy({
        apiKey: alchemyApiKey,
        network: networkIdToAlchemy.get(eraNetwork.value.l1Network.id)!,
      });

      const [tokenBalances, ethBalance] = await Promise.all([
        alchemy.core.getTokensForOwner(account.value.address),
        alchemy.core.getBalance(account.value.address),
      ]);

      let pageKey = tokenBalances.pageKey;

      // Loop up to 2 more times to fetch subsequent pages if a pageKey exists
      for (let i = 0; i < 2 && pageKey; i++) {
        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 250));
        const nextTokenBalances = await alchemy.core.getTokensForOwner(account.value.address, {
          pageKey,
        });
        tokenBalances.tokens.push(...nextTokenBalances.tokens);
        pageKey = nextTokenBalances.pageKey;
      }

      const tokens: TokenAmount[] = tokenBalances.tokens
        .filter((token) => BigInt(token.rawBalance || "0") > 0n)
        .map((token) => ({
          address: checksumAddress(token.contractAddress),
          symbol: token.symbol || "",
          name: token.name || "",
          decimals: token.decimals || 18,
          iconUrl: token.logo || undefined,
          amount: BigInt(token.rawBalance || 0n),
          isOft: !!configTokens.find(
            (e) => e.l1Address?.toLowerCase() === token.contractAddress.toLowerCase() && e.isOft
          ),
        }));

      // Add ETH balance
      tokens.unshift({
        address: utils.ETH_ADDRESS,
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
        amount: ethBalance.toBigInt(),
      });

      return tokens;
    },
    { cache: false }
  );

  const deductBalance = (tokenL1Address: string, amount: string) => {
    if (!balance.value) return;
    const tokenBalance = balance.value.find((balance) => balance.address === tokenL1Address);
    if (!tokenBalance) return;
    const newBalance = BigInt(tokenBalance.amount) - BigInt(amount);
    tokenBalance.amount = newBalance < 0n ? 0n : newBalance;
  };

  onboardStore.subscribeOnAccountChange(() => {
    resetBalance();
  });

  return {
    balance,
    balanceInProgress,
    balanceError,
    requestBalance,

    deductBalance,
  };
});
