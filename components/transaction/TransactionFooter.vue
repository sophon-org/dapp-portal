<template>
  <div class="transaction-footer sticky bottom-0 z-10 flex flex-col items-center pb-2 pt-4">
    <!-- Change network -->
    <transition v-bind="TransitionAlertScaleInOutTransition">
      <CommonErrorBlock
        v-if="buttonStep === 'network' && switchingNetworkError"
        class="mb-2"
        @try-again="eraWalletStore.setCorrectNetwork"
      >
        Network change error: {{ switchingNetworkError.message }}
      </CommonErrorBlock>
    </transition>

    <div v-if="buttonStep === 'connect'" class="transaction-footer-row flex w-full flex-col items-center">
      <CommonButton
        size="lg"
        variant="primary"
        :disabled="isConnectingWallet"
        class="w-full"
        @click="onboardStore.openModal"
      >
        Connect wallet
      </CommonButton>
    </div>
    <div v-if="buttonStep === 'network'" class="transaction-footer-row flex w-full flex-col items-center">
      <CommonButtonTopInfo>Incorrect network selected in your wallet</CommonButtonTopInfo>
      <CommonButton
        v-if="connectorName !== 'WalletConnect'"
        type="submit"
        :disabled="switchingNetworkInProgress"
        size="lg"
        variant="primary"
        class="w-full"
        @click="eraWalletStore.setCorrectNetwork"
      >
        Change wallet network to {{ eraNetwork.name }}
      </CommonButton>
      <CommonButton v-else disabled size="lg" variant="primary" class="w-full">
        Change network manually to {{ eraNetwork.name }} in your {{ walletName }} wallet
      </CommonButton>
    </div>
    <div v-else-if="buttonStep === 'continue'" class="transaction-footer-row flex w-full flex-col items-center">
      <slot name="after-checks" />
    </div>

    <TransactionButtonUnderlineContinueInWallet :opened="continueInWalletTipDisplayed" />
  </div>
</template>

<script lang="ts" setup>
const onboardStore = useOnboardStore();
const eraWalletStore = useZkSyncWalletStore();

const { account, isConnectingWallet, connectorName, walletName } = storeToRefs(onboardStore);
const { isCorrectNetworkSet, switchingNetworkInProgress, switchingNetworkError } = storeToRefs(eraWalletStore);
const { eraNetwork } = storeToRefs(useZkSyncProviderStore());

const buttonStep = computed(() => {
  if (!account.value.address || isConnectingWallet.value) {
    return "connect";
  } else if (!isCorrectNetworkSet.value) {
    return "network";
  } else {
    return "continue";
  }
});

const continueInWalletTipDisplayed = computed(() => {
  if (buttonStep.value === "network" && switchingNetworkInProgress.value) {
    return true;
  }
  return false;
});
</script>
