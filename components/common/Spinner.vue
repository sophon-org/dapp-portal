<template>
  <svg
    aria-hidden="true"
    class="spinner animate-spin text-transparent"
    :class="`variant-${variant}`"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#f5f6f2"
      d="M100 50A50 50 0 1 1 0 50a50 50 0 0 1 100 0ZM9.08 50a40.92 40.92 0 1 0 81.84 0 40.92 40.92 0 0 0-81.84 0Z"
    />
    <path
      fill="#6e6e73"
      d="M93.97 38.45A4.24 4.24 0 0 0 97 32.96 50 50 0 0 0 41.73.7a4.24 4.24 0 0 0-3.28 5.34 4.96 4.96 0 0 0 5.6 3.49 40.92 40.92 0 0 1 44.13 25.76 4.96 4.96 0 0 0 5.79 3.17Z"
    />
  </svg>
</template>

<script lang="ts" setup>
defineProps({
  variant: String as PropType<"default" | "text-color" | "dark">,
});
</script>

<style lang="scss" scoped>
.spinner {
  &.variant- {
    &.default {
      @apply fill-blue;
    }
    &.text-color {
      @apply fill-black;
    }
  }
}
</style>
