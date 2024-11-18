import type { Paymaster, Token } from "~/types";

const CUSTOM_USDC_TOKEN: Token = {
  address: "0x27553b610304b6AB77855a963f8208443D773E60",
  l1Address: "0xBF4FdF7BF4014EA78C0A07259FBc4315Cb10d94E",
  symbol: "MockUSDC",
  name: "Mock USD coin",
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

const TESTNET = {
  CUSTOM_USDC_TOKEN,
  L1_GLOBAL_PAYMASTER,
  L2_GLOBAL_PAYMASTER,
  TOKENS: [CUSTOM_USDC_TOKEN],
};

export { TESTNET };
