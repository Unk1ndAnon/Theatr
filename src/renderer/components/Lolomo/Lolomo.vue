<template>
  <Billboard v-if="config.billboard" v-bind="config.billboard" />

  <Lom
    v-for="lom in config.loms"
    :key="lom.listName"
    v-bind="lom"
    :bbpresent="config.billboard ? true : false"
    @card-popover="onCardPopover($event)"
  />

  <CardPopover :options="popover" />
</template>

<script>
import Billboard from "./Billboard";
import Lom from "./Lom";
import CardPopover from "./CardPopover";
import "./Lolomo.scss";
import { SEARCH, search } from "../../api/tmdb";
import { CancelToken, axios } from "../../api/axios";

export default {
  components: { Billboard, Lom, CardPopover },
  name: "Lolomo",
  props: {
    section: {
      type: String,
    },
    searchTerm: {
      type: String,
      default: "",
    },
  },
  watch: {
    "$route.params"(to, from) {
      this.setConfig();
    },
  },
  data() {
    return {
      popover: [false],
      config: null,
      searchCancelToken: CancelToken.source(),
    };
  },
  methods: {
    onCardPopover(e) {
      console.log(e);
      this.popover = e;
    },
    setConfig() {
      this.config = this.getSectionExports(this.getSection);

      if (this.getSection == "search") {
        // Build the search request based on property values

        this.config.loms[0].request = [
          {
            connector: "tmdb",
            function: "search",
            args: [
              this.getSearch,
              SEARCH.Multi,
              {
                cancelToken: this.searchCancelToken.token,
              },
            ],
          },
        ];
      }
    },
    getSectionExports(section) {
      switch (section) {
        case "movies":
          return require("../../views/Browse/movies.js").default;
        case "tv":
          return require("../../views/Browse/tvshows.js").default;
        case "search":
          return require("../../views/Browse/search.js").default;
        default:
          return require("../../views/Browse/default.js").default;
      }
    },
  },
  computed: {
    getSection() {
      return this.$props.section;
    },
    getSearch() {
      return this.$route.params.searchTerm || "";
    },
  },
  created() {
    this.setConfig();
  },
  updated() {
    console.log("Lolomo");
  },
};
</script>
