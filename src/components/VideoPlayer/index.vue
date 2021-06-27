<template>
  <div class="videoplayer-wrapper">
    <video id="videoPlayer" ref="video" class="video-js vjs-default-style" />
    <img
      :src="getBackdrop(currentBackdrop)"
      ref="backdropElement"
      alt=""
      class="poster pan"
      v-if="loading"
    />
  </div>
</template>

<script>
import "./VideoPlayer.scss";
import videojs from "video.js";

export default {
  name: "VideoPlayer",
  props: {
    src: {
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  watch: {},
  data() {
    return {
      vjs_instance: null,
    };
  },
  mounted() {
    this.vjs_instance = videojs(
      this.$refs.video.getAttribute("id"),
      this.$props.options.videojs,
      () => {
        this.vjs_instance.cache_.source = {
          src: this.src,
        };
      }
    );
  },
};
</script>
