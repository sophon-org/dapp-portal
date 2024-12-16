<template>
  <CommonButtonUnderlineText :opened="opened">Continue in your wallet</CommonButtonUnderlineText>
</template>

<script lang="ts" setup>
defineProps({
  opened: {
    type: Boolean,
    required: true,
  },
});
</script>
