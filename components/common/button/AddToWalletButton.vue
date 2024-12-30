<template>
  <div class="group relative">
    <button
      :disabled="isPending"
      :class="[
        'text-md my-auto h-7 w-fit cursor-pointer rounded-full px-2 text-center leading-none transition-colors disabled:cursor-not-allowed',
        variantClasses,
      ]"
      @click="onClick"
    >
      <svg
        viewBox="0 0 512 512"
        width="14px"
        height="14px"
        style="fill: currentColor; stroke: currentColor; stroke-width: 0"
      >
        <path
          d="M95.5 104h320a87.73 87.73 0 0 1 11.18.71 66 66 0 0 0-77.51-55.56L86 94.08h-.3a66 66 0 0 0-41.07 26.13A87.57 87.57 0 0 1 95.5 104zm320 24h-320a64.07 64.07 0 0 0-64 64v192a64.07 64.07 0 0 0 64 64h320a64.07 64.07 0 0 0 64-64V192a64.07 64.07 0 0 0-64-64zM368 320a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"
        ></path>
        <path
          d="M32 259.5V160c0-21.67 12-58 53.65-65.87C121 87.5 156 87.5 156 87.5s23 16 4 16-18.5 24.5 0 24.5 0 23.5 0 23.5L85.5 236z"
        ></path>
      </svg>
    </button>
    <div
      class="invisible absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1a1a1a] px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
    >
      Add token to wallet
      <div class="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#1a1a1a]"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";

import { useWalletClient } from "~/composables/useWalletClient";

const edgeCases: Record<string, string> = {
  stATH: "stAethir",
};

const props = defineProps<{
  asset: {
    address: `0x${string}`;
    decimals: number;
    symbol: string;
  };
  variant?: "secondary" | "solid" | "ghost" | "outline";
}>();

const isPending = ref(false);
const walletClient = useWalletClient();

const variantClasses = computed(() => {
  const baseStyles = {
    secondary: "border border-blue/20 bg-blue/15 text-blue",
    solid: "bg-blue text-white hover:bg-blue/90",
    ghost: "text-blue hover:bg-blue/10",
    outline: "border border-blue text-blue hover:bg-blue/10",
  };

  const disabledStyles = {
    secondary: "disabled:border-blue/10 disabled:bg-blue/5 disabled:text-blue/40",
    solid: "disabled:bg-blue/40 disabled:text-white/90",
    ghost: "disabled:text-blue/40 disabled:hover:bg-transparent",
    outline: "disabled:border-blue/40 disabled:text-blue/40 disabled:hover:bg-transparent",
  };

  const variant = props.variant || "secondary";
  return `${baseStyles[variant]} ${disabledStyles[variant]}`;
});

async function onClick(event: MouseEvent) {
  // this is to prevent button from closing the modal
  event.stopPropagation();
  event.preventDefault();
  if (!walletClient.value) return;

  isPending.value = true;
  try {
    await walletClient.value.watchAsset({
      type: "ERC20",
      options: {
        address: props.asset.address,
        decimals: props.asset.decimals,
        symbol: edgeCases[props.asset.symbol] || props.asset.symbol,
      },
    });
  } finally {
    isPending.value = false;
  }
}
</script>

<style scoped>
.group {
  width: fit-content;
  height: fit-content;

  button {
    margin-top: 7px;
  }
}
</style>
