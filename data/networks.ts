import { mainnet, sepolia } from "@wagmi/core/chains";

import Hyperchains from "@/hyperchains/config.json";
import { PUBLIC_L1_CHAINS, type Config } from "@/scripts/hyperchains/common";

import type { Token } from "@/types";
import type { Chain } from "@wagmi/core/chains";

const portalRuntimeConfig = usePortalRuntimeConfig();

export const l1Networks = {
  mainnet: {
    ...mainnet,
    name: "Ethereum",
    network: "mainnet",
  },
  sepolia: {
    ...sepolia,
    name: "Ethereum Sepolia Testnet",
  },
} as const;
export type L1Network = Chain;

export type ZkSyncNetwork = {
  id: number;
  key: string;
  name: string;
  rpcUrl: string;
  hidden?: boolean; // If set to true, the network will not be shown in the network selector
  deprecated?: boolean;
  l1Network?: L1Network;
  blockExplorerUrl?: string;
  blockExplorerApi?: string;
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  displaySettings?: {
    showPartnerLinks?: boolean;
  };
  getTokens?: () => Token[] | Promise<Token[]>; // If blockExplorerApi is specified, tokens will be fetched from there. Otherwise, this function will be used.
};

// See the official documentation on running a local zkSync node: https://era.zksync.io/docs/tools/testing/
// Also see the guide in the README.md file in the root of the repository.

// In-memory node default config. Docs: https://era.zksync.io/docs/tools/testing/era-test-node.html
export const inMemoryNode: ZkSyncNetwork = {
  id: 260,
  key: "in-memory-node",
  name: "In-memory node",
  rpcUrl: "http://localhost:8011",
};

// Dockerized local setup default config. Docs: https://era.zksync.io/docs/tools/testing/dockerized-testing.html
export const dockerizedNode: ZkSyncNetwork = {
  id: 270,
  key: "dockerized-node",
  name: "Dockerized local node",
  rpcUrl: "http://localhost:3050",
  l1Network: {
    id: 9,
    name: "Ethereum Local Node",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: ["http://localhost:8545"] },
      public: { http: ["http://localhost:8545"] },
    },
  },
};

const publicChains: ZkSyncNetwork[] = [
  {
    id: 324,
    key: "mainnet",
    name: "zkSync",
    rpcUrl: "https://mainnet.era.zksync.io",
    blockExplorerUrl: "https://era.zksync.network",
    blockExplorerApi: "https://block-explorer-api.mainnet.zksync.io",
    displaySettings: {
      showPartnerLinks: true,
    },
    l1Network: l1Networks.mainnet,
  },
  {
    id: 300,
    key: "sepolia",
    name: "zkSync Sepolia Testnet",
    rpcUrl: "https://sepolia.era.zksync.dev",
    blockExplorerUrl: "https://sepolia-era.zksync.network",
    blockExplorerApi: "https://block-explorer-api.sepolia.zksync.dev",
    displaySettings: {
      showPartnerLinks: true,
    },
    l1Network: l1Networks.sepolia,
  },
  {
    id: 270,
    key: "stage",
    name: "zkSync Stage",
    rpcUrl: "https://z2-dev-api.zksync.dev",
    blockExplorerUrl: "https://sepolia-beta.staging-scan-v2.zksync.dev",
    blockExplorerApi: "https://block-explorer-api.stage.zksync.dev",
    l1Network: l1Networks.sepolia,
    hidden: true,
  },
];

const getHyperchains = (): ZkSyncNetwork[] => {
  const hyperchains = portalRuntimeConfig.hyperchainsConfig || (Hyperchains as Config);
  return hyperchains.map((e) => {
    const network: ZkSyncNetwork = {
      ...e.network,
      getTokens: () => e.tokens,
    };
    if (e.network.publicL1NetworkId) {
      network.l1Network = PUBLIC_L1_CHAINS.find((chain) => chain.id === e.network.publicL1NetworkId);
      if (!network.l1Network) {
        throw new Error(
          `L1 network with ID ${e.network.publicL1NetworkId} from ${network.name} config wasn't found in the list of public L1 networks.`
        );
      }
    }
    return network;
  });
};

const nodeType = portalRuntimeConfig.nodeType;
const determineChainList = (): ZkSyncNetwork[] => {
  switch (nodeType) {
    case "memory":
      return [inMemoryNode];
    case "dockerized":
      return [dockerizedNode];
    case "hyperchain":
      return getHyperchains();
    default:
      return [...publicChains];
  }
};
export const isCustomNode = !!nodeType;
export const chainList: ZkSyncNetwork[] = determineChainList();
export const defaultNetwork = chainList[0];
