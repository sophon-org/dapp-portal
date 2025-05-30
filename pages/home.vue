<template>
  <div class="flex flex-col items-center justify-center gap-[50px] py-[55px]">
    <div class="flex w-full flex-col items-center justify-center lg:w-[821px]">
      <h1 class="mb-2 text-center text-5xl font-normal text-[#1C1C1C]">
        Welcome to Sophon Portal.<span class="text-[#6E6E73]"> Bridge and manage your assets.</span>
      </h1>
    </div>

    <div class="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        class="hover:shadow-[0_0_40px_rgba(0,0,0,0.25)]', relative w-[317px] rounded-[24px] bg-white px-5 pb-8 pt-5 shadow-[0_0_30px_rgba(0,0,0,0.20)] transition-all duration-300 ease-in-out hover:scale-[1.02]"
        href="/bridge"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <h3 class="text-4xl font-semibold">Bridge</h3>
          </div>
          <div class="flex items-center justify-center self-start rounded-lg bg-[#9FB2AE] p-2">
            <img src="/img/bridge-icon.svg" class="h-[40px] w-[40px]" />
          </div>
        </div>
        <div
          style="
            background: linear-gradient(
              90deg,
              rgba(28, 28, 28, 0) 0%,
              rgba(28, 28, 28, 0.2) 50%,
              rgba(28, 28, 28, 0) 100%
            );
          "
          class="mb-[11px] mt-[7px] h-[1px] w-full bg-[#E0E0E0]"
        />
        <div class="flex items-start justify-between">
          <p class="text-sm leading-[18px] text-[#6E6E73]">Bridge assets in and out of Sophon network.</p>
        </div>
      </NuxtLink>

      <NuxtLink
        class="hover:shadow-[0_0_40px_rgba(0,0,0,0.25)]', relative w-[317px] rounded-[24px] bg-white px-5 pb-8 pt-5 shadow-[0_0_30px_rgba(0,0,0,0.20)] transition-all duration-300 ease-in-out hover:scale-[1.02]"
        href="/assets"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <h3 class="text-4xl font-semibold">Assets</h3>
          </div>
          <div class="flex items-center justify-center self-start rounded-lg bg-[#9FB2AE] p-2">
            <img src="/img/assets-icon.svg" class="h-[40px] w-[40px]" />
          </div>
        </div>
        <div
          style="
            background: linear-gradient(
              90deg,
              rgba(28, 28, 28, 0) 0%,
              rgba(28, 28, 28, 0.2) 50%,
              rgba(28, 28, 28, 0) 100%
            );
          "
          class="mb-[11px] mt-[7px] h-[1px] w-full bg-[#E0E0E0]"
        />
        <div class="flex items-start justify-between">
          <p class="text-sm leading-[18px] text-[#6E6E73]">Send, receive, and manage your assets on Sophon network.</p>
        </div>
      </NuxtLink>

      <NuxtLink
        class="hover:shadow-[0_0_40px_rgba(0,0,0,0.25)]', relative w-[317px] rounded-[24px] bg-white px-5 pb-8 pt-5 shadow-[0_0_30px_rgba(0,0,0,0.20)] transition-all duration-300 ease-in-out hover:scale-[1.02]"
        target="_blank"
        href="https://app.sophon.xyz"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <h3 class="text-4xl font-semibold">Sophon Home</h3>
          </div>
          <img src="/img/sophon-logo.svg" class="h-[57px] w-[57px] self-start rounded-lg bg-black object-contain" />
        </div>
        <div
          style="
            background: linear-gradient(
              90deg,
              rgba(28, 28, 28, 0) 0%,
              rgba(28, 28, 28, 0.2) 50%,
              rgba(28, 28, 28, 0) 100%
            );
          "
          class="mb-[11px] mt-[7px] h-[1px] w-full bg-[#E0E0E0]"
        />
        <div class="flex items-start justify-between">
          <p class="max-w-[205px] text-sm leading-[18px] text-[#6E6E73]">
            Looking for our ecosystem of products? Go check Sophon Home and find your next onchain adventure.
          </p>
          <img src="/img/icon-arrow-right.svg" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

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
