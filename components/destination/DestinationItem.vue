<template>
  <CommonButtonLineWithImg :as="as" :icon="icon" class="destination-item">
    <template #image>
      <slot name="image">
        <CommonImageLoader class="destination-item-icon aspect-square h-auto w-full rounded-full" :src="iconUrl" />
      </slot>
    </template>
    <template #default>
      <CommonButtonLineBodyInfo class="text-left">
        <template v-if="label || $slots['label']" #label>
          <slot name="label">{{ label }}</slot>
        </template>
        <template v-if="description || $slots['underline']" #underline>
          <slot name="underline">{{ description }}</slot>
        </template>
      </CommonButtonLineBodyInfo>
    </template>
    <template v-if="$slots.right" #right>
      <slot name="right" />
    </template>
  </CommonButtonLineWithImg>
</template>

<script lang="ts" setup>
defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
  },
  label: {
    type: String,
  },
  iconUrl: {
    type: String,
  },
  description: {
    type: String,
  },
  icon: {
    type: [Object, Function] as PropType<Component>,
  },
});
</script>

<style lang="scss">
.destination-item-icon .image-loader-image {
  box-sizing: content-box;
}
</style>
