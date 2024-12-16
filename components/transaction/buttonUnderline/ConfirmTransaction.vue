<template>
  <CommonButtonUnderlineText :opened="opened"> Confirm this transaction in your wallet </CommonButtonUnderlineText>
</template>

<script lang="ts" setup>
defineProps({
  opened: {
    type: Boolean,
    required: true,
  },
});
</script>
