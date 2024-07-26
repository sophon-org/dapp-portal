<template>
  <div class="image-loader-container relative h-full">
    <transition
      leave-active-class="transition ease-in duration-[50ms]"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="!isReady || error || !src"
        class="image-loader-placeholder absolute inset-0 h-full w-full rounded-full"
      >
        <slot name="placeholder">
          <CommonContentLoader class="image-loader-placeholder-default block h-full w-full rounded-full" />
        </slot>
      </div>
    </transition>
    <img
      v-if="src"
      class="image-loader-image absolute inset-0 h-full w-full rounded-full object-contain opacity-0 transition-opacity duration-100"
      :class="{ loaded: isReady && !error }"
      :src="src"
      :alt="alt"
    />
  </div>
</template>

<script lang="ts" setup>
import { useImage } from "@vueuse/core";

const props = defineProps({
  src: {
    type: String,
  },
  alt: {
    type: String,
  },
});

const { isReady, error } = props.src
  ? useImage({
      src: props.src,
    })
  : { isReady: computed(() => true), error: computed(() => true) };
</script>

<style lang="scss" scoped>
.image-loader-image.loaded {
  opacity: 1;
}
</style>
