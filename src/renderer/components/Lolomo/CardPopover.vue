<template>
  <div
    ref="popover"
    :class="`card-popover ${isPopped ? 'popped' : ''}`"
    :style="`top: ${getDimension.top}px; left: ${getDimension.left}px; width: ${getDimension.width}px; height: ${getDimension.height}px`"
    @mouseleave="onMouseLeave"
  >
    <a>
      <div :class="`boxart boxart-rounded boxart-size-16x9`">
        <img
          class="boxart-image boxart-image-in-padded-container"
          :src="
            backgroundImage ||
            'https://image.tmdb.org/t/p/w500/9CDC7ttWhF54dVO7HHitLa4tHnc.jpg'
          "
        />
      </div>
    </a>
  </div>
</template>

<script>
export default {
  name: "CardPopover",
  props: {
    options: {
      type: Array,
      required: true,
      default: () => {
        return [null, null, null, null, null, null];
      },
    },
  },
  data() {
    return {};
  },
  computed: {
    isPopped() {
      return this.options[0];
    },
    getDimension() {
      return (
        this.options[1] || {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
        }
      );
    },
    backgroundImage() {
      // TODO get fanart backdrop
      return this.options[2] || null;
    },
  },
  methods: {
    onMouseLeave() {
      this.$refs.popover.classList.remove("popped");
    }
  },
  updated() {},
};
</script>

<style lang="scss" scoped>
.card-popover {
  position: absolute;
  z-index: 99;

  background: none;

  opacity: 0;
  transform: scale(1);

  transition: opacity 0.2s, transform 0.5s;
}

.popped {
  opacity: 1;
  transform: scale(1.3);
}

.boxart {
  position: relative;
  width: 100%;
  height: 0;
  overflow: hidden;
}

.boxart-size-7x10 {
  padding: 70% 0; // 7x10 aspect ratio padding hack
}

.boxart-size-16x9 {
  padding: 28.125% 0; // 16x9 aspect ratio padding hack
}

.boxart-rounded {
  border-radius: 4px;
}

.boxart-image-in-padded-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}

img.boxart-image {
  object-fit: cover;
  border: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>
