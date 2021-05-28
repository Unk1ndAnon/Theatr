<template>
  <div
    :class="'lom-row ' + (bbpresent ? 'with-billboard' : '')"
    v-if="list.length > 0"
  >
    <div class="title" v-if="listName">
      <h3>{{ listName }}</h3>
    </div>

    <swiper
      navigation
      v-bind="swiperOptions"
      @reachEnd="loadNextPage"
      ref="slider"
    >
      <swiper-slide v-for="item in list" :key="item.id">
        <Card :config="config" :info="item" @card-popover="this.$emit('card-popover', $event)" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import Card from "./Card";
import { stringToTMDB } from "../../api/tmdb";
import { TraktAPI } from "../../api/trakt";

export default {
  components: { Card, Swiper, SwiperSlide },
  name: "Lom",
  data() {
    return {
      pagesLoaded: 0,
      totalPages: 0,
      list: [],
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
      this.$props.request.forEach((req) => {
        switch (req.connector) {
          case "tmdb":
            this.loadFromPromise(
              stringToTMDB(
                this.$props.request[0].function,
                this.$props.request[0].args
              )
            );
            break;

          case "trakt":
            this.loadFromPromise(
              TraktAPI(
                this.$props.request[0].function,
                this.$props.request[0].args
              )
            );
            break;
        }
      });
    },
    loadFromPromise(promise) {
      // TODO adapt
      if (promise) {
        promise.then((r) => {
          if (Array.isArray(r)) {
            // Multi-request
            // Array containing multiple promise results

            // TODO

            /* r.forEach((result) => {
              this.loadFromResult(() =>
                result.map((data) => {
                  return (data.results || data).map((results) => {
                    return results.filter((item) => {
                      var isDuplicate = false;

                      this.list.forEach((otherResult) => {
                        if (otherResult == result) return;
                        const otherData =
                          otherResult.data.results || otherResult.data;

                        otherData.forEach((otherItem) => {
                          console.log(item.id, otherItem.id);
                          isDuplicate = otherItem.id == item.id;
                        });
                        if (isDuplicate) console.log(item);
                      });
                      return !isDuplicate;
                    });
                  });
                })
              );
            }); */

            /* var lists = r;
            lists = lists.map((result) => {
              const results = result.data.results || result.data;

              // TODO this seems very resource intense. Find a better way to do it.
              return results.filter(cItem => {
                var isDuplicate = false;

                // Get all other objects in results
                lists.forEach((otherResult) => {
                  if (otherResult == result) return;
                  
                  const otherData = otherResult.data.results || otherResult.data;
                  otherData.forEach(oItem => {
                    isDuplicate = oItem.id === cItem.id;
                  })

                  if (isDuplicate) console.log("Removing", cItem);
                });

                return !isDuplicate;
              });
            }); */

            // TODO sort list
            this.list = this.list.sort(
              (a, b) => b.vote_average - a.vote_average
            );
          } else {
            // Single request promise result
            this.replaceList(r);
          }
        });
      }
    },
    loadFromResult(result) {
      this.addToList(result);
    },
    addToList(items) {
      this.list = [...this.list, ...(items.data.results || items.data)];
    },
    replaceList(items) {
      this.list = items.data.results || items.data;
    },
    sortList(cb) {
      this.list.sort(cb);
    },
  },
  created() {
    this.makeInitialRequest();
  },
  updated() {
    this.makeInitialRequest();
  },
};
</script>
