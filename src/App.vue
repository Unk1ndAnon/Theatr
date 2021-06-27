<template>
  <router-view @media-play="playMedia" />
</template>

<script>
import store from "./store";
import Trakt, { TraktAPI } from "./api/trakt";
import SwiperCore, { Autoplay, Navigation } from "swiper";
SwiperCore.use([Autoplay, Navigation]);

// Import Swiper styles
import "swiper/swiper.scss";
import "swiper/components/lazy/lazy.scss";

export default {
  name: "App",
  methods: {
    playMedia(...arg) {
      console.log(arg);
    },
  },
  created() {
    const traktAuth = store.state.trakt.authCode;
    if (traktAuth) {
      Trakt.import_token(traktAuth).then((r) => {
        store.commit("TraktAuth", Trakt.export_token());
      });
    }
  },
};
</script>

<style lang="scss">
html {
  height: 100%;
}

body {
  font-family: Roboto, Arial, Helvetica, sans-serif;
  font-size: 1vw;
  margin: 0;
  padding: 0;
  user-select: none;
  background: #141414;
  color: white;
  height: inherit;
}
</style>
