import type { Paymaster, Token } from "~/types";

const SOPH_TOKEN: Token = {
  address: "0x000000000000000000000000000000000000800A",
  l1Address: "0x06c03F9319EBbd84065336240dcc243bda9D8896",
  symbol: "SOPH",
  decimals: 18,
  iconUrl: "/img/sophon.svg",
};

const ETH_TOKEN: Token = {
  address: "0xa02dbfB2b65b4e13501d066Df432A39c6068Eded",
  l1Address: "0x0000000000000000000000000000000000000000",
  symbol: "ETH",
  decimals: 18,
  iconUrl: "/img/eth.svg",
};

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

const GLOBAL_PAYMASTER: Paymaster = {
  address: "0x950e3Bb8C6bab20b56a70550EC037E22032A413e",
};

const MAINNET = {
  SOPH_TOKEN,
  ETH_TOKEN,
  CUSTOM_USDC_TOKEN,
  GLOBAL_PAYMASTER,
  MAINNET_TOKENS: [SOPH_TOKEN, ETH_TOKEN, CUSTOM_USDC_TOKEN],
};

export { MAINNET };
