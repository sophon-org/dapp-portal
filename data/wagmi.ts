import { fallback, http } from "@wagmi/core";
import { zkSync, type Chain, zkSyncSepoliaTestnet, sophonTestnet, sophon } from "@wagmi/core/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi";

import { chainList, l1Networks, type ZkSyncNetwork } from "@/data/networks";

import "@sophon-labs/account-eip6963/testnet";
import "@sophon-labs/account-eip6963/mainnet";

const portalRuntimeConfig = usePortalRuntimeConfig();

const metadata = {
  name: "zkSync Portal",
  description: "zkSync Portal - view balances, transfer and bridge tokens",
  url: "https://portal.zksync.io",
  icons: ["https://portal.zksync.io/icon.png"],
};

if (!portalRuntimeConfig.walletConnectProjectId) {
  throw new Error("WALLET_CONNECT_PROJECT_ID is not set. Please set it in .env file");
}

const useExistingEraChain = (network: ZkSyncNetwork) => {
  const existingNetworks = [zkSync, zkSyncSepoliaTestnet];
  return existingNetworks.find((existingNetwork) => existingNetwork.id === network.id);
};
const formatZkSyncChain = (network: ZkSyncNetwork) => {
  return {
    id: network.id,
    name: network.name,
    network: network.key,
    nativeCurrency: network.nativeCurrency || { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [network.rpcUrl] },
      public: { http: [network.rpcUrl] },
    },
    blockExplorers: network.blockExplorerUrl
      ? {
          default: {
            name: "Explorer",
            url: network.blockExplorerUrl,
          },
        }
      : undefined,
  };
};

const getAllChains = () => {
  const chains: Chain[] = [sophonTestnet, sophon];
  const addUniqueChain = (chain: Chain) => {
    if (!chains.some((existingChain) => existingChain.id === chain.id)) {
      chains.push(chain);
    }
  };

  for (const network of chainList) {
    addUniqueChain(useExistingEraChain(network) ?? formatZkSyncChain(network));
    if (network.l1Network) {
      addUniqueChain(network.l1Network);
    }
  }

  return chains;
};

const chains = getAllChains();

export const wagmiConfig = defaultWagmiConfig({
  chains: [sophonTestnet, sophon],
  transports: Object.fromEntries(
    chains.map((chain) => [chain.id, fallback(chain.rpcUrls.default.http.map((e) => http(e)))])
  ),
  projectId: portalRuntimeConfig.walletConnectProjectId,
  metadata,
  enableCoinbase: false,
  enableEIP6963: true,
  // enableInjected: true,
});

export const wagmiL1Config = defaultWagmiConfig({
  chains: [l1Networks.mainnet],
  transports: Object.fromEntries([
    [l1Networks.mainnet.id, fallback(l1Networks.mainnet.rpcUrls.default.http.map((e) => http(e)))],
  ]),
  projectId: portalRuntimeConfig.walletConnectProjectId,
  metadata,
  enableCoinbase: false,
  enableEIP6963: true,
  enableInjected: true,
});
