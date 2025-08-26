import { createPrividiumChain } from "test-prividium-sdk";

import type { Transport } from "@wagmi/core";

const prividiumTestnetInstance = createPrividiumChain({
  chain: {
    id: 270,
    name: "Prividium Local",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  clientId: "portal",
  rpcUrl: "http://localhost:8001",
  authBaseUrl: "http://localhost:3002",
  permissionsApiBaseUrl: "http://localhost:8000",
  redirectUrl: `${window.location.origin}/callback`,
  scope: ["wallet:required"],
  onAuthExpiry: () => {
    const prividiumStore = usePrividiumStore();
    prividiumStore.onAuthExpiry();
  },
});

export const getPrividiumInstance = (chainId: number) => {
  if (chainId === prividiumTestnetInstance.chain.id) return prividiumTestnetInstance;
  return null;
};

export const getPrividiumTransport = (chainId: number): Transport | null => {
  if (chainId === prividiumTestnetInstance.chain.id) return prividiumTestnetInstance.transport as Transport;
  return null;
};
