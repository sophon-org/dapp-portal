<template>
  <header class="header z-50 flex w-full items-center gap-2 p-2 sm:gap-10 sm:p-4">
    <HeaderMobileMainNavigation v-model:opened="mobileMainNavigationOpened" />
    <HeaderMobileAccountNavigation v-model:opened="mobileAccountNavigationOpened" />

    <div class="logo-container">
      <NuxtLink class="flex items-center gap-2 text-black no-underline" :to="{ name: 'bridge' }">
        <img src="/img/logo-sophon-testnet.svg" />
      </NuxtLink>
    </div>

    <div class="links-container hidden items-center gap-10 lg:flex">
      <NuxtLink
        class="link-item flex items-center gap-1 text-lg font-medium text-gray-2"
        :to="{ name: 'bridge' }"
        :class="{ 'router-link-exact-active': routes.bridge.includes(route.name?.toString() || '') }"
      >
        <svg class="inline-block h-[1.5em] w-[1.5em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M16.5 6.75c.38 0 .7.28.74.65l.01.1v11.69l3.22-3.22a.75.75 0 0 1 1.13.98l-.07.08-4.5 4.5a.75.75 0 0 1-.08.07l.08-.07-.04.04-.05.04-.12.07-.1.04-.08.02h-.19l-.12-.01-.1-.03-.1-.05-.08-.05-.08-.07-4.5-4.5a.75.75 0 0 1 .98-1.13l.08.07 3.22 3.22V7.49c0-.4.34-.74.75-.74Zm-9.08-4.5h.13l.12.02.1.03.1.05.05.03.04.03.07.06 4.5 4.5a.75.75 0 0 1-.98 1.13l-.08-.07L8.25 4.8V16.5a.75.75 0 0 1-1.5.1V4.81L3.53 8.03a.75.75 0 0 1-1.13-.98l.07-.08 4.5-4.5.04-.04.05-.04.12-.07.1-.04.08-.02h.06Z"
          />
        </svg>
        Bridge
      </NuxtLink>
      <NuxtLink
        class="link-item flex items-center gap-1 text-lg font-medium text-gray-2"
        :to="{ name: 'assets' }"
        :class="{ 'router-link-exact-active': routes.assets.includes(route.name?.toString() || '') }"
      >
        <svg class="inline-block h-[1.5em] w-[1.5em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M21.75 18a3 3 0 0 1-2.8 3H5.25a3 3 0 0 1-3-2.8V6a3 3 0 0 1 2.8-3h13.7a3 3 0 0 1 3 2.8V18ZM8.33 10.5H5.25c-.35 0-.68.12-.95.34l-.11.1c-.25.25-.4.57-.43.91l-.01.15v6a1.5 1.5 0 0 0 1.35 1.5h13.65a1.5 1.5 0 0 0 1.5-1.35V12a1.5 1.5 0 0 0-1.35-1.5h-3.23l-.03.15a3.75 3.75 0 0 1-7.28 0l-.03-.15Zm10.42-3H5.25a1.5 1.5 0 0 0-1.5 1.35v.55a3 3 0 0 1 1.3-.4H9c.38 0 .7.28.74.65l.01.1a2.25 2.25 0 0 0 4.5.2v-.2c0-.38.28-.7.65-.74L15 9h3.75a3 3 0 0 1 1.5.4V9a1.5 1.5 0 0 0-1.35-1.5h-.15Zm0-3H5.25a1.5 1.5 0 0 0-1.5 1.35v.55a3 3 0 0 1 1.3-.4h13.7a3 3 0 0 1 1.5.4V6a1.5 1.5 0 0 0-1.35-1.5h-.15Z"
          />
        </svg>
        Assets
      </NuxtLink>
      <NuxtLink class="link-item flex items-center gap-1 text-lg font-medium text-gray-2" :to="{ name: 'transfers' }">
        <svg class="inline-block h-[1.5em] w-[1.5em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M8.03 11.47c.27.27.3.68.07.98l-.07.08-3.22 3.22H16.5a.75.75 0 0 1 .1 1.5H4.81l3.22 3.22a.75.75 0 0 1-.98 1.13l-.08-.07-4.5-4.5-.05-.06-.05-.06-.05-.1-.04-.11-.02-.1v-.14l.01-.13.03-.1.05-.1.05-.08.07-.08 4.5-4.5c.3-.3.77-.3 1.06 0Zm8.92-9.07.08.07 4.5 4.5.07.08-.07-.08.04.04.04.05.07.12.04.1.02.11v.15l-.01.13-.03.1-.05.1-.03.05-.03.04-.06.07-4.5 4.5a.75.75 0 0 1-1.13-.98l.07-.08 3.22-3.22H7.5a.75.75 0 0 1-.1-1.5h11.79l-3.22-3.22a.75.75 0 0 1 .98-1.13Z"
          />
        </svg>
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
import { Bars3Icon } from "@heroicons/vue/24/outline";

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
