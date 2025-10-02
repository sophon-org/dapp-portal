<template>
  <div class="app-layout">
    <AuthPrividiumAuthModal />
    <LoadersConnecting />
    <ModalConnectingWalletError />
    <ModalNetworkChangedWarning v-if="!isConnectingWallet" />
    <Header />
    <main
      :class="[
        'app-layout-main',
        'flex',
        'min-h-0',
        'w-full',
        'min-w-0',
        'flex-col',
        'justify-self-center',
        'p-2',
        'md:px-0',
        'md:py-4',
        { 'max-w-[700px]': !isHomePage },
      ]"
    >
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";

const route = useRoute();
const { isConnectingWallet } = storeToRefs(useOnboardStore());
const isHomePage = computed(() => route.name === "home");
</script>

<style lang="scss" scoped>
.app-layout {
  background: url("/the-correct-background.webp") no-repeat center bottom fixed;
  background-size: cover;
  display: grid;
  grid-template-rows: auto 1fr max-content;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
