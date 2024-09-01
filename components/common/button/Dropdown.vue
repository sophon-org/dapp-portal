<template>
  <CommonButton class="dropdown-button">
    <div v-if="$slots['left-icon']" class="left-icon-container">
      <slot name="left-icon" />
    </div>
    <slot />
    <div v-if="!noChevron || $slots['right-icon']" class="right-icon-container">
      <slot name="right-icon">
        <svg
          v-if="!noChevron"
          class="inline-block h-[0.85em] w-[0.85em]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          :class="{ toggled }"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M.49 5.66c.65-.65 1.7-.65 2.35 0L12 14.82l9.16-9.16A1.66 1.66 0 0 1 23.51 8L13.17 18.34c-.64.65-1.7.65-2.34 0L.49 8.01a1.66 1.66 0 0 1 0-2.35Z"
          />
        </svg>
      </slot>
    </div>
  </CommonButton>
</template>

<script lang="ts" setup>
defineProps({
  toggled: {
    type: Boolean,
    default: false,
  },
  noChevron: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.dropdown-button {
  @apply flex items-center justify-start gap-2;

  .left-icon-container {
    @apply h-6 w-6 flex-shrink-0;
  }
}
</style>
