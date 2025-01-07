<template>
  <component :is="as" class="line-button-container" :class="[`size-${size}`, `variant-${variant}`]" :to="to">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import type { Component } from "nuxt/schema";
import type { RouteLocationRaw } from "vue-router";

defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
    default: "button",
  },
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
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
  @apply w-full rounded-2xl px-block-padding-1/4 transition-colors sm:px-block-padding-1/2;

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
      background-color: #fff;
    }

    &.light {
      background-color: var(--color-blue-lightest);

      /* &:enabled,
      &:is(a) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-white;
        }
      } */
    }

    &.primary {
      background-color: var(--color-blue);
    }
  }
}
</style>
