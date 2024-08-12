<template>
  <component :is="as" type="button" class="label-button" :class="`variant-${variant}`" :interactive="interactive">
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
    type: String as PropType<"default" | "light">,
    default: "default",
  },
  interactive: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.label-button {
  @include interactiveStyles {
    @apply underline underline-offset-2 transition;
  }

  &.variant- {
    &default {
      color: var(--color-black);

      @include interactiveStyles {
        &:hover {
          color: var(--color-gray-2);
        }
      }
    }
    &.light {
      color: var(--color-gray-2);

      @include interactiveStyles {
        &:hover {
          color: var(--color-black);
        }
      }
    }
  }
}
</style>
