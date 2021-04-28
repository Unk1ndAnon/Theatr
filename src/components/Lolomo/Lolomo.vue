<template>
  <Billboard v-bind="billboard" />
  <div class="lom-container">
    <Lom v-for="lom in loms" :key="lom.name" v-bind="lom" @media-play="playMedia" />
  </div>
</template>

<script>
import Billboard from "./Billboard";
import Lom from "./Lom";

import { MEDIA, WINDOW, trending, discover } from "../../api/tmdb";

import "./Lolomo.scss";

export default {
  components: { Billboard, Lom },
  name: "Lolomo",
  methods: {
    playMedia(e) {
      this.$emit('media-play', e);
    }
  },
  data() {
    return {
      // Configuration
      billboard: {
        promise: trending(WINDOW.Week),
      },

      loms: [
        {
          listName: "Discover Movies",
          promise: discover(MEDIA.Movie),
        },
        {
          listName: "Discover Shows",
          promise: discover(MEDIA.Show),
        }
      ],
    };
  },
};
</script>
