<template>
  <div>
    <div ref="lolomoContainer" class="lolomo-container">
      <Billboard v-if="config.billboard" v-bind="config.billboard" />

      <div
        ref="rowcontainer"
        :class="`lom-rowcontainer ${config.billboard ? 'with-billboard' : ''}`"
      >
        <Lom
          v-for="lom in loadedloms"
          :key="lom.listName"
          v-bind="lom"
          @card-popover="onCardPopover($event)"
        />
      </div>
    </div>
    <CardPop
      v-if="popconfig[0]"
      :config="popconfig"
      @unpop="onCardPopoverUnpop($event)"
      @modal-expand="handleModal($event)"
    />
  </div>
</template>

<script>
import Billboard from "./Billboard";
import Lom from "./Lom";
import CardPop from "../CardPopover";
import "./Lolomo.scss";
import { CancelToken, axios } from "../../api/axios";

export default {
  components: { Billboard, Lom, CardPop },
  name: "Lolomo",
  props: {
    section: {
      type: String,
    },
  },
  watch: {
    isatbottom(to, from) {
      if (to == true) {
        this.userScrolledToBottom();
      }
    },
  },
  data() {
    return {
      popconfig: [false],
      config: null,
      loadedloms: [],
      isatbottom: false,
    };
  },
  methods: {
    onCardPopover(e) {
      this.popconfig = e;
    },
    onCardPopoverUnpop(e) {
      this.popconfig = [false];
      this.$refs.lolomoContainer.style.position = "relative";
    },
    handleModal(expanded) {
      console.log(expanded);
      if (expanded) {
        this.$refs.lolomoContainer.style.position = "fixed";
      } else {
        this.$refs.lolomoContainer.style.position = "relative";
      }
    },
    setConfig() {
      this.config = this.getSectionExports(this.getSection);
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
      if (
        window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight - 64
      ) {
        this.isatbottom = true;
      } else {
        this.isatbottom = false;
      }
    },
    userScrolledToBottom() {
      this.load(this.loadedloms.length, this.loadedloms.length + 3);
    },
  },
  computed: {
    getSection() {
      return this.$props.section;
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
