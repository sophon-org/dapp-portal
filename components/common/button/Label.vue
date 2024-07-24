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
      @apply text-black;
      @include interactiveStyles {
        @apply hover:text-black;
      }
    }
    &.light {
      @apply text-black;
      @include interactiveStyles {
        @apply hover:text-black;
      }
    }
  }
}
</style>
