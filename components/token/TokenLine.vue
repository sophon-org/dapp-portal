<template>
  <div class="token-line-row">
    <CommonButtonLineWithImg :as="as" :to="to">
      <template #image>
        <TokenImage :symbol="symbol" :address="address" :icon-url="iconUrl" />
      </template>
      <template #default>
        <CommonButtonLineBodyInfo class="text-left">
          <template #label>
            <div class="truncate">{{ symbol }}</div>
          </template>
          <template v-if="name" #underline>
            <div class="truncate">{{ name }}</div>
          </template>
        </CommonButtonLineBodyInfo>
      </template>
      <template #right>
        <slot name="right" />
      </template>
    </CommonButtonLineWithImg>
  </div>
</template>

<script lang="ts" setup>
import type { TokenPrice } from "@/types";
import type { Component } from "nuxt/schema";
import type { RouteLocationRaw } from "vue-router";

defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
  },
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },
  symbol: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  decimals: {
    type: Number,
    required: true,
  },
  iconUrl: {
    type: String,
  },
  price: {
    type: [String, Number] as PropType<TokenPrice>,
  },
});
</script>

<style lang="scss" scoped>
.token-line-row {
  display: flex;
  align-items: center;
}
</style>
