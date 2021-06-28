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
        <p class="fallback-text" v-if="!isLoading">{{ media_title }}</p>
      </div>
    </div>

    <div
      :class="`progress-container ${
        progress != null ? 'opaque' : 'translucent'
      }`"
    >
      <span class="progress-bar">
        <progress :value="Number(progress).toFixed(0)" max="100" />
      </span>
    </div>
  </a>
</template>

<script>
import { CancelToken, axios } from "../../api/axios";
import { getFanArt } from "../../api/fanart";
import { MEDIA, getDetails, getEpisodes } from "../../api/tmdb";
import Trakt from "../../api/trakt";

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
      backdrop: null,
      trakt: null,
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
    details: ["loadFanArt", "fetchSeasonEpisodes"],
    isHovering: ["onHover"],
  },
  computed: {
    card_config() {
      return this.$props.config;
    },
    media_info() {
      return this.$props.info;
    },
    is_trakt() {
      // Check for the existence of keys unique to Trakt.TV API responses.
      return (
        this.media_info.ids || this.media_info.movie || this.media_info.show
      );
    },
    trakt_ids() {
      if (this.is_trakt) {
        if (this.media_info.ids) return this.media_info.ids;
        if (this.media_info.movie) return this.media_info.movie.ids;
        if (this.media_info.show) return this.media_info.show.ids;
      }

      if (this.trakt) {
        if (this.trakt.movie) return this.trakt.movie.ids;
        if (this.trakt.show) return this.trakt.show.ids;
        if (this.trakt.ids) return this.trakt.ids;
      }

      return null;
    },
    trakt_id() {
      if (this.trakt) return this.trakt_ids.trakt;
      return this.is_trakt ? this.trakt_ids.trakt || this.media_info.id : null;
    },
    tmdb_id() {
      return this.is_trakt ? this.trakt_ids.tmdb : this.media_info.id;
    },
    application_language() {
      return this.$store.state.ISO639;
    },
    media_title() {
      if (this.media_info.title) return this.media_info.title;
      if (this.media_info.name) return this.media_info.name;

      if (this.is_trakt) {
        if (this.media_info.movie) return this.media_info.movie.title;
        if (this.media_info.show) return this.media_info.show.title;
      }

      return null;
    },
    media_type() {
      if (this.is_trakt) {
        if (this.trakt_ids)
          return this.trakt_ids.tvdb ? MEDIA.Show : MEDIA.Movie;
      }
      return this.media_info.title ? MEDIA.Movie : MEDIA.Show;
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
          this.tmdb_id,
          this.details ? this.details.imdb_id : "",
          this.media_type,
          encodeURIComponent(this.$props.info.title || this.$props.info.name),
          this.$props.info.release_date,
          this.trakt_id,
          this.trakt_ids ? this.trakt_ids.slug : null,
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
          this.trakt_ids ? this.trakt_ids.slug : null,
          this.progress || null,
        ]).replace(/\//g, ".")
      );
    },
    getWatchLink() {
      if (this.media_type == MEDIA.Show) {
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
      console.log(this.media_title, this.details);
      console.log("Backdrop", this.backdrop);
      console.log("Media Type", this.media_type);
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
          this.seasons,
          this.progress,
          this.trakt,
        ]);
      }
    },
    onMouseLeave() {
      this.isMouseOver = false;
      this.isHovering = false;
    },
    fetchDetails() {
      if (this.$props.info.progress) this.progress = this.$props.info.progress;

      if (!this.is_trakt) {
        /*Trakt.search
          .id({
            id: this.tmdb_id,
            id_type: "tmdb",
            type: this.media_type == "tv" ? "show" : "movie",
          })
          .then((r) => {
            this.trakt = r.data[0];
          });*/
      }

      getDetails(this.tmdb_id, this.media_type, {
        params: {
          append_to_response:
            "images,videos" +
            (this.media_type == "movie"
              ? ",release_dates"
              : ",content_ratings"),
        },
        cancelToken: this.cancelTokens.details.token,
      })
        .then((r) => {
          this.details = r.data;

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
            console.log(this.tmdb_id, this.media_type, this.$props);
            console.error("Error", e);
          }
        });
    },
    fetchSeasonEpisodes() {
      if (this.media_type == MEDIA.Show) {
        if (this.details.seasons) {
          this.details.seasons.forEach((s) => {
            getEpisodes(this.tmdb_id, s.season_number, null, {
              cancelToken: this.cancelTokens.episodes.token,
            }).then((r) => {
              this.seasons[s.season_number] = r.data;
            });
          });
        }
      }
    },
    loadFanArt() {
      // Create cancel token
      this.fanart = getFanArt(
        this.details.imdb_id || this.details.id,
        this.media_type,
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
        .catch((e) => {});
    },
    stopLoading() {
      this.isLoading = false;
    },
  },
  mounted() {
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
a {
  text-decoration: none;
  color: whitesmoke;
  cursor: pointer;
}

.faded {
  display: none;
}

.boxart {
  box-shadow: rgba(0, 0, 0, 0.75) 0px 3px 10px;
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
  height: 100%;
  z-index: -1;

  .fallback-text {
    box-sizing: border-box;
    position: absolute;
    width: 90%;
    padding: 0 0 0;
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
</style>
