import { BigNumber, ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { utils } from "zksync-ethers";

import type { Token, TokenAmount } from "@/types";
import type { BigNumberish } from "ethers";

export type DepositFeeValues = {
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
  gasPrice?: BigNumber;
  baseCost?: BigNumber;
  l1GasLimit: BigNumber;
  l2GasLimit?: BigNumber;
};

export default (tokens: Ref<Token[]>, balances: Ref<TokenAmount[] | undefined>) => {
  const { getL1VoidSigner } = useZkSyncWalletStore();
  const { requestProvider } = useZkSyncProviderStore();
  const onboardStore = useOnboardStore();
  const { account } = storeToRefs(onboardStore);

  let params = {
    to: undefined as string | undefined,
    tokenAddress: undefined as string | undefined,
    accountChainId: undefined as number | undefined,
  };

  const fee = ref<DepositFeeValues | undefined>();
  const recommendedBalance = ref<BigNumberish | undefined>();

  const totalFee = computed(() => {
    if (!fee.value) return undefined;

    if (fee.value.l1GasLimit && fee.value.maxFeePerGas && fee.value.maxPriorityFeePerGas) {
      return fee.value.l1GasLimit
        .mul(fee.value.maxFeePerGas)
        .add(fee.value.baseCost || "0")
        .toString();
    } else if (fee.value.l1GasLimit && fee.value.gasPrice) {
      return calculateFee(fee.value.l1GasLimit, fee.value.gasPrice).toString();
    }
    return undefined;
  });

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

  const getEthTransactionFee = async () => {
    const signer = getL1VoidSigner();
    if (!signer) throw new Error("Signer is not available");

    return await retry(() =>
      signer.getFullRequiredDepositFee({
        token: utils.ETH_ADDRESS,
        to: params.to,
      })
    );
  };
  const getERC20TransactionFee = () => {
    return {
      l1GasLimit: BigNumber.from(1000000), // TODO: replace for zksync-ethers value when we have updated the package
    };
  };
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
      recommendedBalance.value = undefined;
      if (!feeToken.value) throw new Error("Fee tokens is not available");

      const provider = requestProvider();
      const isEthBasedChain = await provider.isEthBasedChain();

      try {
        if (isEthBasedChain && params.tokenAddress === feeToken.value?.address) {
          fee.value = await getEthTransactionFee();
        } else {
          fee.value = getERC20TransactionFee();
        }
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
      /* It can be either maxFeePerGas or gasPrice */
      if (fee.value && !fee.value?.maxFeePerGas) {
        fee.value.gasPrice = await getGasPrice();
      }
    },
    { cache: false }
  );
  const cacheEstimateFee = useTimedCache<void, [typeof params]>(() => {
    resetEstimateFee();
    return executeEstimateFee();
  }, 1000 * 8);

  return {
    fee,
    result: totalFee,
    inProgress,
    error,
    recommendedBalance,
    estimateFee: async (to: string, tokenAddress: string) => {
      params = {
        to,
        tokenAddress,
        accountChainId: account.value.chainId,
      };
      await cacheEstimateFee(params);
    },
    resetFee: () => {
      fee.value = undefined;
    },

    feeToken,
    enoughBalanceToCoverFee,
  };
};
