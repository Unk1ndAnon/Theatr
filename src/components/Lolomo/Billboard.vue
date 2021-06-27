<template>
  <div class="billboard">
    <div class="billboard-row">
      <swiper v-bind="swiperOptions" v-if="list">
        <swiper-slide
          v-for="movie in list.splice(0, config.maxPanes || list.length)"
          :key="movie.id"
        >
          <Pane :info="movie" />
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import Pane from "./BillboardPane";

import { stringToTMDB } from "../../api/tmdb";
import { TraktAPI } from "../../api/trakt";

export default {
  name: "Billboard",
  components: {
    Pane,
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      list: [],
    };
  },
  props: {
    config: {
      type: Object,
      default: () => {
        return {
          maxPanes: 5,
        };
      },
    },
    swiperOptions: {
      type: Object,
      default: () => {
        return {
          loop: true,
          lazy: true,
          allowTouchMove: false,
          preloadImages: true,
          autoplay: {
            delay: 5000, // TODO make 30s
            pauseOnMouseEnter: true,
          },
        };
      },
    },
    request: {
      type: Promise,
      required: true,
    },
  },
  methods: {
    test() {
      console.log("fired");
    },
  },
  created() {
    this.$props.request.forEach((req) => {
      const connector = req.connector;
      var promise = null;

      switch (connector) {
        case "tmdb":
          promise = stringToTMDB(req.function, req.args);
          break;
        // TODO Trakt support
      }

      promise.then((r) => {
        // TODO Trakt support
        this.list = [...this.list, ...r.data.results];
      });
    });
  },
};
</script>
