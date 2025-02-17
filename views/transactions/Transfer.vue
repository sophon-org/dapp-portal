<template>
  <div>
    <NetworkDeprecationAlert v-if="step === 'form'" />
    <slot v-if="step === 'form'" name="title" />
    <PageTitle
      v-else-if="step === 'withdrawal-finalization-warning'"
      :back-function="
        () => {
          step = 'form';
        }
      "
    >
      Withdrawal claim required
    </PageTitle>
    <PageTitle
      v-else-if="step === 'confirm'"
      :back-function="
        () => {
          step = 'form';
        }
      "
    >
      Confirm transaction
    </PageTitle>

    <NetworkSelectModal
      v-model:opened="fromNetworkModalOpened"
      title="From"
      :network-key="destinations.era.key"
      @update:network-key="fromNetworkSelected($event)"
    />
    <NetworkSelectModal
      v-model:opened="toNetworkModalOpened"
      title="To"
      :network-key="destination.key"
      @update:network-key="toNetworkSelected($event)"
    />

    <CommonErrorBlock v-if="tokensRequestError" @try-again="fetchBalances">
      Getting tokens error: {{ tokensRequestError.message }}
    </CommonErrorBlock>
    <CommonErrorBlock v-else-if="balanceError" @try-again="fetchBalances">
      Getting balances error: {{ balanceError.message }}
    </CommonErrorBlock>

    <form v-else @submit.prevent="">
      <template v-if="step === 'form'">
        <TransactionWithdrawalsAvailableForClaimAlert />
        <CommonInputTransactionAmount
          v-model="amount"
          v-model:error="amountError"
          v-model:token-address="amountInputTokenAddress"
          :label="type === 'withdrawal' ? 'From' : undefined"
          :tokens="availableTokens"
          :balances="availableBalances"
          :max-amount="maxAmount"
          :loading="tokensRequestInProgress || balanceInProgress"
          :approve-required="!enoughAllowance && (!tokenCustomBridge || !tokenCustomBridge.bridgingDisabled)"
        >
          <template v-if="type === 'withdrawal' && account.address" #token-dropdown-bottom>
            <CommonAlert class="sticky bottom-0 mt-6" variant="neutral" :icon="InformationCircleIcon">
              <p>Only tokens available for withdrawal are displayed</p>
            </CommonAlert>
          </template>
          <template v-if="type === 'withdrawal'" #dropdown>
            <CommonButtonDropdown
              :toggled="fromNetworkModalOpened"
              size="xs"
              variant="light"
              class="overflow-hidden"
              @click="fromNetworkModalOpened = true"
            >
              <template #left-icon>
                <img :src="destinations.era.iconUrl" class="h-full w-full" />
              </template>
              <span class="truncate">{{ destinations.era.label }}</span>
            </CommonButtonDropdown>
          </template>
        </CommonInputTransactionAmount>

        <CommonInputTransactionAddress
          v-if="type === 'withdrawal'"
          v-model="address"
          label="To"
          :default-label="`To your account ${account.address ? shortenAddress(account.address) : ''}`"
          :address-input-hidden="!!tokenCustomBridge"
          class="mt-6"
        >
          <template #dropdown>
            <CommonButtonDropdown
              :toggled="toNetworkModalOpened"
              size="xs"
              variant="light"
              class="overflow-hidden"
              @click="toNetworkModalOpened = true"
            >
              <template #left-icon>
                <img :src="destination.iconUrl" class="h-full w-full" />
              </template>
              <span class="truncate">{{ destination.label }}</span>
            </CommonButtonDropdown>
          </template>
        </CommonInputTransactionAddress>
        <CommonInputTransactionAddress v-else v-model="address" class="mt-6" />
        <TransactionCustomBridge
          v-if="tokenCustomBridge"
          type="withdraw"
          class="mt-6"
          :custom-bridge-token="tokenCustomBridge"
        />
        <CommonHeightTransition v-if="step === 'form'" :opened="!enoughAllowance && !continueButtonDisabled">
          <DestinationItem v-if="!enoughAllowance" as="div" class="p-8 sm:mt-block-gap" size="lg">
            <template #label> Approve {{ selectedToken?.symbol }} allowance </template>
            <template #underline>
              Before depositing you need to give our bridge permission to spend specified amount of
              {{ selectedToken?.symbol }}.
              <CommonButtonLabel variant="light" as="a" :href="TOKEN_ALLOWANCE" target="_blank">
                Learn more
              </CommonButtonLabel>
            </template>
            <template #image>
              <div class="aspect-square h-full w-full rounded-full bg-warning-400 p-3 text-black">
                <LockClosedIcon aria-hidden="true" />
              </div>
            </template>
          </DestinationItem>
        </CommonHeightTransition>
      </template>
      <template v-else-if="step === 'withdrawal-finalization-warning'">
        <CommonAlert variant="warning" :icon="ExclamationTriangleIcon" class="mb-block-padding-1/2 sm:mb-block-gap">
          <p>
            After the withdraw is processed and finalized (which takes
            <a class="underline underline-offset-2" :href="ZKSYNC_WITHDRAWAL_DELAY" target="_blank">3 or more hours</a
            >), you will need to manually claim your funds which requires paying another transaction fee on
            {{ eraNetwork.l1Network?.name }}. Alternatively you can use
            <a href="https://layerswap.io/app" target="_blank" class="underline underline-offset-2"
              >third-party bridges</a
            >.
          </p>
        </CommonAlert>
        <CommonButton size="lg" variant="primary" class="mx-auto mt-block-gap w-full" @click="buttonContinue()">
          I understand, proceed to withdrawal
        </CommonButton>
      </template>
      <template v-else-if="step === 'confirm'">
        <CommonAlert
          v-if="type === 'withdrawal'"
          variant="warning"
          :icon="ExclamationTriangleIcon"
          class="mb-block-padding-1/2 sm:mb-block-gap"
        >
          <p v-if="withdrawalManualFinalizationRequired">
            You will be able to claim your withdrawal only after it is finalized (which takes 3 or more hours).
            <a class="underline underline-offset-2" :href="ZKSYNC_WITHDRAWAL_DELAY" target="_blank">Learn more</a>
          </p>
          <p v-else>
            You will receive your funds once withdraw is finalized, which takes 3 or more hours.
            <a class="underline underline-offset-2" :href="ZKSYNC_WITHDRAWAL_DELAY" target="_blank">Learn more</a>
          </p>
        </CommonAlert>

        <CommonCardWithLineButtons>
          <TransactionSummaryTokenEntry label="You send" :token="transaction!.token" />
          <TransactionSummaryAddressEntry
            label="From"
            :address="transaction!.from.address"
            :destination="transaction!.from.destination"
          />
          <TransactionSummaryAddressEntry
            label="To"
            :address="transaction!.to.address"
            :destination="transaction!.to.destination"
          />
        </CommonCardWithLineButtons>

        <CommonErrorBlock v-if="transactionError" :retry-button="false" class="mt-4">
          {{ transactionError.message }}
        </CommonErrorBlock>
      </template>
      <template v-else-if="step === 'submitted'">
        <TransferSubmitted
          v-if="transactionInfo!.type === 'transfer'"
          :transaction="transactionInfo!"
          :make-another-transaction="resetForm"
        />
        <WithdrawalSubmitted
          v-else-if="transactionInfo!.type === 'withdrawal'"
          :transaction="transactionInfo!"
          :make-another-transaction="resetForm"
        />
      </template>

      <template v-if="!tokenCustomBridge && (step === 'form' || step === 'confirm')">
        <CommonErrorBlock v-if="feeError" class="mt-2" @try-again="estimate">
          Fee estimation error: {{ feeError.message }}
        </CommonErrorBlock>
        <div class="mt-4 flex items-center gap-4">
          <transition v-bind="TransitionOpacity()">
            <TransactionFeeDetails
              v-if="0 == 1 && !feeError && (fee || feeLoading)"
              label="Fee:"
              :fee-token="feeToken"
              :fee-amount="fee"
              :loading="feeLoading"
            />
          </transition>
          <CommonButtonLabel
            v-if="type === 'withdrawal' && !selectedToken?.isOft"
            as="a"
            :href="ZKSYNC_WITHDRAWAL_DELAY"
            target="_blank"
            class="ml-auto text-right"
          >
            3 or more hours to be finalized
          </CommonButtonLabel>
          <CommonButtonLabel v-else-if="type === 'transfer'" as="span" class="ml-auto text-right">
            Almost instant
          </CommonButtonLabel>
        </div>
        <transition v-bind="TransitionAlertScaleInOutTransition">
          <CommonAlert v-if="!enoughBalanceToCoverFee" class="mt-4" variant="error" :icon="ExclamationTriangleIcon">
            <p>
              Insufficient <span class="font-medium">{{ feeToken?.symbol }}</span> balance on
              {{ destinations.era.label }} to cover the fee
            </p>
            <NuxtLink :to="{ name: 'receive-methods' }" class="alert-link">Receive funds</NuxtLink>
          </CommonAlert>
          <CommonErrorBlock v-else-if="allowanceRequestError" class="mt-2" @try-again="requestAllowance">
            Checking allowance error: {{ allowanceRequestError.message }}
          </CommonErrorBlock>
          <CommonErrorBlock v-else-if="setAllowanceError" class="mt-2" @try-again="setTokenAllowance">
            Allowance approval error: {{ setAllowanceError.message }}
          </CommonErrorBlock>
        </transition>

        <TransactionFooter>
          <template #after-checks>
            <template v-if="step === 'form'">
              <template v-if="!enoughAllowance && !continueButtonDisabled">
                <CommonButton
                  type="submit"
                  :disabled="continueButtonDisabled || setAllowanceInProgress"
                  size="lg"
                  variant="primary"
                  class="w-full"
                  @click="setTokenAllowance()"
                >
                  <transition v-bind="TransitionPrimaryButtonText" mode="out-in">
                    <span v-if="setAllowanceStatus === 'processing'">Processing...</span>
                    <span v-else-if="setAllowanceStatus === 'waiting-for-signature'"
                      >Waiting for allowance approval confirmation</span
                    >
                    <span v-else-if="setAllowanceStatus === 'sending'" class="flex items-center">
                      <CommonSpinner class="mr-2 h-6 w-6" />
                      Approving allowance...
                    </span>
                    <span v-else>Approve {{ selectedToken?.symbol }} allowance</span>
                  </transition>
                </CommonButton>
                <TransactionButtonUnderlineConfirmTransaction
                  :opened="setAllowanceStatus === 'waiting-for-signature'"
                />
              </template>
              <CommonButton
                v-else
                type="submit"
                :disabled="continueButtonDisabled"
                size="lg"
                variant="primary"
                class="w-full"
                @click="buttonContinue()"
              >
                Continue
              </CommonButton>
            </template>
            <template v-else-if="step === 'confirm'">
              <transition v-bind="TransitionAlertScaleInOutTransition">
                <div v-if="!enoughBalanceForTransaction" class="mb-4">
                  <CommonAlert variant="error" :icon="ExclamationTriangleIcon">
                    <p>
                      {{
                        selectedToken?.address === L2_BASE_TOKEN_ADDRESS
                          ? "The fee has changed since the last estimation. "
                          : ""
                      }}Insufficient <span class="font-medium">{{ selectedToken?.symbol }}</span> balance to pay for
                      transaction. Please go back and adjust the amount to proceed.
                    </p>
                    <button type="button" class="alert-link" @click="step = 'form'">Go back</button>
                  </CommonAlert>
                </div>
              </transition>
              <CommonButton
                :disabled="
                  continueButtonDisabled ||
                  transactionStatus !== 'not-started' ||
                  transactionStatusLayerzero !== 'not-started'
                "
                class="w-full"
                size="lg"
                variant="primary"
                @click="buttonContinue()"
              >
                <transition v-bind="TransitionPrimaryButtonText" mode="out-in">
                  <span v-if="transactionStatus === 'processing' || transactionStatusLayerzero === 'processing'"
                    >Processing...</span
                  >
                  <span
                    v-else-if="
                      transactionStatus === 'waiting-for-signature' ||
                      transactionStatusLayerzero === 'waiting-for-signature'
                    "
                    >Waiting for confirmation</span
                  >
                  <span v-else>
                    {{ type === "withdrawal" ? "Bridge now" : "Send now" }}
                  </span>
                </transition>
              </CommonButton>
              <TransactionButtonUnderlineConfirmTransaction :opened="transactionStatus === 'waiting-for-signature'" />
            </template>
          </template>
        </TransactionFooter>
      </template>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ExclamationTriangleIcon, InformationCircleIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import { useRouteQuery } from "@vueuse/router";
import { BigNumber } from "ethers";
import { isAddress } from "ethers/lib/utils";

import useLayerzeroFee from "@/composables/layerzero/useFee";
import useLayerzeroTransaction from "@/composables/layerzero/useTransaction";
import useFee from "@/composables/zksync/useFee";
import useTransaction, { isWithdrawalManualFinalizationRequired } from "@/composables/zksync/useTransaction";
import { customBridgeTokens } from "@/data/customBridgeTokens";
import { isMainnet } from "@/data/networks";
import TransferSubmitted from "@/views/transactions/TransferSubmitted.vue";
import WithdrawalSubmitted from "@/views/transactions/WithdrawalSubmitted.vue";
import useWithdrawalAllowance from "~/composables/transaction/useWithdrawalAllowance";

import type { FeeEstimationParams } from "@/composables/zksync/useFee";
import type { Token, TokenAmount } from "@/types";
import type { BigNumberish } from "ethers";
import type { TransactionResponse } from "zksync-ethers/build/types";

// TODO(@consvic): Remove this after some time
const FILTERED_TOKENS = computed(() => {
  return isMainnet(selectedNetwork.value.id) ? [] : ["SOPH"];
});

const props = defineProps({
  type: {
    type: String as PropType<FeeEstimationParams["type"]>,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();

const onboardStore = useOnboardStore();
const walletStore = useZkSyncWalletStore();
const tokensStore = useZkSyncTokensStore();
const providerStore = useZkSyncProviderStore();
const { account, isConnected } = storeToRefs(onboardStore);
const { eraNetwork } = storeToRefs(providerStore);
const { destinations } = storeToRefs(useDestinationsStore());
const { tokens, tokensRequestInProgress, tokensRequestError } = storeToRefs(tokensStore);
const { balance, balanceInProgress, balanceError } = storeToRefs(walletStore);
const { selectedNetwork } = storeToRefs(useNetworkStore());
const refetchingAllowance = ref(false);

const toNetworkModalOpened = ref(false);
const toNetworkSelected = (networkKey?: string) => {
  if (destinations.value.era.key === networkKey) {
    router.replace({ name: "bridge", query: route.query });
  }
};
const fromNetworkModalOpened = ref(false);
const fromNetworkSelected = (networkKey?: string) => {
  if (destinations.value.ethereum.key === networkKey) {
    router.replace({ name: "bridge", query: route.query });
  }
};

const step = ref<"form" | "withdrawal-finalization-warning" | "confirm" | "submitted">("form");
const destination = computed(() => (props.type === "transfer" ? destinations.value.era : destinations.value.ethereum));

const availableTokens = computed(() => {
  if (!tokens.value) return [];
  if (props.type === "withdrawal") {
    return Object.values(tokens.value).filter((e) => e.l1Address && !FILTERED_TOKENS.value.includes(e.symbol));
  }
  return Object.values(tokens.value);
});
const availableBalances = computed(() => {
  if (props.type === "withdrawal") {
    if (!tokens.value) return [];
    return balance.value.filter((e) => e.l1Address && !FILTERED_TOKENS.value.includes(e.symbol));
  }
  return balance.value;
});
const routeTokenAddress = computed(() => {
  if (!route.query.token || Array.isArray(route.query.token) || !isAddress(route.query.token)) {
    return;
  }
  return checksumAddress(route.query.token);
});
const defaultToken = computed(
  () => availableTokens.value.find((e) => e.address === L2_BASE_TOKEN_ADDRESS) ?? availableTokens.value[0] ?? undefined
);
const selectedTokenAddress = ref<string | undefined>(routeTokenAddress.value ?? defaultToken.value?.address);
const selectedToken = computed<Token | undefined>(() => {
  if (!tokens.value) {
    return undefined;
  }
  return selectedTokenAddress.value
    ? availableTokens.value.find((e) => e.address === selectedTokenAddress.value) ||
        availableBalances.value.find((e) => e.address === selectedTokenAddress.value) ||
        defaultToken.value
    : defaultToken.value;
});
const tokenCustomBridge = computed(() => {
  if (props.type !== "withdrawal" && selectedToken.value) {
    return undefined;
  }
  const customBridgeToken = customBridgeTokens.find(
    (e) => eraNetwork.value.l1Network?.id === e.chainId && e.l1Address === selectedToken.value?.l1Address
  );
  if (!customBridgeToken?.bridges.some((e) => e.withdrawUrl)) {
    return undefined;
  }
  return customBridgeToken;
});
const amountInputTokenAddress = computed({
  get: () => selectedToken.value?.address,
  set: (address) => {
    selectedTokenAddress.value = address;
  },
});
const tokenBalance = computed<BigNumberish | undefined>(() => {
  return balance.value.find((e) => e.address === selectedToken.value?.address)?.amount;
});

const unsubscribe = onboardStore.subscribeOnAccountChange(() => {
  step.value = "form";
});

const totalComputeAmount = computed(() => {
  try {
    if (!amount.value || !selectedToken.value) {
      return BigNumber.from("0");
    }
    return decimalToBigNumber(amount.value, selectedToken.value.decimals);
  } catch (error) {
    return BigNumber.from("0");
  }
});

const {
  result: allowance,
  error: allowanceRequestError,
  requestAllowance,

  setAllowanceStatus,
  setAllowanceInProgress,
  setAllowanceError,
  setAllowance,
} = useWithdrawalAllowance(
  providerStore.requestProvider,
  computed(() => account.value.address),
  computed(() => selectedToken.value?.address),
  computed(() => selectedToken.value?.isOft)
);

const enoughAllowance = computed(() => {
  if (!allowance.value || !selectedToken.value || transaction.value?.type === "transfer") {
    return true;
  }
  return !allowance.value.isZero() && allowance.value.gte(totalComputeAmount.value);
});

const setTokenAllowance = async () => {
  refetchingAllowance.value = true;
  try {
    await setAllowance(totalComputeAmount.value);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for balances to be updated on API side
    await fetchBalances(true);
  } finally {
    refetchingAllowance.value = false;
  }
};

const {
  gasLimit: gasLimitDefault,
  gasPrice: gasPriceDefault,
  result: fee,
  inProgress: feeInProgress,
  error: feeError,
  feeToken,
  enoughBalanceToCoverFee,
  estimateFee,
  resetFee,
} = useFee(providerStore.requestProvider, tokens, balance, totalComputeAmount);

const {
  gasLimit: gasLimitLayerzero,
  gasPrice: gasPriceLayerzero,
  result: feeLayerzero,
  estimateFee: estimateLayerzeroFee,
} = useLayerzeroFee(walletStore.getSigner, providerStore.requestProvider);

const gasLimit = computed(() => (selectedToken.value?.isOft ? gasLimitLayerzero.value : gasLimitDefault.value));
const gasPrice = computed(() => (selectedToken.value?.isOft ? gasPriceLayerzero.value : gasPriceDefault.value));

const queryAddress = useRouteQuery<string | undefined>("address", undefined, {
  transform: String,
  mode: "replace",
});
const address = ref((queryAddress.value !== "undefined" && queryAddress.value) || "");
const isAddressInputValid = computed(() => {
  if (address.value) {
    return isAddress(address.value);
  }
  if (props.type === "withdrawal") {
    return true; // Own address by default
  }
  return false;
});
watch(address, (_address) => {
  queryAddress.value = !_address.length ? undefined : _address;
});

const amount = ref("");
const amountError = ref<string | undefined>();
const maxAmount = computed(() => {
  if (!selectedToken.value || !tokenBalance.value) {
    return undefined;
  }
  if (feeToken.value?.address === selectedToken.value.address) {
    if (BigNumber.from(tokenBalance.value).isZero()) {
      return "0";
    }
    if (!fee.value) {
      return undefined;
    }
    if (BigNumber.from(fee.value).gt(tokenBalance.value)) {
      return "0";
    }
    return BigNumber.from(tokenBalance.value).sub(fee.value).toString();
  }
  return tokenBalance.value.toString();
});

const enoughBalanceForTransaction = computed(() => {
  if (!fee.value || !selectedToken.value || !tokenBalance.value) {
    return true;
  }
  const totalToPay = totalComputeAmount.value.add(
    selectedToken.value.address === feeToken.value?.address ? fee.value : "0"
  );
  return BigNumber.from(tokenBalance.value).gte(totalToPay);
});

const transaction = computed<
  | {
      type: FeeEstimationParams["type"];
      token: TokenAmount;
      from: { address: string; destination: TransactionDestination };
      to: { address: string; destination: TransactionDestination };
    }
  | undefined
>(() => {
  const toAddress = isAddress(address.value) ? address.value : account.value.address;
  if (!toAddress || !selectedToken.value) {
    return undefined;
  }
  return {
    type: props.type,
    token: {
      ...selectedToken.value!,
      amount: totalComputeAmount.value.toString(),
    },
    from: {
      address: account.value.address!,
      destination: destinations.value.era,
    },
    to: {
      address: toAddress,
      destination: destination.value,
    },
  };
});

const withdrawalManualFinalizationRequired = computed(() => {
  if (!transaction.value) return false;
  return (
    props.type === "withdrawal" &&
    isWithdrawalManualFinalizationRequired(transaction.value.token, eraNetwork.value.l1Network?.id || -1) &&
    !selectedToken.value?.isOft
  );
});

const feeLoading = computed(() => feeInProgress.value || (!fee.value && balanceInProgress.value));
const estimate = async () => {
  // estimation fails when token balance is 0
  if (
    !transaction.value?.from.address ||
    !transaction.value?.to.address ||
    !selectedToken.value ||
    !tokenBalance.value ||
    BigNumber.from(tokenBalance.value).isZero()
  ) {
    return;
  }
  if (transaction.value?.token.isOft) {
    await estimateLayerzeroFee({
      type: props.type,
      token: transaction.value.token,
      amount: totalComputeAmount.value,
      from: transaction.value.from.address,
      to: transaction.value.to.address,
    });
  } else {
    await estimateFee({
      type: props.type,
      from: transaction.value.from.address,
      to: transaction.value.to.address,
      tokenAddress: selectedToken.value.address,
    });
  }
};
watch(
  [() => selectedToken.value?.address, () => tokenBalance.value?.toString(), () => enoughAllowance.value],
  () => {
    resetFee();
    estimate();
  },
  { immediate: true }
);

const autoUpdatingFee = computed(() => !feeError.value && fee.value && !feeLoading.value);
const { reset: resetAutoUpdateEstimate, stop: stopAutoUpdateEstimate } = useInterval(async () => {
  if (!autoUpdatingFee.value) return;
  await estimate();
}, 60000);
watch(
  autoUpdatingFee,
  (updatingFee) => {
    if (!updatingFee) {
      stopAutoUpdateEstimate();
    } else {
      resetAutoUpdateEstimate();
    }
  },
  { immediate: true }
);

const continueButtonDisabled = computed(() => {
  if (
    !isAddressInputValid.value ||
    !transaction.value ||
    !enoughBalanceToCoverFee.value ||
    !enoughBalanceForTransaction.value ||
    !!amountError.value ||
    BigNumber.from(transaction.value.token.amount).isZero()
  ) {
    return true;
  }
  if (feeLoading.value || !fee.value) return true;

  return false;
});
const buttonContinue = () => {
  if (continueButtonDisabled.value) {
    return;
  }
  if (step.value === "form") {
    if (withdrawalManualFinalizationRequired.value) {
      step.value = "withdrawal-finalization-warning";
    } else {
      step.value = "confirm";
    }
  } else if (step.value === "withdrawal-finalization-warning") {
    step.value = "confirm";
  } else if (step.value === "confirm") {
    makeTransaction();
  }
};

/* Transaction signing and submitting */
const transfersHistoryStore = useZkSyncTransfersHistoryStore();
const { previousTransactionAddress } = storeToRefs(usePreferencesStore());
const {
  status: transactionStatus,
  error: transactionError,
  commitTransaction,
} = useTransaction(walletStore.getSigner, providerStore.requestProvider);
const { saveTransaction, waitForCompletion } = useZkSyncTransactionStatusStore();
const {
  status: transactionStatusLayerzero,
  error: transactionErrorLayerzero,
  commitTransaction: commitLayerzeroTransaction,
} = useLayerzeroTransaction(walletStore.getSigner);

watch(step, (newStep) => {
  if (newStep === "form") {
    transactionError.value = undefined;
  }
});

const transactionInfo = ref<TransactionInfo | undefined>();
const makeTransaction = async () => {
  if (continueButtonDisabled.value) return;
  let tx: TransactionResponse | undefined;
  if (transaction.value?.token.isOft) {
    tx = await commitLayerzeroTransaction({
      token: transaction.value.token,
      amount: transaction.value.token.amount,
      from: account.value.address!,
      to: transaction.value!.to.address,
      nativeFee: feeLayerzero.value!.nativeFee,
      gasLimit: gasLimit.value!,
      gasPrice: gasPrice.value!,
    });
  } else {
    tx = await commitTransaction(
      {
        type: props.type,
        to: transaction.value!.to.address,
        tokenAddress: transaction.value!.token.address,
        amount: transaction.value!.token.amount,
      },
      {
        gasLimit: gasLimit.value!,
        gasPrice: gasPrice.value!,
      }
    );
  }

  if (transactionStatus.value === "done" || transactionStatusLayerzero.value === "done") {
    step.value = "submitted";
    previousTransactionAddress.value = transaction.value!.to.address;
  }

  if (tx) {
    const fee = calculateFee(gasLimit.value!, gasPrice.value!);
    walletStore.deductBalance(feeToken.value!.address, fee);
    walletStore.deductBalance(transaction.value!.token.address, transaction.value!.token.amount);
    transactionInfo.value = {
      type: transaction.value!.type,
      transactionHash: tx.hash,
      timestamp: new Date().toISOString(),
      token: transaction.value!.token,
      from: transaction.value!.from,
      to: transaction.value!.to,
      info: {
        expectedCompleteTimestamp:
          transaction.value?.type === "withdrawal"
            ? new Date(new Date().getTime() + WITHDRAWAL_DELAY).toISOString()
            : undefined,
        completed: false,
      },
    };
    saveTransaction(transactionInfo.value);
    silentRouterChange(
      router.resolve({
        name: "transaction-hash",
        params: { hash: transactionInfo.value.transactionHash },
        query: { network: eraNetwork.value.key },
      }).href
    );
    waitForCompletion(transactionInfo.value)
      .then((completedTransaction) => {
        transactionInfo.value = completedTransaction;
        trackEvent(transaction.value!.type, {
          token: transaction.value!.token.symbol,
          amount: transaction.value!.token.amount,
          to: transaction.value!.to.address,
        });
        setTimeout(() => {
          transfersHistoryStore.reloadRecentTransfers().catch(() => undefined);
          walletStore.requestBalance({ force: true }).catch(() => undefined);
        }, 2000);
      })
      .catch((err) => {
        transactionError.value = err as Error;
        transactionStatus.value = "not-started";
        transactionErrorLayerzero.value = err as Error;
        transactionStatusLayerzero.value = "not-started";
      });
  }
};

const resetForm = () => {
  address.value = "";
  amount.value = "";
  step.value = "form";
  transactionStatus.value = "not-started";
  transactionInfo.value = undefined;
  silentRouterChange((route as unknown as { href: string }).href);
};

const fetchBalances = async (force = false) => {
  tokensStore.requestTokens();
  if (!isConnected.value) return;

  await walletStore.requestBalance({ force });
};
fetchBalances();

const unsubscribeFetchBalance = onboardStore.subscribeOnAccountChange((newAddress) => {
  if (!newAddress) return;
  fetchBalances();
  resetFee();
  estimate();
});

onBeforeUnmount(() => {
  unsubscribe();
  unsubscribeFetchBalance();
});
</script>

<style lang="scss" scoped></style>
