<template>
  <HeaderMobileNavigation v-model:opened="modalOpened" title="Account">
    <transition v-bind="TabsTransition" mode="out-in">
      <div v-if="openedTab === 'main'" class="h-full">
        <CommonCardWithLineButtons>
          <DestinationItem :icon="copied ? CheckIcon : DocumentDuplicateIcon" size="sm" @click="copy()">
            <template #label>
              <div class="break-all">{{ account.address }}</div>
            </template>
            <template #image>
              <AddressAvatar :address="account.address!" class="h-full w-full" />
            </template>
          </DestinationItem>
        </CommonCardWithLineButtons>
        <CommonCardWithLineButtons v-if="selectedNetwork.blockExplorerUrl" class="mt-block-padding-1/2">
          <DestinationItem
            label="View on Explorer"
            as="a"
            :href="`${selectedNetwork.blockExplorerUrl}/address/${account.address}`"
            target="_blank"
            :icon="ArrowTopRightOnSquareIcon"
            size="sm"
          >
            <template #image>
              <DestinationIconContainer>
                <Squares2X2Icon aria-hidden="true" />
              </DestinationIconContainer>
            </template>
          </DestinationItem>
        </CommonCardWithLineButtons>
        <CommonCardWithLineButtons class="mt-block-padding-1/2">
          <DestinationItem label="Logout" size="sm" @click="logout()">
            <template #image>
              <DestinationIconContainer>
                <PowerIcon aria-hidden="true" />
              </DestinationIconContainer>
            </template>
          </DestinationItem>
        </CommonCardWithLineButtons>
      </div>
    </transition>
  </HeaderMobileNavigation>
</template>

<script lang="ts" setup>
import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  PowerIcon,
  Squares2X2Icon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  opened: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (eventName: "update:opened", value: boolean): void;
}>();

const TabsTransition = computed(() =>
  openedTab.value === "main" ? TransitionSlideOutToRight : TransitionSlideOutToLeft
);

const openedTab = ref<"main">("main");
const modalOpened = computed({
  get: () => props.opened,
  set: (value) => emit("update:opened", value),
});
watch(
  () => props.opened,
  (value) => {
    if (!value) {
      openedTab.value = "main";
    }
  }
);
const logout = () => {
  modalOpened.value = false;
  onboardStore.disconnect();
};

const onboardStore = useOnboardStore();
const { account, isConnected } = storeToRefs(onboardStore);
watch(
  () => isConnected,
  (connected) => {
    if (!connected) {
      modalOpened.value = false;
    }
  }
);
const { copy, copied } = useCopy(computed(() => account.value.address!));
const { selectedNetwork } = storeToRefs(useNetworkStore());
</script>

<style scoped lang="scss"></style>
