import { resolveAddress } from "@sophon-labs/account-core";
import { getEnsAvatar, getEnsName } from "@wagmi/core";

import { isMainnet } from "@/data/networks";
import { wagmiConfig } from "@/data/wagmi";

export const useEnsStore = defineStore("ens", () => {
  const onboardStore = useOnboardStore();
  const { account } = storeToRefs(onboardStore);

  const snsName = ref<string | null>(null);
  const ensName = ref<string | null>(null);
  const ensAvatar = ref<string | null>(null);

  const fetchNamesData = async () => {
    ensName.value = null;
    ensAvatar.value = null;
    snsName.value = null;

    if (!account.value.address) {
      return;
    }

    const initialAddress = account.value.address;
    const { selectedNetwork } = storeToRefs(useNetworkStore());

    const [name, _snsName] = await Promise.all([
      getEnsName(wagmiConfig, { address: account.value.address, chainId: 1 }),
      resolveAddress(account.value.address, !isMainnet(selectedNetwork.value.id)),
    ]);

    if (account.value.address === initialAddress) {
      ensName.value = name;
      snsName.value = _snsName;
    } else {
      return;
    }
    if (name) {
      const avatar = await getEnsAvatar(wagmiConfig, { name, chainId: 1 }).catch(() => null);
      if (account.value.address === initialAddress) {
        ensAvatar.value = avatar;
      }
    }
  };

  fetchNamesData();

  onboardStore.subscribeOnAccountChange(() => {
    fetchNamesData();
  });

  return {
    name: computed(() => ensName.value),
    avatar: computed(() => ensAvatar.value),
  };
});
