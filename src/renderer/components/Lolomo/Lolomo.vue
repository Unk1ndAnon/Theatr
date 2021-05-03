<template>
  <Billboard v-bind="billboard" />
  <div class="lom-container">
    <Lom
      v-for="lom in loms"
      :key="lom.name"
      v-bind="lom"
      @media-play="playMedia"
    />
  </div>
</template>

<script>
import Billboard from "./Billboard";
import Lom from "./Lom";

import { MEDIA, WINDOW, trending, discover, multi } from "../../api/tmdb";

import "./Lolomo.scss";

export default {
  components: { Billboard, Lom },
  name: "Lolomo",
  methods: {
    playMedia(e) {
      this.$emit("media-play", e);
    },
  },
  data() {
    return {
      // Configuration
      billboard: {
        promise: trending(WINDOW.Week),
      },

      loms: [
        {
          listName: "New Releases",
          promise: discover(MEDIA.Movie, {}),
        },
        {
          listName: "Shows to Consider",
          promise: discover(MEDIA.Show),
        },
        /*{
          listName: "Netflix Originals",
          promise: multi(
            discover(MEDIA.Movie, { with_networks: 213, sort_by: "popularity.asc" }),
            discover(MEDIA.Show, { with_networks: 213, sort_by: "popularity.asc" }),
          ),
        },*/
        {
          listName: "Top-Rated Anime",
          promise: multi(
            discover(MEDIA.Show, {
              with_genre: 16,
              with_origin_country: "JP",
              "air_date.gte": "2020-04-28",
              "air_date.lte": "2021-04-28",
              "vote_count.gte": 100,
            })
          ),
        },
      ],
    };
  },
};
</script>
