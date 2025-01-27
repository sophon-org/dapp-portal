const LZ_OFT_HELPER_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "oftContract", type: "address" },
      { indexed: true, name: "isEnabled", type: "bool" },
    ],
    name: "ToggleOFTContract",
    type: "event",
  },
  {
    inputs: [
      { name: "oftContract", type: "address" },
      { name: "isEnabled", type: "bool" },
    ],
    name: "toggleOFTContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "oftContract", type: "address" },
      {
        components: [
          { name: "dstEid", type: "uint32" },
          { name: "to", type: "bytes32" },
          { name: "amountLD", type: "uint256" },
          { name: "minAmountLD", type: "uint256" },
          { name: "extraOptions", type: "bytes" },
          { name: "composeMsg", type: "bytes" },
          { name: "oftCmd", type: "bytes" },
        ],
        name: "_sendParam",
        type: "tuple",
      },
    ],
    name: "send",
    outputs: [
      {
        components: [
          { name: "msgId", type: "bytes32" },
          { name: "nativeFee", type: "uint256" },
        ],
        name: "msgReceipt",
        type: "tuple",
      },
      {
        components: [
          { name: "amountDebitLD", type: "uint256" },
          { name: "amountCreditLD", type: "uint256" },
        ],
        name: "oftReceipt",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "oftContract", type: "address" },
      {
        components: [
          { name: "dstEid", type: "uint32" },
          { name: "to", type: "bytes32" },
          { name: "amountLD", type: "uint256" },
          { name: "minAmountLD", type: "uint256" },
          { name: "extraOptions", type: "bytes" },
          { name: "composeMsg", type: "bytes" },
          { name: "oftCmd", type: "bytes" },
        ],
        name: "_sendParam",
        type: "tuple",
      },
    ],
    name: "quoteSend",
    outputs: [
      {
        components: [{ name: "nativeFee", type: "uint256" }],
        name: "msgFee",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_addr", type: "address" }],
    name: "addressToBytes32",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "allowedOFTs",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

export default LZ_OFT_HELPER_ABI;
