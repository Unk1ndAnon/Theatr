<template>
  <a @click="onClick" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div :class="`boxart boxart-rounded boxart-size-16x9 ${visibilityClass}`">
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
  </a>
</template>

<script>
import { getFanArt } from "../../api/fanart";
import { MEDIA, getDetails, getEpisodes } from "../../api/tmdb";

export default {
  name: "Card",
  props: {
    visible: {
      required: true,
    },
    info: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      backdrop: null,
      details: null,
      seasons: {},
      fanart: null,
      isLoading: true,
      isMouseOver: false,
      isHovering: false,
    };
  },
  watch: {
    visible: "handleVisiChange",
    details: ["stopLoading", "loadFanArt"], //, "loadSeasonEpisodes"],
  },
  computed: {
    id() {
      return this.$props.info.id;
    },
    getMediaTitle() {
      return this.$props.info.title || this.$props.info.name;
    },
    getMediaType() {
      return this.$props.info.title ? MEDIA.Movie : MEDIA.Show;
    },
    fallbackBackdropStyle() {
      const linearGradient = "linear-gradient(rgba(0,0,0,0),#000)";
      return this.isLoading
        ? "none"
        : this.$props.info.backdrop_path
        ? `url(https://image.tmdb.org/t/p/w500${this.$props.info.backdrop_path})`
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
    visibilityClass() {
      return this.$props.visible ? "" : "faded";
    },
    getEncodedInfo() {
      // URL-encoded Base64 array of strings, with forward slashes (/)
      // replaced with periods (.)
      return encodeURIComponent(
        btoa([
          this.$props.info.id,
          this.details ? this.details.imdb_id : "",
          this.getMediaType,
          encodeURIComponent(this.$props.info.title || this.$props.info.name),
          this.$props.info.release_date,
        ]).replace(/\//g, ".")
      );
    },
    getWatchLink() {
      return `/watch/${this.getEncodedInfo}`;
    },
    areDetailsLoaded() {
      return this.details != null;
    },
  },
  methods: {
    debug() {
      console.log(this.getMediaTitle, this.details);
      console.log("Backdrop", this.backdrop);
      console.log("Media Type", this.getMediaType);
      console.log("Episodes", this.seasons);
      console.log("Fanart", this.fanart);
    },
    onClick() {
      this.$router.push(this.getWatchLink);
    },
    onMouseEnter() {
      console.log(this.backdropPath);
      this.isMouseOver = true;

      setTimeout(() => {
        if (this.isMouseOver) this.isHovering = true;
      }, 850);
    },
    onMouseLeave() {
      this.isMouseOver = false;
      this.isHovering = false;
    },
    fetchDetails() {
      getDetails(this.$props.info.id, this.getMediaType, {
        append_to_response: "images,videos",
      })
        .then((r) => {
          this.details = r.data;

          // Sort backdrops by vote_count (vote_average as returned by API)
          const backdrops = r.data.images.backdrops.sort(
            (a, b) => b.vote_count - a.vote_count
          );

          if (backdrops) {
            // Find backdrops in user language
            const backdropsInLang = backdrops.filter((i) => {
              return i.iso_639_1 == "en";
            });

            if (backdropsInLang.length > 0) {
              this.backdropPath = backdropsInLang[0].file_path;
            }
          }
        })
        .catch((e) => {
          console.log(this.$props.info.id, this.getMediaType, this.$props);
          console.error("Error", e);
        });
    },
    loadSeasonEpisodes(season) {
      // Get basic episode details
      getEpisodes(this.$props.info.id, season, null, {
        append_to_response: "images,videos",
      }).then((r) => {
        // Add to this.seasons array under season number as key
        this.seasons[season] = r.data;
      });
    },
    loadFanArt() {
      const { ipcRenderer } = require("electron");

      const releaseDate =
        this.details.release_date ||
        this.details.first_air_date ||
        this.$props.info.release_date ||
        this.$props.info.first_air_date;

      ipcRenderer.once(`fanarttv-scrape-${this.id}`, (e, data) => {
        var fanartResults = JSON.parse(data);

        fanartResults = fanartResults.filter((m) => {
          return m.year == releaseDate.split("-")[0];
        });

        // TODO sort the fanartResults array by imageCount (in case of multiple results for year)
        fanartResults = fanartResults.sort(
          (a, b) => b.imageCount - a.imageCount
        );

        // TODO some fanart names are different than the names returned from TMDb
        // TODO write an algorithm to determine similarity between two title names (thresholded)
        if (fanartResults[0]) {
          getFanArt(fanartResults[0].id, this.getMediaType)
            .then((r) => {
              this.fanart = r.data;

              var backgrounds =
                r.data.moviebackgrounds || r.data.showbackgrounds || null;

              if (backgrounds) {
                var backgroundsInLang = backgrounds.filter(
                  (i) => i.lang == "en"
                );

                if (backgroundsInLang.length > 0) {
                  this.backdropPath = backgroundsInLang[0].url;
                }
              }
            })
            .catch((e) => {
              console.error(
                "Fanart",
                this.id,
                fanartResults[0].id,
                fanartResults,
                e
              );
            });
        }
      });

      // Send to ipcMain, which will scrape FanArtTV (bypassing CORS) for the fanart ID
      ipcRenderer.send(
        `scrape-fanarttv`,
        this.details.id || this.$props.info.id,
        this.getMediaTitle,
        releaseDate.split("-")[0] | "",
        this.getMediaType === "movie" ? 3 : 1
      );
    },
    stopLoading() {
      this.isLoading = false;
    },
    handleVisiChange() {
      if (this.$props.visible && !this.details) {
        // Get movie/tv details
        //this.fetchDetails();
      }
    },
  },
  created() {
    if (this.$props.visible) {
      // Get movie/tv details
      //this.fetchDetails();
    }

    setTimeout(() => {
      if (!this.backdropPath && !this.details) {
        // Force stop loading
        //this.stopLoading();
      }
    }, 8000);
  },
};
</script>

<style lang="scss" scoped>
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
  }

  .boxart-size-7x10 {
    padding-top: 70%;
  }

  .boxart-size-16x9 {
    padding-top: 56.25%;
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
    height: 100%;
    width: 100%;
    z-index: 1;
  }

  .fallback-text-container {
    background-size: cover;
    background-color: #454545;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
      text-overflow: wrap;
      font-weight: 700;
      overflow: hidden;
      z-index: 2;
    }
  }

  @keyframes Pulse {
    0% {
      background: #303030;
    }
    50% {
      background: #454545;
    }
    100% {
      background: #303030;
    }
  }

  .pulse {
    animation: Pulse 3s ease-in-out 0s infinite;
  }
}
</style>
