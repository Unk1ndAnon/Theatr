<template>
  <div :class="'lom-row ' + (bbpresent ? 'with-billboard' : '')">
    <div class="title" v-if="listName" v-show="list.length > 0">
      <h3>{{ listName }}</h3>
    </div>

    <swiper
      navigation
      v-bind="swiperOptions"
      @reachEnd="loadNextPage"
      ref="slider"
      v-show="list.length > 0"
    >
      <swiper-slide v-for="item in list" :key="item.id">
        <Card
          :config="config"
          :info="item"
          @card-popover="this.$emit('card-popover', $event)"
        />
      </swiper-slide>
    </swiper>

    <div class="message" v-show="error">
      {{error}}
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import Card from "./Card";
import { stringToTMDB } from "../../api/tmdb";
import { TraktAPI } from "../../api/trakt";
import { axios } from "../../api/axios";

export default {
  components: { Card, Swiper, SwiperSlide },
  name: "Lom",
  data() {
    return {
      pagesLoaded: 0,
      totalPages: 0,
      list: [],
      error: null,
    };
  },
  props: {
    listName: {
      type: String,
      required: false,
    },
    config: {
      type: Object,
    },
    swiperOptions: {
      type: Object,
      required: true,
    },
    request: {
      required: true,
    },
    bbpresent: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    loadNextPage() {
      console.log("loading next page");
      if (typeof this.call == Object) {
        if (this.pagesLoaded < this.totalPages) {
          /**
           * Reuse the parameters sent previously
           *
           * Change the page param to pagesLoaded + 1
           */
          const itemHasParams = (o) => o.params;

          const oldParams = this.call.method.args.find(itemHasParams);
          const indexOfOld = this.call.method.args.findIndex(itemHasParams);
          var newParams = oldParams ? { ...oldParams } : { params: {} };

          newParams.params.page = this.pagesLoaded + 1;

          const oldArgs = this.call.method.args;

          var newArgs = oldArgs;
          newArgs[Math.abs(indexOfOld)] = newParams;

          this.loadFromPromise(
            stringToTMDB(this.call.method.name, newArgs).promise
          );
        }
      } else if (typeof this.call == Promise) {
        this.loadFromPromise(this.call);
      }
    },
    makeInitialRequest() {
      let requests = [];

      this.$props.request.forEach((req) => {
        switch (req.connector) {
          case "tmdb":
            requests.push(stringToTMDB(req.function, req.args));
            break;
          case "trakt":
            //requests.push(TraktAPI(req.function, req.args));
            break;
        }
      });

      this.loadFromPromise(axios.all(requests));
    },
    loadFromPromise(promises) {
      if (promises) {
        promises.then((result) => {
          result.forEach((response) => {
            if (response) this.addToList(response.data.results || response.data);
          });
        });
      }
    },
    loadFromResult(result) {
      this.addToList(result);
    },
    addToList(items) {
      this.list.push(...items);
    },
    sortList(cb) {
      this.list.sort(cb);
    },
  },
  watch: {
    "$props.request": {
      handler: function (to) {
        this.makeInitialRequest();
      },
    },
  },
  created() {
    this.makeInitialRequest();
  },
};
</script>
