<template>
  <div class="badge">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.badge {
  @apply rounded-lg bg-black px-2 text-white;
}
</style>
