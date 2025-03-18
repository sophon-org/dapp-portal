import { Alchemy, Network } from "alchemy-sdk";
import { BigNumber } from "ethers";
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

      const tokens: TokenAmount[] = tokenBalances.tokens
        .filter((token) => BigNumber.from(token.rawBalance).gt(0))
        .map((token) => ({
          address: checksumAddress(token.contractAddress),
          symbol: token.symbol || "",
          name: token.name || "",
          decimals: token.decimals || 18,
          iconUrl: token.logo || undefined,
          amount: token.rawBalance || "0",
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
        amount: ethBalance.toString(),
      });

      return tokens;
    },
    { cache: false }
  );

  const deductBalance = (tokenL1Address: string, amount: string) => {
    if (!balance.value) return;
    const tokenBalance = balance.value.find((balance) => balance.address === tokenL1Address);
    if (!tokenBalance) return;
    const newBalance = BigNumber.from(tokenBalance.amount).sub(amount);
    tokenBalance.amount = newBalance.isNegative() ? "0" : newBalance.toString();
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
