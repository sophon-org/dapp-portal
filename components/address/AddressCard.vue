<template>
  <CommonButtonLineWithImg :as="as" class="address-card">
    <template #image>
      <AddressAvatar class="address-card-avatar" :address="type === 'sns' ? `${name}.soph.id` : name || address">
        <template v-if="$slots['address-icon']" #icon>
          <slot name="address-icon" />
        </template>
      </AddressAvatar>
    </template>
    <template #default>
      <CommonButtonLineBodyInfo class="text-left">
        <template v-if="name" #label>{{ displayName }}</template>
        <template #underline>
          <span class="block break-all" :title="address">{{ address }}</span>
        </template>
      </CommonButtonLineBodyInfo>
    </template>
    <template v-if="$slots.right" #right>
      <slot name="right" />
    </template>
  </CommonButtonLineWithImg>
</template>

<script lang="ts" setup>
const props = defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<"ens" | "sns">,
  },
});

const displayName = computed(() => {
  if (props.type === "ens") {
    return `${props.name} - From ENS`;
  }
  if (props.type === "sns") {
    return `${props.name}.soph.id - From Sophon Name Service (SNS)`;
  }
  return props.name;
});
</script>

<style lang="scss" scoped>
.address-card {
  .address-card-avatar {
    @apply aspect-square h-auto w-full;
  }
}
</style>
