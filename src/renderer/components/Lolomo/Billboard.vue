<template>
  <div class="billboard">
    <swiper v-bind="swiperOptions" v-if="list">
      <swiper-slide
        v-for="movie in list.splice(0, config.maxPanes || list.length)"
        :key="movie.id"
      >
        <Pane :info="movie" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import Pane from "./BillboardPane";

// Import Swiper styles
import "swiper/swiper.scss";

export default {
  components: {
    Pane,
    Swiper,
    SwiperSlide,
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
          class: "billboard-presentation-container", // useless, remove.
          loop: true,
          lazy: true,
          allowTouchMove: false,
          preloadImages: true,
          slidesPerView: 1,
        };
      },
    },
    promise: {
      type: Promise,
      required: true,
    },
  },
  methods: {
    test() {
      console.log("fired");
    },
  },
  data() {
    return {
      list: null,
    };
  },
  mounted() {
    this.$props.promise.then((r) => {
      this.list = r.data.results;
    });
  },
  name: "Billboard",
};
</script>
