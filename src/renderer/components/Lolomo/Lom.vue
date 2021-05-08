<template>
  <div v-if="list" class="lom-row">
    <div class="title" v-if="listName ">
      <h3>{{ listName }}</h3>
    </div>

    <swiper v-if="list" v-bind="swiperOptions">
      <swiper-slide v-for="item in list" :key="item.id" v-slot="{ isVisible }">
        <Card
          :orientation="cardOrientation"
          :visible="isVisible"
          :info="item"
        />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import Card from "./Card";

//import "swiper/swiper.scss";
//import "swiper/components/lazy/lazy.scss";

export default {
  components: { Card, Swiper, SwiperSlide },
  name: "Lom",
  props: {
    listName: {
      type: String,
      required: false,
    },
    cardOrientation: {
      type: String,
      default: "16x9",
    },
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
    swiperOptions: {
      type: Object,
      required: true,
    },
    promise: {
      type: Promise,
      required: true,
    },
  },
  methods: {
    loadFromPromise() {
      this.$props.promise.then((r) => {
        if (Array.isArray(r)) {
          var merged = [];

          // Merge r[x] into a single array
          r.forEach((o) => {
            console.log(`Merging ${o.data.results.length} results`);
            merged = [...merged, ...o.data.results];
          });

          // Sort by vote_average
          merged = merged.sort((a, b) => b.vote_average - a.vote_average);

          this.list = merged;
        } else {
          this.list = r.data.results;
        }
      });
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
    this.loadFromPromise();
  },
};
</script>
