import { BigNumber, ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { type Address, getAddress, pad } from "viem";
import { utils } from "zksync-ethers";

import OFT_ABI from "./abi";

import type { BigNumberish } from "ethers";
import type { Token, TokenAmount } from "~/types";

export type LayerZeroFeeValues = {
  nativeFee: bigint;
  lzTokenFee: bigint;
};

export type DepositFeeValues = {
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
  gasPrice?: BigNumber;
  baseCost?: BigNumber;
  l1GasLimit: BigNumber;
  l2GasLimit?: BigNumber;
};

export default (tokens: Ref<Token[]>, balances: Ref<TokenAmount[] | undefined>) => {
  const onboardStore = useOnboardStore();

  let params = {
    token: undefined as TokenAmount | undefined,
    to: undefined as Address | undefined,
  };

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
    if (totalFee.value && BigNumber.from(totalFee.value).gt(feeTokenBalance.amount)) {
      return false;
    }
    return true;
  });

  const getGasPrice = async () => {
    const web3Provider = new ethers.providers.Web3Provider((await onboardStore.getWallet()) as any, "any");
    return BigNumber.from(await retry(() => web3Provider.getGasPrice()))
      .mul(110)
      .div(100);
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
        dstEid: 30334, // sophon mainnet
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

    const l1GasLimit = 500000;

    const maxFeePerGas = BigNumber.from(feeData.maxFeePerGas || 0);
    const maxPriorityFeePerGas = BigNumber.from(feeData.maxPriorityFeePerGas || 0);

    const gasPrice = await getGasPrice();

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      l1GasLimit: BigNumber.from(l1GasLimit),
    };
  };

  const totalFee = computed(() => {
    if (!quoteFee.value || !gasFee.value?.maxFeePerGas || !gasFee.value?.l1GasLimit) return undefined;

    const gasCost = gasFee.value.l1GasLimit.mul(gasFee.value.maxFeePerGas);
    if (gasFee.value.maxPriorityFeePerGas) {
      gasCost.add(gasFee.value.l1GasLimit.mul(gasFee.value.maxPriorityFeePerGas));
    }

    return quoteFee.value + gasCost.toBigInt();
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
