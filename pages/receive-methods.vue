<template>
  <div>
    <PageTitle :fallback-route="{ name: 'assets' }">Receive</PageTitle>

    <div class="space-y-4">
      <CommonCardWithLineButtons>
        <DestinationItem
          label="View address"
          :description="`Receive from another ${destinations.era.label} account`"
          as="RouterLink"
          :to="{ name: 'receive' }"
        >
          <template #image>
            <QrCodeIcon class="p-0.5" />
          </template>
        </DestinationItem>
      </CommonCardWithLineButtons>
      <CommonCardWithLineButtons>
        <DestinationItem
          v-if="eraNetwork.l1Network"
          label="Official bridge"
          :description="`Receive from your ${destinations.ethereum.label} account`"
          :icon-url="destinations.ethereum.iconUrl"
          as="RouterLink"
          :to="{ name: 'bridge', query: $route.query }"
        />
      </CommonCardWithLineButtons>
      <CommonCardWithLineButtons v-if="isMainnet && eraNetwork.displaySettings?.showPartnerLinks">
        <DestinationItem
          label="Bridge from other networks"
          description="Explore ecosystem of third party bridges"
          as="a"
          href="https://layerswap.io/app"
          target="_blank"
          :icon="ArrowTopRightOnSquareIcon"
        >
          <template #image>
            <DestinationIconContainer>
              <ArrowsUpDownIcon aria-hidden="true" />
            </DestinationIconContainer>
          </template>
        </DestinationItem>
      </CommonCardWithLineButtons>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowsUpDownIcon, ArrowTopRightOnSquareIcon, QrCodeIcon } from "@heroicons/vue/24/outline";
import { mainnet } from "viem/chains";

const { destinations } = storeToRefs(useDestinationsStore());
const { eraNetwork } = storeToRefs(useZkSyncProviderStore());
const isMainnet = computed(() => eraNetwork.value.l1Network?.id === mainnet.id);
</script>

<style lang="scss" scoped></style>
