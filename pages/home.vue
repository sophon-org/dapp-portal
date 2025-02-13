<template>
  <div class="flex flex-col items-center justify-center gap-[50px] py-[55px]">
    <div class="flex w-full flex-col items-center justify-center lg:w-[821px]">
      <h1 class="mb-2 text-center text-5xl font-normal text-[#1C1C1C]">
        Welcome to Sophon.<span class="text-[#6E6E73]"> Discover our ecosystem of applications and tools.</span>
      </h1>
    </div>

    <!-- Category Filter Buttons -->
    <div class="lg:overflow-x-unset scrollbar flex max-w-[90vw] gap-4 overflow-x-auto py-1 lg:max-w-none lg:py-0">
      <button
        v-for="category in categories"
        :key="category"
        :class="[
          'h-[40px] min-w-fit rounded-lg px-4 py-2 transition-colors duration-300 lg:min-w-[123px]',
          selectedCategory === category ? 'bg-[#0171E3] text-white' : 'bg-white text-[#6e6e73]',
        ]"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <TransitionGroup name="card-transition" tag="div" class="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="(card, index) in filteredCards"
        :key="index"
        :class="[
          'relative w-[317px] rounded-[24px] bg-white px-5 pb-8 pt-5 shadow-[0_0_30px_rgba(0,0,0,0.20)] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,0,0,0.25)]',
          { 'cursor-pointer': !card.isComingSoon, 'cursor-not-allowed': card.isComingSoon },
        ]"
        :to="card.isComingSoon ? null : card.link"
        :pointer-event="card.isComingSoon ? 'none' : 'auto'"
        :target="card.isInternal ? '_self' : '_blank'"
      >
        <div :class="['flex items-center', card.icon ? 'justify-between' : '']">
          <div class="flex flex-col gap-3">
            <h4 class="text-[10px] font-normal uppercase text-[#0171E3]">{{ card.category }}</h4>
            <h3 class="text-4xl font-semibold">{{ card.title }}</h3>
          </div>
          <img
            v-if="card.icon"
            :src="card.icon"
            :class="['h-[57px] w-[57px] self-start rounded-lg bg-black object-contain', card.iconStyling]"
          />
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
          <img v-if="!card.isComingSoon" src="/img/icon-arrow-right.svg" />
          <img v-else src="/img/icon-lock.svg" />
        </div>
        <div
          v-if="card.isComingSoon"
          class="absolute bottom-0 left-1/2 -translate-x-1/2 transform rounded-t-lg bg-[#0171E3] px-7 text-sm font-normal text-white"
        >
          Coming soon
        </div>
      </NuxtLink>
      <div
        v-if="selectedCategory === 'All'"
        key="more-to-come"
        class="height-full flex w-[317px] items-center justify-center rounded-[24px] bg-transparent"
      >
        <p class="text-center text-sm font-normal text-[#6E6E73]">and more to come!</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cards,
      categories: ["All", "Sophon Essentials", "DeFi", "Gaming", "Events", "Casino", "AI", "NFT", "Developers"],
      selectedCategory: "All",
    };
  },
  computed: {
    filteredCards() {
      if (this.selectedCategory === "All") {
        return this.cards;
      }
      return this.cards.filter((card) => card.category === this.selectedCategory);
    },
  },
};
</script>

<style scoped>
.card-transition-move,
.card-transition-enter-active,
.card-transition-leave-active {
  transition: all 0.3s ease;
}

.card-transition-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.card-transition-leave-to {
  opacity: 0;
  transform: translateY(500px);
}

.card-transition-leave-active {
  opacity: 0;
  position: absolute;
}

.scrollbar {
  /* For Internet Explorer and Edge */
  -ms-overflow-style: none; /* Disables scrollbar */

  /* For Firefox */
  scrollbar-width: none; /* Hides scrollbar but allows scrolling */
}

.scrollbar::-webkit-scrollbar {
  height: 1px;
  display: none;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
}

.scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.01);
  border-radius: 2px;
}
</style>
