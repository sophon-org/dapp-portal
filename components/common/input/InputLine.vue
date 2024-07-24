<template>
  <input v-model="inputted" class="input-line" :class="{ 'has-error': hasError }" />
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  hasError: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (eventName: "update:modelValue", value: string): void;
}>();

const inputted = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});
</script>

<style lang="scss" scoped>
.input-line {
  @apply block w-full overflow-hidden rounded-none border-b-2 bg-transparent leading-snug outline-none transition placeholder:text-gray;
  @apply border-white hover:border-gray focus:border-black;

  &.has-error {
    @apply border-error-300;
  }
}
</style>
