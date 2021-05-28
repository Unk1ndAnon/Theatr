<template>
  <router-view @media-play="playMedia" />
</template>

<script>
import store from "./store";
import Trakt from "./api/trakt";
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

        setTimeout(() => {
          console.log(
            Trakt.sync.watched({
              type: "movies",
            })
          );

          // TODO remove this block
          console.log(Trakt.sync.history.get());
          console.log(Trakt.sync.last_activities());
          console.log(Trakt.sync.playback.get());

          Trakt.scrobble.pause({
            movie: {
              ids: {
                slug: "pulp-fiction-1994",
              },
            },
            progress: 1,
          });
        }, 5000);
      });
    }
  },
};
</script>

<style lang="scss">
body {
  font-family: Avenir, Arial, Helvetica, sans-serif;
  font-size: 1vw;
  margin: 0;
  padding: 0;
  user-select: none;
  background: #141414;
  color: white;
}
</style>
