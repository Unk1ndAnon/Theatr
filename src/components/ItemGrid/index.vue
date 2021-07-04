<template>
  <grid-layout v-bind="config.grid" ref="grid">
    <slot />
  </grid-layout>
</template>

<script>

export default {
  name: "ItemGrid",
  components: {
      GridLayout: VueGridLayout.GridLayout
  },
  props: {
    config: {
      type: Object,
      required: false,
      default: () => {
          return {
              grid: {}
          }
      },
    },
  },
  mounted() {

  },
};
</script>
