<template>
  <div
    class="border-gray-200 bg-gray-50 cursor-pointer rounded-xl border hover:bg-white dark:border-neutral-800/70 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"
    @click="runQuote"
  >
    <div class="quote-grid grid gap-2 p-3">
      <div class="amount-section">
        <div>
          <div>
            <span class="font-bold" :title="balance[1]">{{ balance[0] }} {{ quote.receive.token.symbol }}</span>
            <span class="text-gray-600 dark:text-gray-400 text-xs">
              &nbsp;~{{ formatFiat(quote.receive.amountFiat, quote.pay.currency) }}
              <span class="text-gray-400 dark:text-gray-500"
                >&nbsp;(Fee: {{ formatFiat(quote.pay.totalFeeFiat, quote.pay.currency) }})</span
              >
            </span>
          </div>
        </div>
      </div>
      <div class="details-section">
        <span v-if="quote.steps.length > 1" class="dark:text-gray-400 text-xs">
          Purchase ETH with {{ provider.name }}, then swap to {{ quote.receive.token.symbol }} via
          {{ (quote.steps[1] as any).swapQuote.toolDetails.name }}
        </span>
      </div>
      <div class="provider-section flex">
        <div class="payment-method inline-block text-right">
          <div class="text-gray-600 dark:text-gray-400 mb-1 text-xs leading-5">
            {{ parsePaymentMethod(quote.method) }}
          </div>
          <div class="text-gray-700 dark:text-gray-300 text-xs">via {{ provider.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { quoteToRoute, type PaymentMethod, type ProviderQuoteOption } from "zksync-easy-onramp";

import { useOrderProcessingStore } from "@/store/on-ramp/order-processing";

const props = defineProps<{
  quote: ProviderQuoteOption["paymentMethods"][0];
  provider: ProviderQuoteOption["provider"];
}>();

const balance = computed(() => {
  return formatTokenBalance(props.quote.receive.amountUnits, props.quote.receive.token.decimals);
});

function parsePaymentMethod(paymentMethodId: PaymentMethod) {
  switch (paymentMethodId) {
    case "credit_card":
      return "Credit card";
    case "apple_pay_credit":
      return "Apple Pay";
    case "google_pay_credit":
      return "Google Pay";
    case "google_pay_debit":
      return "Google Pay (Debit)";
    case "apple_pay_debit":
      return "Apple Pay (Debit)";
    case "debit_card":
      return "Debit card";
    case "wire":
      return "Wire transfer";
    case "sepa":
      return "SEPA transfer";
    case "pix":
      return "PIX";
    case "ach":
      return "ACH";
    case "koywe":
      return "Koywe";
    default:
      return paymentMethodId;
  }
}

const { setStep } = useOnRampStore();
const { selectQuote } = useOrderProcessingStore();
function runQuote() {
  const routeToExecute = quoteToRoute("buy", props.quote, props.provider);
  selectQuote(routeToExecute);
  setStep("processing");
}
</script>

<style lang="scss" scoped>
.details-section {
  grid-area: details;
}

.amount-section {
  grid-area: amount;
}

.provider-section {
  grid-area: provider;
  justify-self: end;
}

.quote-grid {
  grid-template-areas:
    "amount provider"
    "details provider";
}

@media (max-width: 450px) {
  .quote-grid {
    grid-template-areas:
      "amount"
      "provider"
      "details";
  }

  .provider-section {
    justify-self: start;
  }

  .payment-method {
    text-align: left;

    & > div {
      display: inline;

      &:last-child {
        @apply pl-0.5;
      }
    }
  }
}
</style>
