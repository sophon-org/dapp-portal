import type { Paymaster, Token } from "~/types";

const CUSTOM_USDC_TOKEN: Token = {
  address: "0x9Aa0F72392B5784Ad86c6f3E899bCc053D00Db4F",
  l1Address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  symbol: "USDC",
  name: "USDC",
  decimals: 6,
  iconUrl: "/img/tokens/usdc.svg",
  l1BridgeAddress: "0xf553E6D903AA43420ED7e3bc2313bE9286A8F987",
  l2BridgeAddress: "0x0f44bac3ec514be912aa4359017593b35e868d74",
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
  LAYER_ZERO_CONFIG: {
    sophonEid: 30334,
    l1Eid: 30101, // Ethereum mainnet
    oftHelperAddress: "0x88172F3041Bd0787520dbc9Bd33D3d48e1fb46dc",
  },
  BLACKLISTED_TOKENS: [
    {
      address: "0xbe0ed4138121ecfc5c0e56b40517da27e6c5226b",
      name: "ATH",
      reason: "Cannot bridge L0 tokens for now...",
    },
  ],
};

export { MAINNET };
