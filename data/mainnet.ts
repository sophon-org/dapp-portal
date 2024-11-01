import type { Paymaster, Token } from "~/types";

const CUSTOM_USDC_TOKEN: Token = {
  address: "0x6386dA73545ae4E2B2E0393688fA8B65Bb9a7169",
  l1Address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  symbol: "USDC",
  name: "USDC",
  decimals: 6,
  iconUrl: "/img/usdc.svg",
  l1BridgeAddress: "0x3f842b5FaD08Bac49D0517C975d393f5f466Fd3b",
  l2BridgeAddress: "0x72591d4135B712861d8d4513a2f6860Ac30A684D",
};

const L1_GLOBAL_PAYMASTER: Paymaster = {
  address: "0xC97F5f2FDE4fe6e220069F8D3718bE4FaC7C00f0",
};

const L2_GLOBAL_PAYMASTER: Paymaster = {
  address: "0x98546B226dbbA8230cf620635a1e4ab01F6A99B2",
};

const MAINNET = {
  CUSTOM_USDC_TOKEN,
  L1_GLOBAL_PAYMASTER,
  L2_GLOBAL_PAYMASTER,
  MAINNET_TOKENS: [CUSTOM_USDC_TOKEN],
};

export { MAINNET };
