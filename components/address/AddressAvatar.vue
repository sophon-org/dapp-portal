<template>
  <div class="address-avatar">
    <img class="address-avatar-img" :src="getSVGAvatarFromString(address)" />
    <div v-if="$slots.icon" class="address-avatar-icon">
      <slot name="icon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getSVGAvatarFromString } from "@sophon-labs/account-core";

defineProps({
  address: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss">
.address-avatar {
  @apply relative;

  .address-avatar-img {
    @apply h-full w-full;
    border-radius: 50%;
  }
  .address-avatar-icon {
    @apply absolute -bottom-1 -right-1 aspect-square h-[60%] w-[60%] rounded-full bg-white bg-opacity-90 shadow backdrop-blur-sm;

    img,
    svg {
      @apply h-full w-full object-contain;
    }
  }
}
</style>
