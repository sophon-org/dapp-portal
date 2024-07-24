<template>
  <component :is="as" class="line-button-container" :class="[`size-${size}`, `variant-${variant}`]">
    <slot />
  </component>
</template>

<script lang="ts" setup>
defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
    default: "button",
  },
  variant: {
    type: String as PropType<"default" | "light" | "primary">,
    default: "default",
  },
  size: {
    type: String as PropType<"md" | "sm">,
    default: "md",
  },
});
</script>

<style lang="scss" scoped>
.line-button-container {
  @apply w-full rounded-[1.24rem] px-block-padding-1/4 transition-colors sm:px-block-padding-1/2;
  &:enabled,
  &:is(a) {
    &:not([aria-disabled="true"]) {
      @apply cursor-pointer;
    }
  }
  &:disabled,
  &[aria-disabled="true"] {
    @apply cursor-not-allowed opacity-75;
  }

  &.size- {
    &md {
      @apply py-block-padding-1/2;
    }
    &sm {
      @apply py-block-padding-1/4;
    }
  }
  &.variant- {
    &default {
      @apply bg-white;

      &:enabled,
      &:is(a) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-white;
        }
      }
    }
    &.light {
      @apply bg-white;

      &:enabled,
      &:is(a) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-white;
        }
      }
    }
    &.primary {
      @apply bg-blue;

      &:enabled,
      &:is(a) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-blue;
        }
      }
    }
  }
}
</style>
