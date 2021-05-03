<template>
  <div v-if="list" class="lom-row">
    <div class="title">
      <h3>{{ listName }}</h3>
    </div>

    <swiper v-bind="swiperOptions">
      <swiper-slide v-for="item in list" :key="item.id" v-slot="{ isVisible }">
        <Card :visible="isVisible" :info="item" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import Card from "./Card";

//import "swiper/swiper.scss";
//import "swiper/components/lazy/lazy.scss";

//SwiperCore.use([]);

export default {
  components: { Card, Swiper, SwiperSlide },
  name: "Lom",
  autoHeight: false,
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
              slidesPerView: 4,
              slidesPerGroup: 4,
            },
            1280: {
              slidesPerView: 5,
              slidesPerGroup: 5,
            },
          },
        };
      },
    },
    promise: {
      type: Promise,
      required: true,
    },
  },
  methods: {
    playMedia() {
      // TODO
    },
    loadNextPage() {
      // TODO change the request parameters and reuse the promise to request the next page
      //this.list = [...this.list, r.data.results];
    },
  },
  data() {
    return {
      list: null,
    };
  },
  created() {
    this.$props.promise.then((r) => {
      if (Array.isArray(r)) {
        var merged = [];

        // Merge r[x] into a single array
        r.forEach((o) => {
          console.log(`Merging ${o.data.results.length} results`);
          merged = [...merged, ...o.data.results];
        });

        merged = merged.sort((a, b) => b.vote_average - a.vote_average);

        this.list = merged;
      } else {
        this.list = r.data.results;
      }
    });
  },
};
</script>
