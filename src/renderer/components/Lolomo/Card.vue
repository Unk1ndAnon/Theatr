<template>
  <a
    class="title-card"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      ref="card"
      :class="`boxart boxart-rounded boxart-size-${getOrientation}`"
    >
      <img
        v-if="backdropPath && !isLoading"
        class="boxart-image boxart-image-in-padded-container"
        :src="backdropPath"
      />

      <div
        class="fallback-text-container"
        :class="isLoading ? 'pulse' : ''"
        :style="{ 'background-image': fallbackBackdropStyle }"
      >
        <p class="fallback-text" v-if="!isLoading">{{ getMediaTitle }}</p>
      </div>
    </div>

    <div
      :class="`progress-container ${
        progress != null ? 'opaque' : 'translucent'
      }`"
    >
      <span class="progress-bar">
        <progress :value="progress" max="100" />
      </span>
    </div>
  </a>
</template>

<script>
import { CancelToken, axios } from "../../api/axios";
import { getFanArt } from "../../api/fanart";
import { MEDIA, getDetails, getEpisodes } from "../../api/tmdb";

export default {
  name: "Card",
  props: {
    info: {
      type: Object,
      required: true,
    },
    config: {
      default: {},
    },
  },
  data() {
    return {
      sourcedFromTrakt: null,
      backdrop: null,
      details: null,
      progress: null,
      seasons: {},
      selectedEpisode: null,
      fanart: null,
      isLoading: true,
      isMouseOver: false,
      isHovering: false,
      cancelTokens: {
        episodes: CancelToken.source(),
        details: CancelToken.source(),
        fanart: CancelToken.source(),
      },
    };
  },
  emits: ["card-popover"],
  watch: {
    details: ["loadFanArt", "loadSeasonEpisodes"],
    isHovering: ["onHover"],
  },
  computed: {
    id() {
      console.log(this.$props);
      return this.sourcedFromTrakt
        ? this.$props.info.movie.ids.tmdb || this.$props.info.show.ids.tmdb
        : this.$props.info.id;
    },
    traktId() {
      return this.sourcedFromTrakt ? this.$props.info.id : null;
    },
    language() {
      return this.$store.state.ISO639;
    },
    getMediaTitle() {
      if (this.sourcedFromTrakt)
        return this.$props.info.movie.title || this.$props.info.show.title;
      return this.$props.info.title || this.$props.info.name;
    },
    getMediaType() {
      if (this.sourcedFromTrakt) {
        if (this.$props.info.type == "episode") return MEDIA.Show;
        return this.$props.info.type;
      }
      return this.$props.info.title ? MEDIA.Movie : MEDIA.Show;
    },
    getOrientation() {
      return this.$props.config.cardOrientation || "16x9";
    },
    fallbackBackdropStyle() {
      const linearGradient = "linear-gradient(rgba(0,0,0,0),#000)";

      return this.isLoading
        ? "none"
        : (
            this.getOrientation == "16x9"
              ? this.$props.info.backdrop_path
              : this.$props.info.poster_path
          )
        ? `url(https://image.tmdb.org/t/p/w500${
            this.getOrientation == "16x9"
              ? this.$props.info.backdrop_path
              : this.$props.info.poster_path
          })`
        : linearGradient;
    },
    backdropPath: {
      get() {
        return this.backdrop;
      },
      set(path) {
        // If path begins with "/" (from tmdb api response), then prepend TMDB images repo URL.
        this.backdrop = path.startsWith("/")
          ? `https://image.tmdb.org/t/p/w500${path}`
          : path;
      },
    },
    getEncodedInfo() {
      // URL-encoded Base64 array of strings, with forward slashes (/)
      // replaced with periods (.)
      return encodeURIComponent(
        btoa([
          this.id,
          this.details ? this.details.imdb_id : "",
          this.getMediaType,
          encodeURIComponent(this.$props.info.title || this.$props.info.name),
          this.$props.info.release_date,
        ]).replace(/\//g, ".")
      );
    },
    getEncodedInfoForEpisode() {
      const episode = this.selectedEpisode || this.seasons[1].episodes[0];
      return encodeURIComponent(
        btoa([
          this.id,
          null,
          this.getMediaType,
          encodeURIComponent(episode.name),
          episode.air_date,
          `s${episode.season_number}:e${episode.episode_number}`,
        ]).replace(/\//g, ".")
      );
    },
    getWatchLink() {
      if (this.getMediaType == MEDIA.Show) {
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
      const ClientRect = this.$refs.card.getBoundingClientRect();
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
    debug() {
      console.log(this.getMediaTitle, this.details);
      console.log("Backdrop", this.backdrop);
      console.log("Media Type", this.getMediaType);
      console.log("Episodes", this.seasons);
      console.log("Fanart", this.fanart);
    },
    onClick() {
      this.debug();
      this.$router.push(this.getWatchLink);
    },
    onMouseEnter() {
      this.isMouseOver = true;

      setTimeout(() => {
        if (this.isMouseOver) this.isHovering = true;
      }, 600);
    },
    onHover() {
      if (
        this.isHovering && this.config.popover != null
          ? this.config.popover
          : true
      ) {
        this.$emit("card-popover", [
          true,
          this.getAbsoluteDimensions(),
          this.$props,
          this.details,
          this.fanart,
          this.backdrop,
        ]);
      }
    },
    onMouseLeave() {
      this.isMouseOver = false;
      this.isHovering = false;
    },
    fetchDetails() {
      if (this.$props.info.progress) this.progress = this.$props.info.progress;

      getDetails(
        this.sourcedFromTrakt
          ? this.$props.info.movie.ids.tmdb
          : this.$props.info.id,
        this.getMediaType,
        {
          params: { append_to_response: "images,videos" },
          cancelToken: this.cancelTokens.details.token,
        }
      )
        .then((r) => {
          this.details = r.data;

          if (this.getMediaType == MEDIA.Show) {
            r.data.seasons.forEach((s) => {
              this.loadSeasonEpisodes(s.season_number);
            });
          }

          // Sort backdrops by vote_count (vote_average as returned by API)
          const backdrops = (
            this.getOrientation == "16x9"
              ? r.data.images.backdrops
              : r.data.images.posters
          ).sort((a, b) => b.vote_count - a.vote_count);

          if (backdrops) {
            // Find backdrops in user language
            const backdropsInLang = backdrops.filter((i) => {
              return i.iso_639_1 == this.$store.state.ISO639;
            });

            if (backdropsInLang.length > 0) {
              this.backdropPath = backdropsInLang[0].file_path;
            }
          }

          this.stopLoading();
        })
        .catch((e) => {
          if (axios.isCancel(e)) {
            console.log("Cancelled");
          } else {
            console.log(this.$props.info.id, this.getMediaType, this.$props);
            console.error("Error", e);
          }
        });
    },
    loadSeasonEpisodes(season_number) {
      // Get basic episode details
      getEpisodes(this.$props.info.id, season_number, null, {
        cancelToken: this.cancelTokens.episodes.token,
      }).then((r) => {
        // Add to this.seasons array under season number as key
        this.seasons[season_number] = r.data;
      });
    },
    loadFanArt() {
      // Create cancel token
      this.fanart = getFanArt(
        this.details.imdb_id || this.details.id,
        this.getMediaType,
        { cancelToken: this.cancelTokens.fanart.token }
      )
        .then((r) => {
          this.fanart = r.data;

          var backgrounds =
            (this.getOrientation == "16x9"
              ? r.data.moviebackgrounds || r.data.showbackgrounds
              : r.data.movieposter || r.data.tvposter) || null;

          if (backgrounds) {
            var backgroundsInLang = backgrounds.filter(
              (i) => i.lang == this.$store.state.ISO639
            );

            if (backgroundsInLang.length > 0) {
              this.backdropPath = backgroundsInLang[0].url;
            }
          }
        })
        .catch((e) => {
          if (axios.isCancel(e)) {
            console.log("Cancelled");
          } else {
            //console.log(this.$props.info.id, this.getMediaType, this.$props);
            //console.error("Error", e);
          }
        });
    },
    stopLoading() {
      this.isLoading = false;
    },
  },
  created() {
    this.sourcedFromTrakt = this.$props.info.type ? true : false;

    this.fetchDetails();

    setTimeout(() => {
      if (!this.backdropPath && !this.details) {
        // Force stop loading
        this.stopLoading();
      }
    }, 8000);
  },
  beforeUnmount() {
    if (this.cancelTokens) {
      Array.from(this.cancelTokens).forEach((token) => {
        token.cancel("Operation canceled by lifecycle hook.");
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.opaque {
  opacity: 1;
}

.translucent {
  opacity: 0;
}

a {
  text-decoration: none;
  color: whitesmoke;
  cursor: pointer;

  .faded {
    display: none;
  }

  .boxart {
    position: relative;
    width: 100%;
    height: 0;
    overflow: hidden;
  }

  .boxart-size-7x10 {
    padding: 70% 0; // 7x10 aspect ratio padding hack
  }

  .boxart-size-16x9 {
    padding: 28.125% 0; // 16x9 aspect ratio padding hack
  }

  .boxart-rounded {
    border-radius: 4px;
  }

  .boxart-image-in-padded-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
  }

  img.boxart-image {
    object-fit: cover;
    border: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
  }

  .overlay-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .progress-container {
    position: relative;
    transition: opacity 350ms;
    text-align: center;

    .progress-bar {
      progress {
        appearance: none;
        border: none;
        height: 3px;
        width: 85%;
      }

      progress[value] {
        appearance: none;
      }

      progress::-webkit-progress-bar {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5) inset;
      }

      progress[value]::-webkit-progress-value {
        background: red;
      }
    }
  }

  .fallback-text-container {
    background-size: cover;
    background-color: #454545;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: -1;

    .fallback-text {
      box-sizing: border-box;
      position: absolute;
      width: 90%;
      padding: 0 0 10%;
      bottom: 0;
      left: 5;
      right: 5%;
      text-shadow: rgb(0, 0, 0) 0 0 4px;
      text-align: center;
      text-overflow: ellipsis;
      font-weight: 700;
      font-size: 1.2em;
      overflow: hidden;
      z-index: 2;
    }
  }

  @keyframes Pulse {
    0% {
      background-color: #303030;
    }
    50% {
      background-color: #454545;
    }
    100% {
      background-color: #303030;
    }
  }

  .pulse {
    animation: Pulse 3s ease-in-out 0s infinite;
  }
}
</style>
