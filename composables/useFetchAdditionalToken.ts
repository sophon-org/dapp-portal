import { getBalance } from "@wagmi/core";

import { wagmiConfig } from "@/data/wagmi";

import type { Hash, TokenAmount } from "@/types";

export default () => {
  const onboardStore = useOnboardStore();
  const { l1Network } = storeToRefs(useNetworkStore());
  const additionalTokenAddress = ref<string | undefined>();
  const { account } = storeToRefs(onboardStore);

  const {
    inProgress: fetchAdditionalTokenInProgress,
    error: fetchAdditionalTokenError,
    execute: requestAdditionalToken,
    reset: resetFetchAdditionalToken,
  } = usePromise<TokenAmount>(async () => {
    if (!additionalTokenAddress.value) throw new Error("Token address is not available");

    const balanceData = await getBalance(wagmiConfig, {
      address: account.value.address as Hash,
      chainId: l1Network.value?.id,
      token: additionalTokenAddress.value as Hash,
    });

    const additionalToken = {
      address: additionalTokenAddress.value as Hash,
      l1Address: additionalTokenAddress.value as Hash,
      symbol: balanceData.symbol,
      decimals: balanceData.decimals,
      amount: balanceData.value,
    };

    return additionalToken;
  });

  const fetchAdditionalToken = async (tokenAddress: string) => {
    if (tokenAddress) {
      resetFetchAdditionalToken();
      additionalTokenAddress.value = tokenAddress;
      const balanceData = await requestAdditionalToken();
      return balanceData;
    } else {
      resetFetchAdditionalToken();
    }
  };

  return {
    fetchAdditionalToken,
    fetchAdditionalTokenInProgress,
    fetchAdditionalTokenError,
  };
};
