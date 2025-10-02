export type CustomBridgeToken = {
  chainId: number;
  l1Address: string;
  l2Address: string;
  symbol: string;
  bridgedSymbol: string;
  decimals: number;
  name?: string;
  bridgingDisabled?: true;
  hideAlertMessage?: true;
  learnMoreUrl?: string;
  l1BridgeAddress?: string;
  l2BridgeAddress?: string;
  bridges: {
    label: string;
    iconUrl: string;
    depositUrl?: string;
    withdrawUrl?: string;
  }[];
};

export const customBridgeTokens: CustomBridgeToken[] = [
  {
    chainId: 1,
    l1Address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    l2Address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    learnMoreUrl: "https://www.circle.com/blog/native-usdc-now-available-on-zksync",
    bridges: [],
    symbol: "USDC",
    bridgedSymbol: "USDC.e",
    name: "USD Coin",
    decimals: 6,
  },
];
