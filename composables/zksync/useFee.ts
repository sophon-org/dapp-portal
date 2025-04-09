import { ethers } from "ethers";
import { type Provider } from "zksync-ethers";
import IERC20 from "zksync-ethers/abi/IERC20.json";

import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import type { Token, TokenAmount } from "@/types";

export type FeeEstimationParams = {
  type: "transfer" | "withdrawal";
  from: string;
  to: string;
  tokenAddress: string;
};

export default (
  getProvider: () => Provider,
  tokens: Ref<{ [tokenSymbol: string]: Token } | undefined>,
  balances: Ref<TokenAmount[]>,
  totalComputeAmount: Ref<bigint>
) => {
  let params: FeeEstimationParams | undefined;
  const gasLimit = ref<bigint | undefined>();
  const gasPrice = ref<bigint | undefined>();
  const approvalNeeded = ref(false);
  const allowanceValue = ref<bigint | undefined>();
  const { selectedNetwork } = storeToRefs(useNetworkStore());
  const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;

  const totalFee = computed(() => {
    return "0"; // fee check disabled
    /* if (!gasLimit.value || !gasPrice.value) return undefined;
    return calculateFee(gasLimit.value, gasPrice.value).toString(); */
  });

  const feeToken = computed(() => {
    return tokens.value?.[L2_BASE_TOKEN_ADDRESS];
  });
  const enoughBalanceToCoverFee = computed(() => {
    return true; // fee check disabled
    /* if (!feeToken.value || inProgress.value) {
      return true;
    }
    const feeTokenBalance = balances.value.find((e) => e.address === feeToken.value!.address);
    if (!feeTokenBalance) return true;
    if (totalFee.value && BigInt(totalFee.value) > feeTokenBalance.amount) {
      return false;
    }
    return true; */
  });

  function checkFeeTokenBalance() {
    if (params?.type === "withdrawal" && params.tokenAddress === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.address) {
      return totalComputeAmount.value === 0n ? allowanceValue.value : totalComputeAmount.value;
    } else {
      return balances.value.find((e) => e.address === params!.tokenAddress)?.amount || 1n;
    }
  }

  async function checkApproval(tokenAddress: string, owner: string, spender: string): Promise<boolean> {
    const provider = getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, IERC20, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    allowanceValue.value = BigInt(allowance);

    if (allowanceValue.value === 0n) return false;

    const isApproved = BigInt(allowance) > totalComputeAmount.value;

    approvalNeeded.value = !isApproved;
    return isApproved;
  }

  const {
    inProgress,
    error,
    execute: executeEstimateFee,
    reset: resetEstimateFee,
  } = usePromise(
    async () => {
      if (!params) throw new Error("Params are not available");

      // Check if approval is needed before estimating gas
      if (approvalNeeded.value) return;

      const provider = getProvider();
      const tokenBalance = checkFeeTokenBalance();
      const [price, limit] = await Promise.all([
        retry(() => provider.getGasPrice()),
        retry(() => {
          return provider[params!.type === "transfer" ? "estimateGasTransfer" : "estimateGasWithdraw"]({
            from: params!.from,
            to: params!.to,
            token: params!.tokenAddress,
            amount: tokenBalance ?? 1n,
            ...(params!.tokenAddress === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.address
              ? { bridgeAddress: NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l2BridgeAddress! }
              : {}),
          });
        }),
      ]);
      gasPrice.value = BigInt(price.toString());
      gasLimit.value = BigInt(limit.toString());
    },
    { cache: false }
  );
  const cacheEstimateFee = useTimedCache<void, [FeeEstimationParams]>(() => {
    resetEstimateFee();
    return executeEstimateFee();
  }, 1000 * 8);

  return {
    gasLimit,
    gasPrice,
    result: totalFee,
    inProgress,
    error,
    estimateFee: async (estimationParams: FeeEstimationParams) => {
      params = estimationParams;
      if (params.tokenAddress === NETWORK_CONFIG.CUSTOM_USDC_TOKEN.address && params.type === "withdrawal") {
        const isApproved = await checkApproval(
          params.tokenAddress,
          params.from,
          NETWORK_CONFIG.CUSTOM_USDC_TOKEN.l2BridgeAddress!
        );

        if (!isApproved) return;
      }
      await cacheEstimateFee(params);
    },
    resetFee: () => {
      gasLimit.value = undefined;
      gasPrice.value = undefined;
    },

    feeToken,
    enoughBalanceToCoverFee,
  };
};
