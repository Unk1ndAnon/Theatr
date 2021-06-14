<template>
  <div class="browse">
    <Header />
    <div class="browse-container" v-if="searchresults.length > 0">
      <div class="search-wrapper">
        <row container v-for="row in range(1, (searchresults.length / breakpoints[breakpoint].columns))"
          :key="row"
          :gutter="breakpoints[breakpoint].gutter">
          <column v-for="col in range(1, breakpoints[breakpoint].columns)" :key="col">
            <Card v-if="getCard(row, col) && ['movie', 'tv'].indexOf(getCard(row, col).media_type) > -1"
              :info="getCard(row, col)"
              :config="{ popover: true, cardOrientation: '7x10' }" />
          </column>
        </row>
      </div>
    </div>
  </div>
</template>

<script>
import { Row, Column } from "vue-grid-responsive";
import Header from "../components/Header";
import Card from "../components/Lolomo/Card";

import { CancelToken } from "../api/axios";
import { search } from "../api/tmdb";

export default {
  name: "Home",
  components: { Header, Row, Column, Card },
  watch: {
    "$route.params"(to, from) {
      this.populate();
    },
  },
  computed: {
    cancellation: () => {
      return CancelToken.source();
    },
  },
  methods: {
    range(start, end) {
      if (start > end) return [start];
      if (start === end) return [start];
      return [start, ...this.range(start + 1, end)];
    },
    getCard(row, col) {
      const breakpoints = this.breakpoints;
      const breakpoint = this.breakpoint;
      return this.searchresults[((row * breakpoints[breakpoint].columns) - Math.abs(col - breakpoints[breakpoint].columns) - 1)];
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
    populate() {
      this.searchresults = [];

      search(this.term(), "multi", {
        cancelToken: this.cancellation.token,
      }).then((r) => {
        this.searchresults = r.data.results;
      }).catch((e) => {
        if (e.response) {
          if (e.response.status == 422)
            this.searchresults = [];
        }
        console.log(e);
      });
    },
  },
  data() {
    return {
      breakpoints: {
        320: {
          columns: 2,
          gutter: 8,
        },
        480: {
          columns: 3,
          gutter: 8,
        },
        640: {
          columns: 4,
          gutter: 8,
        },
        1280: {
          columns: 5,
          gutter: 8,
        },
        1440: {
          columns: 6,
          gutter: 8,
        },
        1920: {
          columns: 7,
          gutter: 8,
        },
      },
      breakpoint: false,
      orientation: "7x10",
      searchresults: [],
    };
  },
  created() {
    window.addEventListener("resize", () => this.calculateBreakpoint());
    this.calculateBreakpoint();
  },
  mounted() {
    this.populate();
  },
  beforeUnmount() {
    window.removeEventListener("resize", () => this.calculateBreakpoint());
    this.cancellation.cancel("Operation canceled by lifecycle hook.");
  },
};
</script>

<style lang="scss" scoped>
.browse-container {
  position: relative;
  margin-top: 70px;
  z-index: 0;

  .search-wrapper {
    margin: 1%;
  }
}
</style>
