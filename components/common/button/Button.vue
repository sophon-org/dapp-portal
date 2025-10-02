<template>
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
    type: String as PropType<"default" | "primary" | "light" | "white" | "error" | "icon" | "cancel">,
    default: "default",
  },
  size: {
    type: String as PropType<"xs" | "sm" | "md" | "lg">,
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

    &lg {
      padding: 1em 1.75em;
    }
  }

  &.variant- {
    &default {
      &,
      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          background-color: var(--color-blue-lightest);
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

    &white {
      box-shadow: none;

      &,
      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          background-color: #fff;
        }
      }
    }

    &error {
      @apply border-red-400 bg-red-100/50 text-red-400;

      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          @apply hover:bg-red-100/75;
        }
      }
    }

    &icon {
      background-color: #fff;
      padding: 1em;
    }
    &cancel {
      @apply bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-red-700/30 dark:text-red-300/70;
      &:enabled,
      &:is(a, label) {
        &:not([aria-disabled="true"]) {
          @apply hover:text-neutral-800 dark:hover:bg-red-700/60 dark:hover:text-red-300;
        }
      }
    }
  }

  &:disabled,
  &[aria-disabled="true"] {
    background-color: #dadce0 !important;
    color: #a0a7ad;
    pointer-events: none;
  }

  .icon-container {
    @apply -ml-0.5 mr-2 inline-flex items-center;

    svg {
      @apply block h-4 w-4;
    }
  }
}
</style>
