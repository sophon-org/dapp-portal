<template>
  <div class="app-layout">
    <LoadersConnecting />
    <ModalConnectingWalletError />
    <ModalNetworkChangedWarning v-if="!isConnectingWallet" />
    <ModalLegalNotice />

    <Header />
    <main
      class="app-layout-main flex min-h-0 w-full min-w-0 max-w-[700px] flex-col justify-self-center p-2 md:px-0 md:py-4"
    >
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
const { isConnectingWallet } = storeToRefs(useOnboardStore());
</script>

<style lang="scss" scoped>
.app-layout {
  background: url("/public/the-correct-background.webp") no-repeat center center fixed;
  display: grid;
  grid-template-rows: auto 1fr max-content;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
