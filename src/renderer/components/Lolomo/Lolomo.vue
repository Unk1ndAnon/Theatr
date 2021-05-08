<template>
  <Billboard v-if="config.billboard" v-bind="config.billboard" />

  <div class="lom-container" v-if="config.loms">
    <Lom v-for="lom in config.loms" :key="lom.name" v-bind="lom" />
  </div>

</template>

<script>
import Billboard from "./Billboard";
import Lom from "./Lom";
import "./Lolomo.scss";
import { search } from "../../api/tmdb";

export default {
  components: { Billboard, Lom, },
  name: "Lolomo",
  props: {
    section: {
      type: String,
      required: false,
    },
  },
  methods: {
    setOptions() {
      this.config = this.getSectionExports(this.$props.section);
      if (this.$props.section == "search") {
        this.config.loms[0].promise = search(this.$route.params.searchQuery);
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
  computed: {},
  data() {
    return {
      config: null,
    };
  },
  created() {
    this.setOptions();
  },
  updated() {
    this.setOptions();
  },
};
</script>
