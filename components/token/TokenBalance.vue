<template>
  <TokenLine
    :symbol="symbol"
    :name="name"
    :address="address"
    :decimals="decimals"
    :icon-url="iconUrl"
    :as="sendRouteName ? 'RouterLink' : as"
    :to="sendRouteName ? { name: sendRouteName, query: { token: address } } : undefined"
    class="token-balance"
    :class="{ 'is-zero-amount': isZeroAmount }"
  >
    <template #right>
      <CommonButtonLineBodyInfo class="text-right">
        <template #secondary>
          <div class="flex items-center gap-3">
            <CommonButtonAddToWalletButton
              v-if="shouldShowAddToWallet"
              :asset="{
              address: address as `0x${string}`,
              decimals,
              symbol,
            }"
              variant="ghost"
            />
            <div class="token-balance-amount" :title="fullAmount">
              {{ displayedAmount }}
            </div>
          </div>
        </template>
        <template #underline>
          <div class="token-balance-price">
            <template v-if="price && !isZeroAmount">
              {{ formatTokenPrice(amount, decimals, price) }}
            </template>
          </div>
        </template>
      </CommonButtonLineBodyInfo>
    </template>
  </TokenLine>
</template>

<script lang="ts" setup>
import type { TokenPrice } from "@/types";
import type { BigNumberish } from "ethers";

const route = useRoute();

const props = defineProps({
  as: {
    type: [String, Object] as PropType<string | Component>,
  },
  amountDisplay: {
    type: String as PropType<"remove-small" | "full">,
    default: "remove-small",
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
  amount: {
    type: String as PropType<BigNumberish>,
    required: true,
  },
  price: {
    type: [String, Number] as PropType<TokenPrice>,
  },
  sendRouteName: {
    type: String,
  },
});

const shouldShowAddToWallet = computed(() => route.path !== "/bridge");

const isZeroAmount = computed(() => BigInt(props.amount) === 0n);

const fullAmount = computed(() => parseTokenAmount(props.amount, props.decimals));
const displayedAmount = computed(() => {
  if (typeof props.price !== "number") {
    return fullAmount.value;
  }
  if (props.amountDisplay === "remove-small") {
    return removeSmallAmountPretty(props.amount, props.decimals, props.price);
  }
  return fullAmount.value;
});
</script>

<style lang="scss" scoped>
.token-balance {
  &.is-zero-amount {
    .token-balance-amount {
      @apply opacity-30;
    }
  }
  .token-balance-amount {
    @apply max-w-[100px] truncate xs:max-w-[175px];
  }
}
</style>
