<template>
  <label class="search-input" :class="{ focused }">
    <MagnifyingGlassIcon class="search-icon" aria-hidden="true" />
    <input
      v-model="inputted"
      class="search-input-field"
      :placeholder="placeholder"
      :type="type"
      :maxlength="maxLength"
      spellcheck="false"
    />
    <transition v-bind="TransitionOpacity()">
      <button v-if="inputted" class="search-input-clear-button" type="button" @click="inputted = ''">
        <XMarkIcon class="search-input-clear-button-icon" aria-hidden="true" />
      </button>
    </transition>
  </label>
</template>

<script lang="ts" setup>
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { useFocus } from "@vueuse/core";

const props = defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
    default: "div",
  },
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  maxLength: {
    type: Number,
    default: 50,
  },
  type: {
    type: String,
    default: "text",
  },
  autofocus: {
    type: [Boolean, String] as PropType<boolean | "desktop">,
    default: false,
  },
});

const emit = defineEmits<{
  (eventName: "update:modelValue", value: string): void;
}>();

const inputElement = ref<HTMLInputElement | null>(null);
const { focused } = useFocus(inputElement, {
  initialValue: props.autofocus === true || (props.autofocus === "desktop" && isMobile() === false),
});

const inputted = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});
</script>

<style lang="scss" scoped>
.search-input {
  @apply flex w-full items-center gap-2 rounded-2xl border-2 border-blue-lightest p-block-padding-1/2 text-black transition-colors;
  &:has(.search-input-field:focus),
  &:hover {
    @apply border-gray;
  }

  .search-icon {
    @apply h-6 w-6 flex-shrink-0;
  }
  .search-input-field {
    @apply w-full truncate rounded-none border-none bg-transparent text-black outline-none placeholder:text-black;
  }
  .search-input-clear-button {
    @apply block aspect-square h-6 w-6 self-end rounded-full p-1 transition-all hover:text-black;

    .search-input-clear-button-icon {
      @apply h-full w-full;
    }
  }
}
</style>
