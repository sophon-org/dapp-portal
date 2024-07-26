<template>
  <div class="empty-block">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.empty-block {
  @apply break-words rounded-3xl border border-dashed px-3.5 py-4 text-center leading-normal text-gray wrap-balance;
}
</style>
