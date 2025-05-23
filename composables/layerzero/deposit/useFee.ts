import { parseEther } from "ethers";
import { type Address, getAddress, pad } from "viem";
import { utils } from "zksync-ethers";

import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import OFT_ABI from "./abi";

import type { BigNumberish } from "ethers";
import type { Token, TokenAmount } from "~/types";

export type LayerZeroFeeValues = {
  nativeFee: bigint;
  lzTokenFee: bigint;
};

export type DepositFeeValues = {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
  baseCost?: bigint;
  l1GasLimit: bigint;
  l2GasLimit?: bigint;
};

export default (tokens: Ref<Token[]>, balances: Ref<TokenAmount[] | undefined>) => {
  const onboardStore = useOnboardStore();

  let params = {
    token: undefined as TokenAmount | undefined,
    to: undefined as Address | undefined,
  };

  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;

  const quoteFee = ref<bigint | undefined>();
  const gasFee = ref<DepositFeeValues | undefined>();
  const recommendedBalance = ref<BigNumberish | undefined>();

  const feeToken = computed(() => {
    return tokens.value.find((e) => e.address === utils.ETH_ADDRESS);
  });

  const enoughBalanceToCoverFee = computed(() => {
    if (!feeToken.value || !balances.value || inProgress.value) {
      return true;
    }
    const feeTokenBalance = balances.value.find((e) => e.address === feeToken.value!.address);
    if (!feeTokenBalance) return true;
    if (totalFee.value && BigInt(totalFee.value) > feeTokenBalance.amount) {
      return false;
    }
    return true;
  });

  const getEndpointId = (): number => {
    return NETWORK_CONFIG.LAYER_ZERO_CONFIG.sophonEid;
  };

  const getGasPrice = async () => {
    return (BigInt(await retry(() => onboardStore.getPublicClient().getGasPrice())) * 110n) / 100n;
  };

  const {
    inProgress,
    error,
    execute: executeEstimateFee,
    reset: resetEstimateFee,
  } = usePromise(
    async () => {
      if (!params.token || !params.to) {
        throw new Error("Invalid parameters for fee estimation");
      }
      const publicClient = onboardStore.getPublicClient();
      const amount = BigInt(params.token.amount);

      const toBytes32 = pad(getAddress(params.to), { size: 32 });

      const sendParams = {
        dstEid: getEndpointId(),
        to: toBytes32,
        amountLD: amount,
        minAmountLD: amount,
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
      };
      try {
        const quote = (await publicClient.readContract({
          address: params.token.address as `0x${string}`,
          abi: OFT_ABI,
          functionName: "quoteSend",
          args: [sendParams, false], // false means don't pay in LZ token
        })) as LayerZeroFeeValues;

        quoteFee.value = quote.nativeFee;
      } catch (err) {
        const message = (err as any)?.message;
        if (message?.startsWith("Not enough balance for deposit!")) {
          const match = message.match(/([\d\\.]+) ETH/);
          if (feeToken.value && match?.length) {
            const ethAmount = match[1].split(" ")?.[0];
            recommendedBalance.value = parseEther(ethAmount);
            return;
          }
        } else if (message?.includes("insufficient funds for gas * price + value")) {
          throw new Error("Insufficient funds to cover deposit fee! Please, top up your account with ETH.");
        }
        throw err;
      }
    },
    { cache: false }
  );

  const cacheEstimateFee = useTimedCache<void, [typeof params]>(() => {
    resetEstimateFee();
    return executeEstimateFee();
  }, 1000 * 8);

  const calculateGasFee = async (): Promise<DepositFeeValues> => {
    const publicClient = onboardStore.getPublicClient();
    const feeData = await publicClient.estimateFeesPerGas();

    const l1GasLimit = 500000n;

    const maxFeePerGas = feeData.maxFeePerGas || 0n;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 0n;

    const gasPrice = await getGasPrice();

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      l1GasLimit,
    };
  };

  const totalFee = computed(() => {
    if (!quoteFee.value || !gasFee.value?.maxFeePerGas || !gasFee.value?.l1GasLimit) return undefined;

    let gasCost = gasFee.value.l1GasLimit * gasFee.value.maxFeePerGas;
    if (gasFee.value.maxPriorityFeePerGas) {
      gasCost += gasFee.value.l1GasLimit * gasFee.value.maxPriorityFeePerGas;
    }

    return quoteFee.value + gasCost;
  });

  return {
    fee: gasFee,
    result: totalFee,
    quoteFee,
    inProgress,
    error,
    recommendedBalance,
    feeToken,
    enoughBalanceToCoverFee,
    estimateFee: async (token: TokenAmount, to: Address) => {
      params = {
        token,
        to,
      };
      await cacheEstimateFee(params);
      gasFee.value = await calculateGasFee();
    },
    resetFee: () => {
      quoteFee.value = undefined;
      gasFee.value = undefined;
    },
  };
};
