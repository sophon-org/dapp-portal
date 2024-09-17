<template>
  <div class="alert-container" :class="[`variant-${variant}`, `size-${size}`, { 'has-icon': !!icon }]">
    <div v-if="icon" class="alert-icon-container">
      <component :is="icon" class="alert-icon" aria-hidden="true" />
    </div>
    <div class="alert-body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  variant: {
    type: String as PropType<"info" | "neutral" | "success" | "warning" | "error">,
  },
  size: {
    type: String as PropType<"md" | "sm">,
    default: "md",
  },
  icon: {
    type: [Object, Function] as PropType<Component>,
  },
});
</script>

<style lang="scss">
.alert-container {
  @apply w-full rounded-[1.24rem] p-4;
  &.has-icon {
    @apply grid grid-cols-[max-content_1fr] gap-block-padding-1/2;
  }
  &.variant- {
    &info {
      @apply border bg-blue text-blue;

      .alert-icon {
      }

      .alert-body {
        .alert-link {
          @apply hover:text-blue;
        }
      }
    }
    &neutral {
      @apply border backdrop-blur-sm;
      background-color: #fef8eb;
      border-color: #ffe9b6;
      color: #131313;

      .alert-body {
        .alert-link {
          @apply hover:text-gray;
        }
      }
    }
    &success {
      @apply border border-green-200 bg-green-200 text-green-700;

      .alert-icon {
      }

      .alert-body {
        .alert-link {
          @apply hover:text-green-600;
        }
      }
    }
    &warning {
      @apply border border-warning-400/30 bg-warning-400/10;

      &.size-md {
        .alert-icon-container {
          @apply h-12 w-12 bg-warning-400;

          .alert-icon {
            @apply text-black;
          }
        }

        @apply sm:p-block-padding;
      }

      &.size-sm {
        @apply p-block-padding-1/2;

        .alert-icon {
          @apply text-warning-400;
        }
      }

      .alert-body {
        .alert-link {
          @apply hover:text-orange-600;
        }
      }
    }
    &error {
      @apply border border-red-100 bg-red-100 text-red-700;

      .alert-icon {
      }

      .alert-body {
        .alert-link {
          @apply hover:text-red-600;
        }
      }
    }
  }

  .alert-icon-container {
    @apply flex items-center justify-center rounded-full;

    .alert-icon {
      @apply h-6 w-6;
    }
  }
  .alert-body {
    @apply flex-1 items-center xs:flex xs:justify-between;

    .alert-link {
      @apply mt-2 flex items-center whitespace-nowrap font-medium underline underline-offset-2 transition-colors xs:ml-6 xs:mt-0;
    }
  }
}
</style>
