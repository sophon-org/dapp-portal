<template>
  <CommonHeightTransition :opened="opened">
    <div class="text-center text-sm font-medium text-gray">
      <div class="pt-1"></div>
      <slot />
    </div>
  </CommonHeightTransition>
</template>

<script lang="ts" setup>
defineProps({
  opened: {
    type: Boolean,
    required: true,
  },
});
</script>
