<template>
  <div v-if="list" class="lom-row">
    <div class="title"><h3>{{ listName }}</h3></div>

    <swiper v-bind="swiperOptions">
      <swiper-slide v-for="movie in list" :key="movie.id">
        <div class="lom-slide">
          <Card @media-play="playMedia" :info="movie" />
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import Card from "./Card";

// Import Swiper styles
import "swiper/swiper.scss";

export default {
  components: { Card, Swiper, SwiperSlide },
  name: "Lom",
  props: {
    listName: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
    swiperOptions: {
      type: Object,
      default: () => {
        return {
          class: "lom-slider",
          loop: false,
          spaceBetween: 4,
          slidesOffsetBefore: 24,
          breakpoints: {
            320: {
              slidesPerView: 2,
            },
            480: {
              slidesPerView: 3,
            },
            640: {
              slidesPerView: 4,
            },
            1280: {
              slidesPerView: 5,
            }
          }
        }
      }
    },
    promise: {
      type: Promise,
      required: true,
    },
  },
  methods: {
    playMedia(e) {
      this.$emit("media-play", e);
    },
  },
  data() {
    return {
      list: null,
    };
  },
  created() {
    this.$props.promise.then((r) => {
      this.list = r.data.results;
    });
  },
};
</script>
