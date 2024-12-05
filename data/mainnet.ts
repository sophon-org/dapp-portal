import type { Paymaster, Token } from "~/types";

const CUSTOM_USDC_TOKEN: Token = {
  address: "0x9Aa0F72392B5784Ad86c6f3E899bCc053D00Db4F",
  l1Address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  symbol: "USDC",
  name: "USDC",
  decimals: 6,
  iconUrl: "/img/usdc.svg",
  l1BridgeAddress: "0x2bCE548a1B3113C7f886cb211a9086e748aa41ba",
  l2BridgeAddress: "0xabac09b9de2e4b8dff2062eb1d30d3e4b19a8444",
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
  TOKENS: [CUSTOM_USDC_TOKEN],
};

export { MAINNET };
