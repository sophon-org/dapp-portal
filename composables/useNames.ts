import { resolveName } from "@sophon-labs/account-core";
import { useMemoize } from "@vueuse/core";
import { getEnsAddress } from "@wagmi/core";

import { isMainnet } from "@/data/networks";
import { wagmiL1Config } from "@/data/wagmi";

type Name = {
  address: string;
  type: "ens" | "sns";
};

export default (name: Ref<string>, snsSupport: boolean = false) => {
  const { selectedNetwork } = storeToRefs(useNetworkStore());

  const fetchSnsAddress = useMemoize((name: string) => resolveName(name, !isMainnet(selectedNetwork.value.id)));

  const fetchEnsAddress = useMemoize((name: string) => getEnsAddress(wagmiL1Config, { name, chainId: 1 }));

  const nameToAddress = ref<{ [name: string]: Name }>({});

  const isValidEnsFormat = computed(() => name.value.endsWith(".eth"));

  const {
    inProgress,
    error,
    execute: parseNames,
  } = usePromise(
    async () => {
      const _name = name.value;

      const _snsClean = _name.replace(".soph.id", "");

      // eslint-disable-next-line prefer-const
      let [snsAddr, ensAddr] = await Promise.all([
        snsSupport ? fetchSnsAddress(_snsClean) : null,
        isValidEnsFormat.value ? fetchEnsAddress(_name) : null,
      ]);

      if (snsAddr || ensAddr) {
        nameToAddress.value[snsAddr ? _snsClean : _name] = {
          address: (snsAddr || ensAddr) as string,
          type: snsAddr ? "sns" : "ens",
        };
      }
    },
    { cache: false }
  );

  watch(
    name,
    async () => {
      await parseNames();
    },
    { immediate: true }
  );

  return {
    name: computed(() => nameToAddress.value[name.value.replace(".soph.id", "")]),
    inProgress,
    error,
    isValidEnsFormat,
    parseNames,
  };
};
