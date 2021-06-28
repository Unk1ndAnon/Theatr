<template>
  <div class="browse">
    <Header />
    <div class="browse-container" v-if="searchresults.length > 0">
      <div class="search-wrapper">
        <row
          class="row"
          container
          v-for="row in range(
            1,
            searchresults.length / breakpoints[breakpoint].columns
          )"
          :key="row"
          :gutter="breakpoints[breakpoint].gutter"
        >
          <column
            class="column"
            v-for="col in range(1, breakpoints[breakpoint].columns)"
            :key="col"
          >
            <Card
              v-if="
                getCard(row, col) &&
                ['movie', 'tv'].indexOf(getCard(row, col).media_type) > -1
              "
              :info="getCard(row, col)"
              :config="{ popover: true, cardOrientation: orientation }"
              @card-popover="onCardPopover($event)"
            />
          </column>
        </row>
      </div>

      <CardPop v-if="popconfig[0] == true" :config="popconfig" @unpop="onCardPopoverUnpop($event)" />
    </div>
  </div>
</template>

<script>
import { Row, Column } from "vue-grid-responsive";
import Header from "../components/Header";
import Card from "../components/Lolomo/Card";
import CardPop from "../components/CardPopover";

import { CancelToken } from "../api/axios";
import { search } from "../api/tmdb";

export default {
  name: "Home",
  components: { Header, Row, Column, Card, CardPop },
  watch: {
    "$route.params"() {
      this.requestActive = false;
      this.searchresults = [];

      this.populate();
    },
  },
  computed: {
    isposter: () => {
      return this.orientation == "7x10";
    },
    searchtoken: () => {
      return CancelToken.source();
    },
  },
  methods: {
    onCardPopover(e) {
      this.popconfig = e;
    },
    onCardPopoverUnpop(e) {
      this.popconfig = [false];
    },
    range(start, end) {
      if (start > end) return [start];
      if (start === end) return [start];
      return [start, ...this.range(start + 1, end)];
    },
    getCard(row, col) {
      const breakpoints = this.breakpoints;
      const breakpoint = this.breakpoint;
      return this.searchresults[
        row * breakpoints[breakpoint].columns -
          Math.abs(col - breakpoints[breakpoint].columns) -
          1
      ];
    },
    calculateBreakpoint() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let breakpoint = false;
      const points = Object.keys(this.breakpoints).map((point) => {
        if (typeof point === "string" && point.indexOf("@") === 0) {
          const minRatio = parseFloat(point.substr(1));
          const value = height * minRatio;
          return { value, point };
        }
        return { value: point, point };
      });
      points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
      for (let i = 0; i < points.length; i += 1) {
        const { point, value } = points[i];
        if (value <= width) {
          breakpoint = point;
        }
      }
      this.breakpoint = breakpoint || "max";
    },
    term() {
      return this.$route.params.searchTerm;
    },
    searchRequest(page = 1) {
      return search(this.term(), "multi", {
        cancelToken: this.searchtoken.token,
        params: { page: page, sort_by: "popularity.desc" },
      });
    },
    populate(page = 1) {
      if (!this.requestActive && page < 3) {
        this.requestActive = true;

        this.searchRequest(page)
          .then((r) => {
            this.requestActive = false;
            let results = r.data.results;

            results.filter(
              (result) => result.backdrop_path || result.poster_path
            );

            if (page > 1) {
              this.searchresults = [...this.searchresults, ...results];
              this.currentPage = this.currentPage + 1;
            } else {
              this.searchresults = results;
            }

            this.populate(page + 1);
          })
          .catch((e) => {
            if (e.response) {
              if (e.response.status == 422) this.searchresults = [];
            }
            console.log(e);
            this.requestActive = false;
          });
      }
    },
  },
  data() {
    return {
      breakpoints: {
        320: {
          columns: this.isposter ? 4 : 3,
          gutter: 8,
        },
        480: {
          columns: this.isposter ? 5 : 4,
          gutter: 8,
        },
        640: {
          columns: this.isposter ? 6 : 5,
          gutter: 8,
        },
        1280: {
          columns: this.isposter ? 7 : 6,
          gutter: 8,
        },
        1440: {
          columns: this.isposter ? 8 : 7,
          gutter: 8,
        },
        1920: {
          columns: this.isposter ? 9 : 8,
          gutter: 8,
        },
      },
      popconfig: [false],
      breakpoint: false,
      orientation: "16x9",
      searchresults: [],
      currentPage: 1,
      requestActive: false,
    };
  },
  created() {
    window.addEventListener("resize", () => this.calculateBreakpoint());
    this.calculateBreakpoint();
    this.populate();
  },
  beforeUnmount() {
    window.removeEventListener("resize", () => this.calculateBreakpoint());
  },
};
</script>

<style lang="scss" scoped>
.browse-container {
  position: relative;
  margin-top: 70px;
  z-index: 0;
  width: 100%;

  .search-wrapper {
    margin: 1%;

    .row {
      margin-bottom: 2em;
    }
  }
}
</style>
