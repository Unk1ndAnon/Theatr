<template>
  <div class="playerRoot">
    <video ref="videoHtml" id="videoElement" :src="source" />
  </div>
</template>

<script>
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: "VideoPlayer",
  props: {
    source: null,
  },
  methods: {
    sourceChanged() {
        console.log(typeof(source));
    },
  },
  data() {
    return {
      videojsPlayer: null,
    };
  },
  created() {},
  watch: {
    source: "sourceChanged",
  },
};
</script>
