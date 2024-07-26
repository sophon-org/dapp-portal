<template>
  <div class="button-line-body-info w-max max-w-full">
    <div
      v-if="$slots.label"
      class="button-line-body-info-label inline min-h-[1.5rem] overflow-hidden text-ellipsis align-middle font-semibold"
    >
      <slot name="label" />
    </div>
    <div
      v-if="$slots.secondary"
      class="button-line-body-info-secondary inline min-h-[1.5rem] overflow-hidden text-ellipsis align-middle"
    >
      <slot name="secondary" />
    </div>
    <div v-if="$slots.underline" class="button-line-body-info-underline text-sm text-black">
      <slot name="underline" />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<!-- <style lang="scss" scoped>
</style> -->
