<template>
  <!-- <div class="page-title mb-block-gap-2/3 flex items-start gap-4 sm:mb-block-gap"> -->
  <div class="page-title mb-[1em]">
    <PageBackButton v-if="fallbackRoute" :fallback="fallbackRoute" />
    <CommonButtonBack v-else-if="backFunction" @click="backFunction()" />
    <h1 class="title">
      <slot />
    </h1>
  </div>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

defineProps({
  fallbackRoute: {
    type: [String, Object] as PropType<string | RouteLocationRaw>,
  },
  backFunction: {
    type: Function as PropType<() => void>,
  },
});
</script>

<style lang="scss" scoped>
.page-title .title {
  font-size: 40px;
  line-height: 1.4;
  margin-bottom: auto;
  margin-top: auto;
}
</style>
