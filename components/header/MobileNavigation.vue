<template>
  <Dialog as="template" :open="modalOpened">
    <DialogPanel
      class="mobile-navigation-container fixed left-0 top-0 z-[60] w-full overflow-y-auto overflow-x-hidden bg-blue-lightest/70 backdrop-blur-md"
    >
      <div class="mx-auto max-w-[600px]">
        <div class="navigation-header sticky top-0 flex items-center justify-end p-2 sm:p-4">
          <CommonButton variant="icon" @click="close()">
            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
          </CommonButton>
        </div>
        <div class="navigation-body p-2">
          <slot />
        </div>
      </div>
    </DialogPanel>
  </Dialog>
</template>

<script lang="ts" setup>
import { Dialog, DialogPanel } from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  opened: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (eventName: "update:opened", value: boolean): void;
}>();

const route = useRoute();
watch(
  () => route.name,
  () => {
    close();
  }
);

const openedTab = ref<"main" | "network">("main");
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
const close = () => {
  modalOpened.value = false;
};
</script>

<style scoped lang="scss">
.mobile-navigation-container {
  height: 100vh;
  height: 100dvh;

  .navigation-header {
    background-color: transparent;

    .navigation-title {
      margin-bottom: 0;
    }
  }
}
</style>
