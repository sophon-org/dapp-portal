<template>
  <CommonContentBlock for="transaction-address-input" as="label" class="transaction-address-input">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2 overflow-hidden">
        <div class="font-bold">{{ label }}</div>
        <slot name="dropdown" />
      </div>
      <div v-if="!addressInputHidden && defaultLabel && isConnected">
        <span class="font-bold">{{ inputVisible ? "To another account" : defaultLabel }}</span>
        <CommonButtonLabel variant="light" class="ml-1" @click="toggleCustomValue()">
          {{ inputVisible ? "Use my account" : "Change" }}
        </CommonButtonLabel>
      </div>
    </div>
    <div v-if="inputVisible" class="mt-4">
      <div class="flex items-center gap-2">
        <CommonInputLine
          id="transaction-address-input"
          v-model.trim="inputted"
          :has-error="!!addressError"
          :placeholder="snsSupport ? 'Address, Soph.id or ENS' : 'Address or ENS'"
          type="text"
          maxlength="42"
          spellcheck="false"
          autocomplete="off"
          class="w-full text-lg"
        />
        <CommonQrUploadIconButton v-if="isMobile()" class="h-6 w-6" @decoded-address="inputted = $event" />
      </div>
      <transition v-bind="TransitionOpacity()">
        <CommonCardWithLineButtons v-if="selectAddressVisible" class="select-address-popover">
          <AddressCardLoader v-if="ensParseInProgress || typing" />
          <AddressCard
            v-else-if="name?.address && !typing"
            size="sm"
            :name="inputted.replace('.soph.id', '')"
            :address="name.address"
            :type="name.type"
            @click="inputted = name.address"
          />
          <CommonErrorBlock v-else-if="ensParseError" @try-again="parseNames">
            {{ ensParseError }}
          </CommonErrorBlock>
          <AddressCard
            v-else-if="previousTransactionAddress"
            size="sm"
            name="Previous transaction address"
            :address="previousTransactionAddress"
            @click="inputted = previousTransactionAddress"
          />
        </CommonCardWithLineButtons>
      </transition>
    </div>
    <slot name="input-body" />
    <CommonInputErrorMessage>
      <transition v-bind="TransitionOpacity()">
        <span v-if="addressError">
          <template v-if="addressError === 'invalid_address'">Invalid Ethereum 0x address</template>
          <template v-else-if="addressError === 'ens_not_found'">Nothing found for this name</template>
        </span>
      </transition>
    </CommonInputErrorMessage>
  </CommonContentBlock>
</template>

<script lang="ts" setup>
import { useDebounceFn } from "@vueuse/core";

import useNames from "~/composables/useNames";

const props = defineProps({
  label: {
    type: String,
    default: "Receiver",
  },
  modelValue: {
    type: String,
    default: "",
  },
  defaultLabel: {
    type: String,
  },
  addressInputHidden: {
    type: Boolean,
    default: false,
  },
  snsSupport: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (eventName: "update:error", error?: string): void;
  (eventName: "update:modelValue", amount: string): void;
}>();

const inputted = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const typing = ref(false);

const { isConnected } = storeToRefs(useOnboardStore());

const usingCustomValue = ref(!!inputted.value);
const toggleCustomValue = () => {
  usingCustomValue.value = !usingCustomValue.value;
  if (usingCustomValue.value) {
    nextTick(() => {
      const inputElement = document?.getElementById("transaction-address-input");
      inputElement?.focus?.();
    });
  } else {
    inputted.value = "";
  }
};

const inputVisible = computed(() => {
  return !props.addressInputHidden && (!props.defaultLabel || usingCustomValue.value || inputted.value);
});

// Debounced input for name resolution to avoid too many API calls
const debouncedInputForNames = ref(inputted.value);
const updateDebouncedInput = useDebounceFn((value: string) => {
  debouncedInputForNames.value = value;
  typing.value = false;
}, 500);

const {
  name,
  inProgress: ensParseInProgress,
  error: ensParseError,
  parseNames,
} = useNames(debouncedInputForNames, props.snsSupport);

const { previousTransactionAddress } = storeToRefs(usePreferencesStore());

// Watch for input changes and update debounced value
watch(
  inputted,
  (value) => {
    // For empty input, update immediately
    if (!value) {
      debouncedInputForNames.value = value;
      return;
    }
    typing.value = true;

    // For valid Ethereum addresses, update immediately (no need to resolve)
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (ethAddressRegex.test(value)) {
      debouncedInputForNames.value = value;
      return;
    }

    // For potential names (ENS/SNS), debounce the update
    updateDebouncedInput(value);
  },
  { immediate: true }
);

const selectAddressVisible = computed(() => {
  return (
    (!inputted.value && previousTransactionAddress.value) ||
    ensParseInProgress.value ||
    name.value?.address ||
    ensParseError.value
  );
});

const addressError = computed(() => {
  if (!inputted.value) {
    return undefined;
  }

  // Check if it's a valid Ethereum address (42 chars, starts with 0x, valid hex)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (ethAddressRegex.test(inputted.value)) {
    return undefined;
  }

  // If ENS resolution is in progress, don't show error yet
  if (ensParseInProgress.value) {
    return undefined;
  }

  // If ENS resolved successfully, no error
  if (name.value?.address) {
    return undefined;
  }

  // If we have an ENS error, show appropriate message
  if (ensParseError.value) {
    return "ens_not_found";
  }

  // If it looks like an address but is invalid format
  if (inputted.value.startsWith("0x")) {
    return "invalid_address";
  }

  // For potential ENS names that haven't been resolved yet
  // Only show error if we're not currently resolving and the debounced input matches current input
  if (debouncedInputForNames.value === inputted.value) {
    return "ens_not_found";
  }

  // Don't show error while user is still typing
  return undefined;
});

watch(
  addressError,
  (value) => {
    emit("update:error", value);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.transaction-address-input {
  @apply relative;
  &:has(#transaction-address-input:focus) {
    .select-address-popover {
      @apply pointer-events-auto opacity-100;
    }
  }

  .select-address-popover {
    @apply pointer-events-none absolute left-0 top-full z-[11] mt-1 w-full opacity-0 transition-opacity duration-300 hover:pointer-events-auto;
    &:not(:hover) {
      @apply focus-within:pointer-events-auto focus-within:opacity-100;
    }
  }
}
</style>
