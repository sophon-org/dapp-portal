<template>
  <component
    :is="as"
    class="content-block-container block h-max w-full rounded-2xl px-block-padding-1/2 py-block-padding shadow-soft sm:px-block-padding"
    :class="`variant-${variant}`"
  >
    <slot />
  </component>
</template>

<script lang="ts" setup>
defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
    default: "div",
  },
  variant: {
    type: String as PropType<"default" | "primary">,
    default: "default",
  },
});
</script>

<style lang="scss" scoped>
.content-block-container {
  &.variant- {
    &default {
      @apply bg-white;
    }

    &primary {
      @apply bg-blue;
    }
  }
}
</style>
