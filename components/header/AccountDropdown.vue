<template>
  <Menu v-slot="{ open }" as="div" class="account-dropdown-container">
    <MenuButton as="div">
      <div ref="addressEl">
        <HeaderAccountDropdownButton :toggled="open" size="lg" variant="white" />
      </div>
    </MenuButton>

    <transition v-bind="TransitionAlertScaleInOutTransition">
      <MenuItems class="account-options-container">
        <MenuItem v-slot="{ active }" as="template">
          <CommonButtonDropdown
            size="sm"
            variant="white"
            no-chevron
            :active="active"
            class="options-item"
            @click="copy()"
          >
            <template #left-icon>
              <DocumentDuplicateIcon aria-hidden="true" />
            </template>
            <span>Copy address</span>
          </CommonButtonDropdown>
        </MenuItem>
        <MenuItem v-if="selectedNetwork.blockExplorerUrl" v-slot="{ active }" as="template">
          <CommonButtonDropdown
            size="sm"
            variant="white"
            no-chevron
            :active="active"
            as="a"
            :href="`${selectedNetwork.blockExplorerUrl}/address/${account.address!}`"
            target="_blank"
            class="options-item"
          >
            <template #left-icon>
              <Squares2X2Icon aria-hidden="true" />
            </template>
            <span>Explorer</span>
            <template #right-icon>
              <ArrowTopRightOnSquareIcon aria-hidden="true" />
            </template>
          </CommonButtonDropdown>
        </MenuItem>
        <MenuItem as="template">
          <CommonButtonDropdown
            as="a"
            class="options-item"
            href="https://docs.sophon.xyz"
            no-chevron
            size="sm"
            variant="white"
            target="_blank"
          >
            <template #left-icon>
              <ExclamationCircleIcon aria-hidden="true" />
            </template>
            <span>Documentation</span>
          </CommonButtonDropdown>
        </MenuItem>
        <MenuItem v-slot="{ active }" as="template">
          <CommonButtonDropdown
            size="sm"
            variant="white"
            no-chevron
            :active="active"
            class="options-item"
            @click="onboardStore.disconnect()"
          >
            <template #left-icon>
              <PowerIcon aria-hidden="true" />
            </template>
            <span>Logout</span>
          </CommonButtonDropdown>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts" setup>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import {
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  PowerIcon,
  Squares2X2Icon,
} from "@heroicons/vue/24/outline";
import { useTippy } from "vue-tippy";

const onboardStore = useOnboardStore();
const { account } = storeToRefs(onboardStore);
const { selectedNetwork } = storeToRefs(useNetworkStore());

const { copy, copied } = useCopy(computed(() => account.value.address!));
const addressEl = ref<HTMLElement | undefined>();
const tooltip = useTippy(addressEl, {
  content: "Address copied!",
  trigger: "manual",
  hideOnClick: false,
});
watch(
  copied,
  (copied) => {
    if (copied) {
      tooltip.show();
    } else {
      tooltip.hide();
    }
  },
  { immediate: true }
);

</script>

<style lang="scss" scoped>
.account-dropdown-container {
  @apply relative;

  .account-options-container {
    @apply absolute right-0 top-full z-10 mt-0.5 h-max w-max min-w-full rounded-3xl bg-white p-1 shadow-lg;

    .options-item {
      @apply w-full;
    }
  }
}
</style>
