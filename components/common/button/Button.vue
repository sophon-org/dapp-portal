<template>
  <!-- <component :is="as" type="button" class="default-button" :class="[`size-${size}`, `variant-${variant}`]"> -->
  <component
    :is="as"
    type="button"
    class="default-button flex items-center justify-center rounded-full py-[0.5em] text-center font-semibold shadow-inner-glow transition-colors wrap-balance"
    :class="[`size-${size}`, `variant-${variant}`]"
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
    type: String as PropType<"default" | "primary" | "light" | "error" | "icon">,
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
    cursor: pointer;
  }

  &.size- {
    &xs {
      @apply px-4 py-2;
    }
    &sm {
      @apply p-3;
    }
    &md {
      padding-left: 1em;
      padding-right: 1em;
    }
  }

  &:disabled,
  &[aria-disabled="true"] {
    @apply bg-opacity-50;
  }

  &.variant- {
    &default {
      &,
      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          background-color: #fff;
        }
      }
    }

    &primary {
      color: #fff;

      &,
      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          background-color: var(--color-blue);
        }
      }
    }

    &light {
      box-shadow: none;

      &,
      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          background-color: var(--color-blue-lightest);
        }
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

    &icon {
      aspect-ratio: 1 / 1;
      background-color: #fff;
      height: 40px;
      padding-left: 0;
      padding-right: 0;
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
