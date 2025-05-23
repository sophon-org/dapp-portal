<template>
  <Menu v-slot="{ open }" as="div" class="network-dropdown-container">
    <MenuButton as="template">
      <CommonButtonDropdown class="!px-[1.25em]" :toggled="open" size="lg" variant="white">
        <template #left-icon>
          <IconsSophon class="h-6 w-6" />
        </template>
        <span>{{ selectedNetwork.name }}</span>
      </CommonButtonDropdown>
    </MenuButton>

    <transition v-bind="TransitionAlertScaleInOutTransition">
      <MenuItems class="network-options-container">
        <MenuItem v-for="item in chainList.filter((e) => !e.hidden)" :key="item.key" v-slot="{ active }" as="template">
          <CommonButtonDropdown
            size="sm"
            variant="white"
            no-chevron
            :active="{ active }"
            class="options-item"
            @click="buttonClicked(item)"
          >
            <template #left-icon>
              <IconsSophon class="h-6 w-6" />
            </template>
            <span>{{ item.name }}</span>
            <template #right-icon>
              <CheckIcon v-if="isNetworkSelected(item)" aria-hidden="true" />
            </template>
          </CommonButtonDropdown>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts" setup>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/24/outline";

import { chainList } from "@/data/networks";

import type { ZkSyncNetwork } from "@/data/networks";

const route = useRoute();

const { selectedNetwork } = storeToRefs(useNetworkStore());

const isNetworkSelected = (network: ZkSyncNetwork) => selectedNetwork.value.key === network.key;

const buttonClicked = (network: ZkSyncNetwork) => {
  if (isNetworkSelected(network)) {
    return;
  }
  window.location.href = getNetworkUrl(network, route.fullPath);
};
</script>

<style lang="scss" scoped>
.network-dropdown-container {
  @apply relative;

  .network-options-container {
    @apply absolute right-0 top-full z-10 mt-0.5 h-max w-max min-w-full rounded-3xl bg-white p-1 shadow-lg;

    .options-item {
      @apply w-full;
    }
  }
}
</style>
