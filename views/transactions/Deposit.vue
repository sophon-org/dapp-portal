<template>
  <div>
    <NetworkDeprecationAlert v-if="step === 'form'" />
    <PageTitle v-if="step === 'form'" class="text-balance text-center font-semibold text-black">
      Bridge.
      <span class="text-gray">The gateway to Sophon.</span>
    </PageTitle>
    <PageTitle v-else-if="step === 'wallet-warning'" class="font-semibold text-black">Wallet warning</PageTitle>
    <PageTitle
      v-else-if="step === 'confirm'"
      class="font-semibold text-black"
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
      :network-key="destinations.ethereum.key"
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
      <CommonAlert v-if="isTokenBlacklisted" variant="error" :icon="ExclamationTriangleIcon" class="mb-4">
        <p>This token cannot be bridged. Please select a different token.</p>
      </CommonAlert>
      <template v-if="step === 'form'">
        <TransactionWithdrawalsAvailableForClaimAlert />
        <EcosystemBlock
          v-if="eraNetwork.displaySettings?.showPartnerLinks && ecosystemBannerVisible"
          show-close-button
          class="mb-block-padding-1/2 sm:mb-block-gap"
        />
        <CommonInputTransactionAmount
          v-model="amount"
          v-model:error="amountError"
          v-model:token-address="amountInputTokenAddress"
          label="From"
          :tokens="availableTokens"
          :balances="availableBalances"
          :max-amount="maxAmount"
          :approve-required="!enoughAllowance && (!tokenCustomBridge || !tokenCustomBridge.bridgingDisabled)"
          :loading="tokensRequestInProgress || balanceInProgress"
          class="mb-block-padding-1/2 sm:mb-block-gap"
          @additional-token-found="handleAdditionalToken"
        >
          <template #dropdown>
            <CommonButtonDropdown
              :toggled="fromNetworkModalOpened"
              size="xs"
              variant="light"
              @click="fromNetworkModalOpened = true"
            >
              <template #left-icon>
                <img :src="destinations.ethereum.iconUrl" class="h-full w-full" />
              </template>
              <span>{{ destinations.ethereum.label }}</span>
            </CommonButtonDropdown>
          </template>
        </CommonInputTransactionAmount>
        <CommonInputTransactionAddress
          v-model="address"
          label="To"
          :default-label="`To your account ${account.address ? shortenAddress(account.address) : ''}`"
          :address-input-hidden="tokenCustomBridge?.bridgingDisabled"
        >
          <template #dropdown>
            <CommonButtonDropdown
              :toggled="toNetworkModalOpened"
              size="xs"
              variant="light"
              @click="toNetworkModalOpened = true"
            >
              <template #left-icon>
                <img :src="destination.iconUrl" class="h-full w-full" />
              </template>
              <span>{{ destination.label }}</span>
            </CommonButtonDropdown>
          </template>
        </CommonInputTransactionAddress>
        <TransactionCustomBridge
          v-if="tokenCustomBridge?.bridgingDisabled"
          type="deposit"
          class="mt-6"
          :custom-bridge-token="tokenCustomBridge"
        />
      </template>
      <template v-else-if="step === 'wallet-warning'">
        <CommonAlert variant="warning" :icon="ExclamationTriangleIcon" class="mb-block-padding-1/2 sm:mb-block-gap">
          <p>
            Make sure the destination address supports {{ eraNetwork.name }} network, especially if it is a smart
            account or contract. Otherwise, this can result in
            <span class="font-medium text-red-600">loss of funds</span>.
          </p>
        </CommonAlert>
        <CommonButton
          type="submit"
          size="lg"
          variant="primary"
          class="mt-block-gap w-full gap-1"
          @click="buttonContinue()"
        >
          I understand, proceed to bridge
        </CommonButton>
        <CommonButton size="sm" variant="light" class="mx-auto mt-block-gap w-max" @click="disableWalletWarning()">
          Don't show again
        </CommonButton>
      </template>
      <template v-else-if="step === 'confirm'">
        <CommonCardWithLineButtons>
          <TransactionSummaryTokenEntry label="You bridge" :token="transaction!.token" />
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
        <DepositSubmitted :transaction="transactionInfo!" :make-another-transaction="resetForm" />
      </template>

      <template
        v-if="(!tokenCustomBridge || !tokenCustomBridge?.bridgingDisabled) && (step === 'form' || step === 'confirm')"
      >
        <CommonErrorBlock v-if="feeError" class="mt-2" @try-again="estimate">
          Fee estimation error: {{ feeError.message }}
        </CommonErrorBlock>
        <div class="mt-4 flex items-center gap-4">
          <transition v-bind="TransitionOpacity()">
            <TransactionFeeDetails
              v-if="!feeError && (fee || feeLoading) && account.chainId === l1Network?.id"
              label="Fee:"
              :fee-token="feeToken"
              :fee-amount="fee"
              :loading="feeLoading"
            />
          </transition>
          <CommonButtonLabel
            v-if="!isCustomNode"
            as="span"
            class="ml-auto text-right font-semibold text-gray-2"
            variant="light"
          >
            ~15 minutes
          </CommonButtonLabel>
        </div>
        <transition v-bind="TransitionAlertScaleInOutTransition" mode="out-in">
          <CommonAlert
            v-if="recommendedBalance && feeToken && account.chainId === l1Network?.id"
            class="mt-4"
            variant="error"
            :icon="ExclamationTriangleIcon"
          >
            <p>
              Insufficient <span class="font-medium">{{ feeToken?.symbol }}</span> balance on
              {{ destinations.ethereum.label }} to cover the fee. We recommend having at least
              <span class="font-medium"
                >{{
                  feeToken?.price
                    ? removeSmallAmountPretty(recommendedBalance, feeToken?.decimals, feeToken?.price)
                    : parseTokenAmount(recommendedBalance, feeToken?.decimals || 18)
                }}
                {{ feeToken?.symbol }}</span
              >
              on {{ eraNetwork.l1Network?.name ?? "L1" }} for deposit.
            </p>
            <NuxtLink :to="{ name: 'receive-methods' }" class="alert-link">Receive funds</NuxtLink>
          </CommonAlert>
          <CommonAlert
            v-else-if="!enoughBalanceToCoverFee && account.chainId === l1Network?.id"
            class="mt-4"
            variant="error"
            :icon="ExclamationTriangleIcon"
          >
            <p>
              Insufficient <span class="font-medium">{{ feeToken?.symbol }}</span> balance on
              <span class="font-medium">{{ destinations.ethereum.label }}</span> to cover the fee
            </p>
            <NuxtLink :to="{ name: 'receive-methods' }" class="alert-link">Receive funds</NuxtLink>
          </CommonAlert>
        </transition>
        <CommonErrorBlock v-if="allowanceRequestError" class="mt-2" @try-again="requestAllowance">
          Checking allowance error: {{ allowanceRequestError.message }}
        </CommonErrorBlock>
        <CommonErrorBlock v-else-if="setAllowanceError" class="mt-2" @try-again="setTokenAllowance">
          Allowance approval error: {{ setAllowanceError.message }}
        </CommonErrorBlock>
        <CommonHeightTransition
          v-if="step === 'form'"
          :opened="(!enoughAllowance && !continueButtonDisabled) || !!setAllowanceReceipt"
        >
          <CommonCardWithLineButtons class="mt-4">
            <DestinationItem
              v-if="enoughAllowance && setAllowanceReceipt"
              as="div"
              :description="`You can now proceed to deposit`"
            >
              <template #label>
                {{ selectedToken?.symbol }} allowance approved
                <a
                  v-if="l1BlockExplorerUrl"
                  :href="`${l1BlockExplorerUrl}/tx/${setAllowanceReceipt.transactionHash}`"
                  target="_blank"
                  class="inline-flex items-center gap-1 underline underline-offset-2"
                >
                  View on Explorer
                  <ArrowTopRightOnSquareIcon class="h-6 w-6" aria-hidden="true" />
                </a>
              </template>
              <template #image>
                <div class="aspect-square h-full w-full rounded-full bg-success-400 p-3 text-black">
                  <CheckIcon aria-hidden="true" />
                </div>
              </template>
            </DestinationItem>
            <DestinationItem v-else as="div">
              <template #label>
                Approve {{ selectedToken?.symbol }} allowance
                <a
                  v-if="l1BlockExplorerUrl && setAllowanceTransactionHash"
                  :href="`${l1BlockExplorerUrl}/tx/${setAllowanceTransactionHash}`"
                  target="_blank"
                  class="inline-flex items-center gap-1 underline underline-offset-2"
                >
                  View on Explorer
                  <ArrowTopRightOnSquareIcon class="h-6 w-6" aria-hidden="true" />
                </a>
              </template>
              <template #underline>
                Before depositing you need to give our bridge permission to spend specified amount of
                {{ selectedToken?.symbol }}.
                <span v-if="allowance && !allowance.isZero()"
                  >You can deposit up to
                  <CommonButtonLabel variant="light" @click="setAmountToCurrentAllowance()">
                    {{ parseTokenAmount(allowance!, selectedToken!.decimals) }}
                  </CommonButtonLabel>
                  {{ selectedToken!.symbol }} without approving a new allowance.
                </span>
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
          </CommonCardWithLineButtons>
        </CommonHeightTransition>

        <EthereumTransactionFooter>
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
                  <CommonAlert
                    v-if="amountError === 'exceeds_max_amount'"
                    variant="error"
                    :icon="ExclamationTriangleIcon"
                  >
                    <p>
                      The inputted amount is higher than the recommended maximum amount. This means your transaction
                      might fail.
                    </p>
                    <button type="button" class="alert-link" @click="step = 'form'">Go back</button>
                  </CommonAlert>
                  <CommonAlert v-else-if="continueButtonDisabled" variant="error" :icon="ExclamationTriangleIcon">
                    <p>
                      The fee has changed since the last estimation. Insufficient
                      <span class="font-medium">{{ selectedToken?.symbol }}</span> balance to pay for transaction.
                      Please go back and adjust the amount to proceed.
                    </p>
                    <button type="button" class="alert-link" @click="step = 'form'">Go back</button>
                  </CommonAlert>
                </div>
              </transition>
              <CommonButton
                :disabled="continueButtonDisabled || transactionStatus !== 'not-started'"
                class="w-full"
                size="lg"
                variant="primary"
                @click="buttonContinue()"
              >
                <transition v-bind="TransitionPrimaryButtonText" mode="out-in">
                  <span v-if="transactionStatus === 'processing'">Processing...</span>
                  <span v-else-if="transactionStatus === 'waiting-for-signature'">Waiting for confirmation</span>
                  <span v-else>Bridge now</span>
                </transition>
              </CommonButton>
              <TransactionButtonUnderlineConfirmTransaction :opened="transactionStatus === 'waiting-for-signature'" />
            </template>
          </template>
        </EthereumTransactionFooter>
      </template>
    </form>
  </div>
</template>

<script lang="ts" setup>
import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/vue/24/outline";
import { useRouteQuery } from "@vueuse/router";
import { BigNumber } from "ethers";
import { isAddress } from "ethers/lib/utils";

import EthereumTransactionFooter from "@/components/transaction/EthereumTransactionFooter.vue";
import useAllowance from "@/composables/transaction/useAllowance";
import useEcosystemBanner from "@/composables/zksync/deposit/useEcosystemBanner";
import useFee from "@/composables/zksync/deposit/useFee";
import useTransaction from "@/composables/zksync/deposit/useTransaction";
import { customBridgeTokens } from "@/data/customBridgeTokens";
import { isCustomNode, isMainnet } from "@/data/networks";
import DepositSubmitted from "@/views/transactions/DepositSubmitted.vue";
import { MAINNET } from "~/data/mainnet";
import { TESTNET } from "~/data/testnet";

import type { BlacklistedToken, Token, TokenAmount } from "@/types";
import type { BigNumberish } from "ethers";

// TODO(@consvic): Add noon token to the blacklist
const BLACKLISTED_TOKENS: globalThis.ComputedRef<BlacklistedToken[]> = computed(() => {
  return isMainnet(selectedNetwork.value.id) ? MAINNET.BLACKLISTED_TOKENS : [];
});

// TODO(@consvic): Remove this after some time
const FILTERED_TOKENS = computed(() => {
  return isMainnet(selectedNetwork.value.id) ? ["SOPH"] : [];
});
const route = useRoute();
const router = useRouter();

const onboardStore = useOnboardStore();
const tokensStore = useZkSyncTokensStore();
const providerStore = useZkSyncProviderStore();
const zkSyncEthereumBalance = useZkSyncEthereumBalanceStore();
const eraWalletStore = useZkSyncWalletStore();
const { account, isConnected, walletNotSupported, walletWarningDisabled } = storeToRefs(onboardStore);
const { eraNetwork } = storeToRefs(providerStore);
const { destinations } = storeToRefs(useDestinationsStore());
const { l1BlockExplorerUrl, selectedNetwork, l1Network } = storeToRefs(useNetworkStore());
const NETWORK_CONFIG = selectedNetwork.value.key === "sophon" ? MAINNET : TESTNET;
const { l1Tokens, baseToken, tokensRequestInProgress, tokensRequestError } = storeToRefs(tokensStore);
const { balance, balanceInProgress, balanceError } = storeToRefs(zkSyncEthereumBalance);

const toNetworkModalOpened = ref(false);
const toNetworkSelected = (networkKey?: string) => {
  if (destinations.value.ethereum.key === networkKey) {
    router.replace({ name: "bridge-withdraw", query: route.query });
  }
};
const fromNetworkModalOpened = ref(false);
const fromNetworkSelected = (networkKey?: string) => {
  if (destinations.value.era.key === networkKey) {
    router.replace({ name: "bridge-withdraw", query: route.query });
  }
};

const step = ref<"form" | "wallet-warning" | "confirm" | "submitted">("form");
const destination = computed(() => destinations.value.era);
const additionalTokens = ref<TokenAmount[]>([]);
const balanceWithAdditionalTokens = computed(() => {
  if (additionalTokens.value) {
    return [...(balance.value ?? []), ...additionalTokens.value];
  }
  return balance.value ?? [];
});

const handleAdditionalToken = (token: TokenAmount) => {
  additionalTokens.value = [...additionalTokens.value, token];
};

const availableTokens = computed<Token[]>(() => {
  if (balanceWithAdditionalTokens.value)
    return balanceWithAdditionalTokens.value.filter((e) => !FILTERED_TOKENS.value.includes(e.symbol));
  return Object.values(l1Tokens.value ?? []).filter((e) => !FILTERED_TOKENS.value.includes(e.symbol));
});
const availableBalances = computed<TokenAmount[]>(() => {
  return balanceWithAdditionalTokens.value?.filter((e) => !FILTERED_TOKENS.value.includes(e.symbol)) ?? [];
});
const routeTokenAddress = computed(() => {
  if (!route.query.token || Array.isArray(route.query.token) || !isAddress(route.query.token)) {
    return;
  }
  return checksumAddress(route.query.token);
});
const defaultToken = computed(
  () =>
    availableTokens.value.find((e) => e.address === baseToken.value?.l1Address) ?? availableTokens.value[0] ?? undefined
);
const selectedTokenAddress = ref<string | undefined>(routeTokenAddress.value ?? defaultToken.value?.address);
const selectedToken = computed<Token | undefined>(() => {
  if (!selectedTokenAddress.value) {
    return defaultToken.value;
  }
  return (
    availableTokens.value.find((e) => e.address === selectedTokenAddress.value) ||
    availableBalances.value.find((e) => e.address === selectedTokenAddress.value) ||
    defaultToken.value
  );
});
const tokenCustomBridge = computed(() => {
  if (!selectedToken.value) {
    return undefined;
  }
  const customBridgeToken = customBridgeTokens.find(
    (e) => eraNetwork.value.l1Network?.id === e.chainId && e.l1Address === selectedToken.value?.address
  );
  return customBridgeToken;
});
const amountInputTokenAddress = computed({
  get: () => selectedToken.value?.address,
  set: (address) => {
    selectedTokenAddress.value = address;
  },
});
const tokenBalance = computed<BigNumberish | undefined>(() => {
  return balanceWithAdditionalTokens.value?.find((e) => e.address === selectedToken.value?.address)?.amount;
});

const {
  result: allowance,
  inProgress: allowanceRequestInProgress,
  error: allowanceRequestError,
  requestAllowance,

  setAllowanceTransactionHash,
  setAllowanceReceipt,
  setAllowanceStatus,
  setAllowanceInProgress,
  setAllowanceError,
  setAllowance,
  resetSetAllowance,
} = useAllowance(
  computed(() => account.value.address),
  computed(() => selectedToken.value?.address),
  async () => await NETWORK_CONFIG.L1_GLOBAL_PAYMASTER.address
);
const enoughAllowance = computed(() => {
  if (!allowance.value || !selectedToken.value) {
    return true;
  }
  return !allowance.value.isZero() && allowance.value.gte(totalComputeAmount.value);
});
const setAmountToCurrentAllowance = () => {
  if (!allowance.value || !selectedToken.value) {
    return;
  }
  amount.value = parseTokenAmount(allowance.value, selectedToken.value.decimals);
};
const setTokenAllowance = async () => {
  try {
    await setAllowance(totalComputeAmount.value);
    // Wait for balances and blockchain state to update
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Reset all relevant states
    await Promise.all([
      fetchBalances(true),
      requestAllowance(), // Re-fetch allowance state
      resetFee(), // Reset fee state
    ]);
    await estimate();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error setting token allowance:", error);
    throw error;
  }
};

const unsubscribe = onboardStore.subscribeOnAccountChange(() => {
  step.value = "form";
});

const {
  fee: feeValues,
  result: fee,
  inProgress: feeInProgress,
  error: feeError,
  recommendedBalance,
  feeToken,
  enoughBalanceToCoverFee,
  estimateFee,
  resetFee,
} = useFee(availableTokens, balanceWithAdditionalTokens);

const queryAddress = useRouteQuery<string | undefined>("address", undefined, {
  transform: String,
  mode: "replace",
});
const address = ref((queryAddress.value !== "undefined" && queryAddress.value) || "");
const isAddressInputValid = computed(() => {
  if (address.value) {
    return isAddress(address.value);
  }
  return true; // Own address by default
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
  if (feeToken.value?.address === selectedToken.value.address && account.value.chainId === l1Network?.value?.id) {
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
const enoughBalanceForTransaction = computed(() => !amountError.value);

const transaction = computed<
  | {
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
    token: {
      ...selectedToken.value!,
      amount: totalComputeAmount.value.toString(),
    },
    from: {
      address: account.value.address!,
      destination: destinations.value.ethereum,
    },
    to: {
      address: toAddress,
      destination: destination.value,
    },
  };
});

const feeLoading = computed(() => feeInProgress.value || (!fee.value && balanceInProgress.value));
const estimate = async () => {
  if (!transaction.value?.from.address || !transaction.value?.to.address || !selectedToken.value) {
    return;
  }
  await estimateFee(transaction.value.to.address, selectedToken.value.address);
};
watch(
  [() => selectedToken.value?.address, () => transaction.value?.from.address],
  () => {
    resetFee();
    estimate();
  },
  { immediate: true }
);

// Add a watcher to re-estimate fees when allowance changes
watch(
  [allowance, setAllowanceStatus, () => selectedToken.value?.address],
  async ([newAllowance, newTokenAddress], [oldAllowance, oldTokenAddress]) => {
    if (setAllowanceStatus.value !== "done") return;
    if (newAllowance && oldAllowance && !newAllowance.eq(oldAllowance) && newTokenAddress === oldTokenAddress) {
      await resetFee();
      await estimate();
    }
  }
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

const isTokenBlacklisted = computed(() => {
  if (!selectedToken.value?.address) return false;
  return BLACKLISTED_TOKENS.value.some(
    (token) => token.address.toLowerCase() === selectedToken.value?.address.toLowerCase()
  );
});

const continueButtonDisabled = computed(() => {
  if (isTokenBlacklisted.value) return true;
  if (
    !transaction.value ||
    !enoughBalanceToCoverFee.value ||
    !(!amountError.value || amountError.value === "exceeds_max_amount") ||
    BigNumber.from(transaction.value.token.amount).isZero()
  )
    return true;
  if ((allowanceRequestInProgress.value && !allowance.value) || allowanceRequestError.value) return true;
  if (!enoughAllowance.value) return false; // When allowance approval is required we can proceed to approve stage even if deposit fee is not loaded
  if (!isAddressInputValid.value) return true;
  if (feeLoading.value || !fee.value) return true;
  return false;
});

const buttonContinue = () => {
  if (continueButtonDisabled.value) {
    return;
  }
  if (step.value === "form") {
    if (walletNotSupported.value) {
      step.value = "wallet-warning";
    } else {
      step.value = "confirm";
    }
  } else if (step.value === "wallet-warning") {
    step.value = "confirm";
  } else if (step.value === "confirm") {
    makeTransaction();
  }
};
const disableWalletWarning = () => {
  walletWarningDisabled.value = true;
  step.value = "confirm";
};

/* Transaction signing and submitting */
const transfersHistoryStore = useZkSyncTransfersHistoryStore();
const { previousTransactionAddress } = storeToRefs(usePreferencesStore());
const {
  status: transactionStatus,
  error: transactionError,
  commitTransaction,
} = useTransaction(eraWalletStore.getL1Signer);
const { recentlyBridged, ecosystemBannerVisible } = useEcosystemBanner();
const { saveTransaction, waitForCompletion } = useZkSyncTransactionStatusStore();

watch(step, (newStep) => {
  if (newStep === "form") {
    transactionError.value = undefined;
  }
});

const transactionInfo = ref<TransactionInfo | undefined>();
const makeTransaction = async () => {
  if (continueButtonDisabled.value) return;

  const tx = await commitTransaction(
    {
      to: transaction.value!.to.address,
      tokenAddress: transaction.value!.token.address,
      amount: transaction.value!.token.amount,
    },
    feeValues.value!
  );

  if (transactionStatus.value === "done") {
    step.value = "submitted";
    previousTransactionAddress.value = transaction.value!.to.address;
    recentlyBridged.value = true;
  }

  if (tx) {
    zkSyncEthereumBalance.deductBalance(feeToken.value!.address!, fee.value!);
    zkSyncEthereumBalance.deductBalance(transaction.value!.token.address!, transaction.value!.token.amount);
    transactionInfo.value = {
      type: "deposit",
      transactionHash: tx.hash,
      timestamp: new Date().toISOString(),
      token: transaction.value!.token,
      from: transaction.value!.from,
      to: transaction.value!.to,
      info: {
        expectedCompleteTimestamp: new Date(new Date().getTime() + ESTIMATED_DEPOSIT_DELAY).toISOString(),
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
        trackEvent("deposit", {
          token: transaction.value!.token.symbol,
          amount: transaction.value!.token.amount,
          to: transaction.value!.to.address,
        });
        setTimeout(() => {
          transfersHistoryStore.reloadRecentTransfers().catch(() => undefined);
          eraWalletStore.requestBalance({ force: true }).catch(() => undefined);
        }, 2000);
      })
      .catch((err) => {
        transactionError.value = err as Error;
        transactionStatus.value = "not-started";
      });
  }
};

const resetForm = () => {
  address.value = "";
  amount.value = "";
  step.value = "form";
  transactionStatus.value = "not-started";
  transactionInfo.value = undefined;
  resetSetAllowance();
  requestAllowance();
  silentRouterChange((route as unknown as { href: string }).href);
};

const fetchBalances = async (force = false) => {
  tokensStore.requestTokens();
  if (!isConnected.value) return;

  await zkSyncEthereumBalance.requestBalance({ force });
};
fetchBalances();

const unsubscribeFetchBalance = onboardStore.subscribeOnAccountChange((newAddress) => {
  if (!newAddress) return;
  fetchBalances();
});

onBeforeUnmount(() => {
  unsubscribe();
  unsubscribeFetchBalance();
});
</script>

<style lang="scss" scoped></style>
