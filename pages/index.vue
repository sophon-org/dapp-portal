<template>
  <div></div>
</template>

<script lang="ts" setup>
const router = useRouter();

const newUrl = new URL(window.location.href);
newUrl.pathname = "/home";
await router.replace(newUrl.href.slice(newUrl.origin.length));
</script>
