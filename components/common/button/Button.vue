<template>
  <!-- <component :is="as" type="button" class="default-button" :class="[`size-${size}`, `variant-${variant}`]"> -->
  <component
    :is="as"
    type="button"
    class="default-button flex items-center justify-center rounded-full py-[0.5em] text-center shadow-inner-glow backdrop-blur-sm transition-colors wrap-balance"
    :class="[`variant-${variant}`]"
  >
    <span v-if="$slots.icon" class="icon-container">
      <slot name="icon" />
    </span>
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
    type: String as PropType<"default" | "primary" | "light" | "error">,
    default: "default",
  },
  size: {
    type: String as PropType<"xs" | "sm" | "md">,
    default: "md",
  },
});
</script>

<style lang="scss">
.default-button {
  &:is(label) {
    @apply cursor-pointer;
  }
  &.size- {
    &xs {
      @apply rounded-2xl px-4 py-2;
    }
    &sm {
      @apply rounded-[20px] p-3;
    }
    &md {
      @apply rounded-3xl p-4;
    }
  }
  &.variant- {
    &default {
      @apply bg-white;

      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-white;
        }
      }
    }

    &light {
      @apply bg-white transition disabled:opacity-70;

      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-gray;
        }
      }
    }

    &primary {
      @apply bg-blue px-6 text-white;

      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-blue;
        }
      }
      &:disabled,
      &[aria-disabled="true"] {
        @apply bg-opacity-50;
      }
    }

    &error {
      @apply bg-red-100/50 text-red-400;

      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-red-100/75;
        }
      }
    }
  }

  .icon-container {
    @apply -ml-0.5 mr-2 inline-flex items-center;

    svg {
      @apply block h-4 w-4;
    }
  }
}
</style>
