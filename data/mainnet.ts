import type { Paymaster, Token } from "~/types";

const CUSTOM_USDC_TOKEN: Token = {
  address: "0x27553b610304b6AB77855a963f8208443D773E60",
  l1Address: "0xBF4FdF7BF4014EA78C0A07259FBc4315Cb10d94E",
  symbol: "CustomUSDC",
  name: "Custom USD coin",
  decimals: 6,
  iconUrl: "/img/usdc.svg",
  l1BridgeAddress: "0x3f842b5FaD08Bac49D0517C975d393f5f466Fd3b",
  l2BridgeAddress: "0x72591d4135B712861d8d4513a2f6860Ac30A684D",
};

const GLOBAL_PAYMASTER: Paymaster = {
  address: "0x950e3Bb8C6bab20b56a70550EC037E22032A413e",
};

const MAINNET = {
  CUSTOM_USDC_TOKEN,
  GLOBAL_PAYMASTER,
  MAINNET_TOKENS: [CUSTOM_USDC_TOKEN],
};

export { MAINNET };
