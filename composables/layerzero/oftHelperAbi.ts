// LzOftHelper ABI
const LZ_OFT_HELPER_ABI = [
  {
    name: "quoteSendToL1",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_token", type: "address" },
      { name: "_dstChainId", type: "uint16" },
      { name: "_toAddress", type: "bytes32" },
      { name: "_amount", type: "uint" },
    ],
    outputs: [
      { name: "nativeFee", type: "uint" },
      { name: "zroFee", type: "uint" },
    ],
  },
  {
    name: "sendToL1",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_token", type: "address" },
      { name: "_dstChainId", type: "uint16" },
      { name: "_toAddress", type: "bytes32" },
      { name: "_amount", type: "uint" },
      { name: "_refundAddress", type: "address" },
      { name: "_zroPaymentAddress", type: "address" },
      { name: "_adapterParams", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export default LZ_OFT_HELPER_ABI;
