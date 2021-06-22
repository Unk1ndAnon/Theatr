<template>
  <div ref="elPopover" :class="`popover`" @mouseleave="onMouseLeave">
    <a ref="elTitlecard" class="title-card">
      <div class="boxart boxart-rounded boxart-size-16x9">
        <img
          class="boxart-image boxart-image-in-padded-container"
          v-if="backdrop"
          :src="backdrop"
          @click="onBoxartClick"
        />

        <div
          class="fallback-boxart"
          :style="{ 'background-image': fallbackBackdropStyle }"
        >
            <p class="fallback-text">{{ media_title }}</p>
        </div>
      </div>
    </a>
    <div v-if="details" ref="elMetacontainer" class="meta-container">
      <div class="meta-title">{{ media_title }}</div>
    </div>
  </div>
</template>

<script>
import "./CardPop.scss";

/**
        this.$emit("card-popover", [
          true,
          this.getAbsoluteDimensions(),
          this.$props,
          this.details,
          this.fanart,
          this.backdrop,
          this.seasons,
        ]);
 */

export default {
  name: "CardPop",
  props: {
    config: {
      required: true,
    },
  },
  emits: ["unpop"],
  data() {},
  computed: {
    dimensions() {
      return this.$props.config[1];
    },
    cardprops() {
      return this.$props.config[2];
    },
    details() {
      return this.$props.config[3];
    },
    fanart() {
      return this.$props.config[4];
    },
    backdrop() {
      return this.$props.config[5];
    },
    card_config() {
      return this.$props.config;
    },
    media_info() {
      return this.$props.info;
    },
    tmdb_id() {
      return this.details.id;
    },
    application_language() {
      return this.$store.state.ISO639;
    },
    media_title() {
      if (this.details)
        return this.details.title || this.details.name;
      return null;
    },
    media_type() {
      return this.details.title ? "tv" : "movie";
    },
    getOrientation() {
      if (!this.cardprops) return "16x9";
      return this.cardprops.cardOrientation || "16x9";
    },
    fallbackBackdropStyle() {
      const linearGradient = "linear-gradient(rgba(0,0,0,0),#000)";

      if (this.cardprops) {
        return (
          this.getOrientation == "16x9"
            ? this.cardprops.info.backdrop_path
            : this.cardprops.info.poster_path
        )
          ? `url(https://image.tmdb.org/t/p/w500${
              this.getOrientation == "16x9"
                ? this.cardprops.info.backdrop_path
                : this.cardprops.info.poster_path
            })`
          : linearGradient;
      } else {
        return linearGradient;
      }
    },
    getEncodedInfo() {
      // URL-encoded Base64 array of strings, with forward slashes (/)
      // replaced with periods (.)
      return encodeURIComponent(
        btoa([
          this.tmdb_id,
          this.details ? this.details.imdb_id : "",
          this.media_type,
          encodeURIComponent(this.$props.info.title || this.$props.info.name),
          this.$props.info.release_date,
          this.trakt_id,
          this.trakt_ids.slug,
          this.progress || null,
        ]).replace(/\//g, ".")
      );
    },
    getEncodedInfoForEpisode() {
      const episode = this.selectedEpisode || this.seasons[1].episodes[0];
      return encodeURIComponent(
        btoa([
          this.tmdb_id,
          null,
          this.media_type,
          encodeURIComponent(episode.name),
          episode.air_date,
          `s${episode.season_number}:e${episode.episode_number}`,
          this.trakt_id,
          this.trakt_ids.slug,
          this.progress || null,
        ]).replace(/\//g, ".")
      );
    },
    getWatchLink() {
      if (this.media_type == "tv") {
        return `/watch/${this.getEncodedInfoForEpisode}`;
      } else {
        return `/watch/${this.getEncodedInfo}`;
      }
    },
    areDetailsLoaded() {
      return this.details != null;
    },
  },
  methods: {
    getAbsoluteDimensions() {
      const ClientRect = this.$refs.elPopover.getBoundingClientRect();
      return {
        // The below values needed to be adjusted for absolution.
        top: ClientRect.top + window.scrollY,
        left: ClientRect.left + window.scrollX,
        bottom: ClientRect.bottom - window.scrollY,
        right: ClientRect.right - window.scrollX,
        // These below values are already absolute in ClientRect.
        width: ClientRect.width,
        height: ClientRect.height,
      };
    },
    adjustedPopDimensions() {
      const absdim = this.getAbsoluteDimensions();

      let origin = "center";

      let top = this.dimensions.top - absdim.height / 2;
      let left = this.dimensions.left - absdim.width / 2;
      if (left < 0) {
        // left pos is under 0
        left = this.dimensions.left;
        origin = "center left";
      } else if (left > window.innerWidth - this.dimensions.width * 2) {
        left = this.dimensions.right - this.dimensions.width * 2;
        origin = "center right";
      }
      let width = this.dimensions.width * 2;

      return {
        top: this.dimensions.top - absdim.height / 2,
        left: left,
        width: width,
        origin: origin,
      };
    },
    onMouseLeave() {
      this.$refs.elPopover.classList.remove("popped");
      this.$refs.elMetacontainer.classList.remove("fade");
      setTimeout(() => this.$emit("unpop"), 200);
    },
    onBoxartClick() {
      this.$router.push(this.getWatchLink);
    },
  },
  updated() {
    if (this.$refs && this.dimensions) {
      const popDims = this.adjustedPopDimensions();
      //this.$refs.elPopover.style.top = `${this.dimensions.top - (this.dimensions.height / 2)}px`;
      this.$refs.elPopover.style.top = `${popDims.top}px`;
      this.$refs.elPopover.style.left = `${popDims.left}px`;
      this.$refs.elPopover.style.width = `${popDims.width}px`;
      this.$refs.elPopover.style["transform-origin"] = popDims.origin;

      setTimeout(() => {
        this.$refs.elPopover.classList.add("popped");
        this.$refs.elMetacontainer.classList.add("fade");
      }, 1);
    }
  },
};
</script>
