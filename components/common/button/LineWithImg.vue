<template>
  <CommonButtonLine :as="as" class="line-button-with-img">
    <div class="line-button-with-img-image">
      <slot name="image" />
    </div>
    <div class="line-button-with-img-body">
      <slot />
    </div>
    <div v-if="$slots.right" class="line-button-with-img-right">
      <slot name="right" />
    </div>

    <component :is="icon" v-if="icon" class="line-button-with-img-icon" aria-hidden="true" />
    <!-- <svg
      v-if="icon"
      class="inline-block h-[0.85em] w-[0.85em] -rotate-90"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M.49 5.66c.65-.65 1.7-.65 2.35 0L12 14.82l9.16-9.16A1.66 1.66 0 0 1 23.51 8L13.17 18.34c-.64.65-1.7.65-2.34 0L.49 8.01a1.66 1.66 0 0 1 0-2.35Z"
      />
    </svg> -->
    <CommonContentLoader v-else-if="iconLoading" :length="0" class="line-button-with-img-icon-loading" />
  </CommonButtonLine>
</template>

<script lang="ts" setup>
defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
  },
  icon: {
    type: [Object, Function] as PropType<Component>,
  },
  iconLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.line-button-with-img {
  @apply flex items-center gap-4;

  .line-button-with-img-image {
    @apply my-[1.5px] aspect-square h-auto w-12 flex-none self-start;
  }
  .line-button-with-img-body {
    @apply w-full overflow-hidden;
  }
  .line-button-with-img-right {
    @apply w-max;
  }
  .line-button-with-img-icon {
    @apply ml-1 mr-2 h-5 w-5 flex-none text-gray;
  }
  .line-button-with-img-icon-loading {
    @apply mx-1 h-7 w-7 flex-none rounded-full;
  }
}
</style>
