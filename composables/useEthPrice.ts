import { $fetch } from "ofetch";

export default () => {
  const {
    inProgress: fetchEthPriceInProgress,
    error: fetchEthPriceError,
    execute: requestEthPrice,
    reset: resetFetchEthPrice,
  } = usePromise<number>(async () => {
    const response = await $fetch("https://block-explorer-api.mainnet.zksync.io/api?module=stats&action=ethprice");
    const ethPrice = +response.result.ethusd;
    return ethPrice;
  });

  const fetchEthPrice = async () => {
    resetFetchEthPrice();
    const ethPrice = await requestEthPrice();
    return ethPrice;
  };

  return {
    fetchEthPrice,
    fetchEthPriceInProgress,
    fetchEthPriceError,
  };
};
