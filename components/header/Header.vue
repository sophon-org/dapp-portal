<template>
  <header class="header z-50 flex w-full items-center gap-2 p-2 sm:gap-10 sm:p-4">
    <HeaderMobileMainNavigation v-model:opened="mobileMainNavigationOpened" />
    <HeaderMobileAccountNavigation v-model:opened="mobileAccountNavigationOpened" />

    <div class="logo-container">
      <NuxtLink class="flex items-center gap-2 text-black no-underline" :to="{ name: 'bridge' }">
        <div class="aspect-square text-[46px]">
          <sophon />
        </div>
        <span class="text-2xl font-medium">Sophon</span>
        <span class="relative top-[2px] rounded-full bg-blue px-2 text-2xs/4 font-semibold uppercase text-white"
          >Testnet</span
        >
      </NuxtLink>
    </div>

    <div class="links-container hidden items-center gap-10 lg:flex">
      <NuxtLink
        class="link-item items-center; flex gap-1 text-lg font-medium text-gray-2"
        :to="{ name: 'bridge' }"
        :class="{ 'router-link-exact-active': routes.bridge.includes(route.name?.toString() || '') }"
      >
        <ArrowsUpDownIcon class="link-icon h-6 w-6" aria-hidden="true" />
        Bridge
      </NuxtLink>
      <NuxtLink
        class="link-item items-center; flex gap-1 text-lg font-medium text-gray-2"
        :to="{ name: 'assets' }"
        :class="{ 'router-link-exact-active': routes.assets.includes(route.name?.toString() || '') }"
      >
        <WalletIcon class="link-icon h-6 w-6" aria-hidden="true" />
        Assets
      </NuxtLink>
      <NuxtLink class="link-item items-center; flex gap-1 text-lg font-medium text-gray-2" :to="{ name: 'transfers' }">
        <ArrowsRightLeftIcon class="link-icon h-6 w-6" aria-hidden="true" />
        Transfers
        <transition v-bind="TransitionOpacity()">
          <CommonBadge v-if="withdrawalsAvailableForClaiming.length">
            {{ withdrawalsAvailableForClaiming.length }}
          </CommonBadge>
        </transition>
      </NuxtLink>
    </div>
    <div class="right-side ml-auto flex items-center gap-1 sm:gap-3">
      <HeaderNetworkDropdown class="network-dropdown hidden xl:block" />
      <CommonButton v-if="!isConnected" variant="primary" @click="onboardStore.openModal()">
        <span class="whitespace-nowrap">Connect wallet</span>
      </CommonButton>
      <template v-else>
        <div class="sm:hidden">
          <HeaderAccountDropdownButton no-chevron @click="mobileAccountNavigationOpened = true" />
        </div>
        <div class="hidden sm:block">
          <HeaderAccountDropdown />
        </div>
      </template>
      <CommonButton class="hamburger-icon relative xl:hidden" variant="icon" @click="mobileMainNavigationOpened = true">
        <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        <transition v-bind="TransitionOpacity()">
          <CommonBadge
            v-if="withdrawalsAvailableForClaiming.length"
            class="action-available-badge absolute -right-1 -top-1 lg:hidden"
          >
            {{ withdrawalsAvailableForClaiming.length }}
          </CommonBadge>
        </transition>
      </CommonButton>
    </div>
  </header>
</template>

<script lang="ts" setup>
import {
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  // MoonIcon,
  // SunIcon,
  WalletIcon,
} from "@heroicons/vue/24/outline";

import Sophon from "@/components/icons/Sophon.vue";

const route = useRoute();

const routes = {
  bridge: ["bridge", "bridge-withdraw"],
  assets: ["assets", "balances", "receive-methods", "receive", "send-methods", "send"],
};

const onboardStore = useOnboardStore();
const { isConnected } = storeToRefs(onboardStore);
const { withdrawalsAvailableForClaiming } = storeToRefs(useZkSyncWithdrawalsStore());

const mobileMainNavigationOpened = ref(false);
const mobileAccountNavigationOpened = ref(false);

// const { selectedColorMode, switchColorMode } = useColorMode();
</script>

<style lang="scss" scoped>
.link-item {
  &:hover {
    color: var(--color-blue);
  }

  &.router-link-exact-active {
    color: var(--color-black);
  }
}
</style>
