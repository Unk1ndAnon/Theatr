<template>
  <Billboard v-if="config.billboard" v-bind="config.billboard" />

  <div :class="`lom-rowcontainer ${config.billboard ? 'with-billboard' : ''}`">
    <Lom
      v-for="lom in loadedloms"
      :key="lom.listName"
      v-bind="lom"
      @card-popover="onCardPopover($event)"
    />
  </div>
</template>

<script>
import Billboard from "./Billboard";
import Lom from "./Lom";
import "./Lolomo.scss";
import { SEARCH, search } from "../../api/tmdb";
import { CancelToken, axios } from "../../api/axios";

export default {
  components: { Billboard, Lom },
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
    "isatbottom"(to, from) {
      if (to == true) {
        this.userScrolledToBottom();
      }
    },
  },
  data() {
    return {
      popover: [false],
      config: null,
      loadedloms: [],
      searchCancelToken: CancelToken.source(),
      isatbottom: false,
    };
  },
  methods: {
    onCardPopover(e) {
      this.popover = e;
    },
    onCardPopoverUnpop() {
      this.popover = [false];
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
        default:
          return require("../../views/Browse/default.js").default;
      }
    },
    load(from, to) {
      if (this.config) {
        this.loadedloms.push(...this.config.loms.slice(from, to));
      }
    },
    onScroll() {
      //console.log(window.innerHeight, window.pageYOffset, document.body.offsetHeight);
      if (window.innerHeight + window.pageYOffset >= (document.body.offsetHeight - 64)) {
        this.isatbottom = true;
      } else {
        this.isatbottom = false;
      }
    },
    userScrolledToBottom() {
      this.load(this.loadedloms.length, this.loadedloms.length + 3);
    }
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
  mounted() {
    // Load the first x Loms on load
    this.load(0, 5);

    window.addEventListener("scroll", this.onScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll);
  },
};
</script>
