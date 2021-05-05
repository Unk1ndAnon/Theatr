<template>
  <Billboard v-bind="billboard" />
  <div class="lom-container">
    <Lom
      v-for="lom in loms"
      :key="lom.name"
      v-bind="lom"
    />
  </div>
</template>

<script>
import Billboard from "./Billboard";
import Lom from "./Lom";

import {
  MEDIA,
  WINDOW,
  trending,
  discover,
  multi,
  movies_now_playing,
} from "../../api/tmdb";

import "./Lolomo.scss";

export default {
  components: { Billboard, Lom },
  name: "Lolomo",
  methods: {},
  computed: {},
  data() {
    const swiperDefaults = {
      loop: false,
      lazy: true,
      spaceBetween: 4,
      slidesOffsetBefore: 16,
      slidesOffsetAfter: 16,
      watchSlidesVisibility: true,
      autoHeight: true,
      breakpoints: {
        320: {
          slidesPerView: 2,
          slidesPerGroup: 2,
        },
        480: {
          slidesPerView: 3,
          slidesPerGroup: 3,
        },
        640: {
          slidesPerView: 4,
          slidesPerGroup: 4,
        },
        1280: {
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
      },
    };

    return {
      // Configuration
      billboard: {
        promise: trending(WINDOW.Week),
      },

      loms: [
        {
          listName: "New Releases",
          promise: discover(MEDIA.Movie, {}),
          swiperOptions: swiperDefaults,
        },
        {
          listName: "Shows to Consider",
          promise: discover(MEDIA.Show),
          swiperOptions: swiperDefaults,
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
          swiperOptions: swiperDefaults,
        },
        {
          listName: "Continue Watching",
          cardOrientation: "7x10",
          promise: movies_now_playing({
            transformResponse: (r) => {
              var results = r.results;
              results = results.splice(0, 2);
              var response = r;
              response.results = results;
              return response;
            },
          }),
          swiperOptions: {
            loop: false,
            lazy: true,
            spaceBetween: 4,
            slidesOffsetBefore: 16,
            slidesOffsetAfter: 16,
            watchSlidesVisibility: true,
            breakpoints: {
              320: {
                slidesPerView: 2,
                slidesPerGroup: 2,
              },
              480: {
                slidesPerView: 3,
                slidesPerGroup: 3,
              },
              640: {
                slidesPerView: 5,
                slidesPerGroup: 5,
              },
              1280: {
                slidesPerView: 6,
                slidesPerGroup: 6,
              },
            },
          },
        },
      ],
    };
  },
};
</script>
