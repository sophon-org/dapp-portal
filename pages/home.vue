<template>
  <div class="flex flex-col items-center justify-center gap-[55px] py-[55px]">
    <div class="flex w-full flex-col items-center justify-center lg:w-[821px]">
      <h1 class="mb-12 text-center text-5xl font-normal text-[#1C1C1C]">
        Welcome to Sophon.<span class="text-[#6E6E73]"> Discover our ecosystem of applications and tools.</span>
      </h1>
    </div>

    <div class="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="card in cards"
        :key="card.id"
        class="relative w-[317px] rounded-[24px] bg-white px-5 pb-8 pt-5 drop-shadow-[0_0_30px_rgba(0,0,0,0.20)]"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <h4 class="text-[10px] font-normal uppercase text-[#0171E3]">{{ card.category }}</h4>
            <h3 class="text-4xl font-semibold">{{ card.title }}</h3>
          </div>
          <img src="/img/placeholder.svg" />
        </div>
        <div
          :style="{
            background:
              'linear-gradient(90deg, rgba(28, 28, 28, 0.00) 0%, rgba(28, 28, 28, 0.20) 50%, rgba(28, 28, 28, 0.00) 100%)',
          }"
          class="mb-[11px] mt-[7px] h-[1px] w-full bg-[#E0E0E0]"
        />
        <div class="flex items-start justify-between">
          <p class="max-w-[205px] text-sm leading-[18px] text-[#6E6E73]">{{ card.description }}</p>
          <a v-if="!card.isComingSoon" :href="card.link" target="_blank">
            <img src="/img/icon-arrow-right.svg" />
          </a>
          <img v-else src="/img/icon-lock.svg" />
        </div>
        <div
          v-if="card.isComingSoon"
          class="absolute bottom-0 left-1/2 -translate-x-1/2 transform rounded-t-lg bg-[#0171E3] px-7 text-sm font-normal text-white"
        >
          Coming soon
        </div>
      </div>
      <div class="flex h-[173px] w-[317px] items-center justify-center rounded-[24px] bg-transparent">
        <p class="text-center text-sm font-normal text-[#6E6E73]">and more to come!</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cards: [
        {
          id: 1,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: false,
          link: "https://sophon.xyz",
        },
        {
          id: 2,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: false,
          link: "https://sophon.xyz",
        },
        {
          id: 3,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: false,
        },
        {
          id: 4,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: false,
          link: "https://sophon.xyz",
        },
        {
          id: 5,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: false,
          link: "https://sophon.xyz",
        },
        {
          id: 6,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: true,
        },
        {
          id: 7,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: true,
        },
        {
          id: 8,
          category: "Security",
          title: "Safe",
          description: "Secure your assets by using the most adopted multisignature solution.",
          isComingSoon: true,
        },
      ],
    };
  },
};
</script>
