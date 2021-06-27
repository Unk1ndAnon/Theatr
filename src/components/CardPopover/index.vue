<template>
  <div
    ref="elPopover"
    class="popover-wrapper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div ref="elModal" class="preview-modal--container">
      <div class="preview-modal--player_container" @click="onBoxartClick">
        <div class="preview-modal--boxart-wrapper">
          <img
            ref="elBoxart"
            v-if="backdrop"
            class="preview-modal-boxart"
            :src="backdrop"
          />

          <div ref="elVideowrapper" class="video--wrapper hide">
            <div ref="elVideooverlay" class="video--wrapper--overlay hide">
              <h3 ref="elVideooverlayTitle" class="overlay-title">
                {{ media_title }}
              </h3>
            </div>
            <video ref="videoplayer" id="videoPlayer" class="video-js" />
          </div>

          <div
            ref="elFallbackwrapper"
            v-if="!backdrop"
            class="preview-modal-boxart-fallback"
            :style="{ 'background-image': fallbackBackdropStyle }"
          >
            <p class="fallback-text">{{ media_title }}</p>
          </div>

          <div
            ref="elProgresswrapper"
            v-if="progress"
            class="preview-modal-boxart-watchprogress"
          >
            <progress :value="Number(progress).toFixed(0)" max="100" />
          </div>
        </div>
      </div>

      <div ref="elInfowrapper" class="preview-modal--infowrapper">
        <div class="preview-modal--modal-container">
          <div class="preview-modal--info-container">
            <div class="preview-modal--metadataAndControls">
              <div class="buttonControls--container">
                <button class="color-primary hasIcon fill" type="button">
                  <div class="ltr">
                    <div class="small">
                      <font-awesome-icon class="icon" :icon="icon.play" />
                    </div>
                  </div>
                </button>

                <button class="color-primary hasIcon fill" type="button">
                  <div class="ltr">
                    <div class="small">
                      <font-awesome-icon class="icon" :icon="icon.add" />
                    </div>
                  </div>
                </button>

                <button
                  class="color-primary hasIcon fill expand-button"
                  type="button"
                  @click="expandModal"
                >
                  <div class="ltr">
                    <div class="small">
                      <font-awesome-icon class="icon" :icon="icon.expand" />
                    </div>
                  </div>
                </button>
              </div>

              <div class="preview-modal--metadataAndControls-info">
                <div class="videoMetadata--container">
                  <!-- <div class="videoMetadata--first-line">
                    <span class="score">{{
                      Math.floor(details.popularity)
                    }}</span>
                  </div> -->

                  <div class="videoMetadata--second-line">
                    <span class="duration">{{ runtime }}</span>
                    <span class="maturity-rating">
                      <span class="maturity-number">{{
                        certification || "NR"
                      }}</span>
                    </span>
                    <span class="year">{{
                      (
                        details.release_date || details.first_air_date
                      ).substring(0, 4)
                    }}</span>
                  </div>
                </div>

                <div class="videoMetadata--third-line">
                  <span class="production-company"></span>
                </div>
              </div>

              <div class="preview-modal--metadataAndControls-synopsis">
                {{ details.overview }}
              </div>

              <div class="preview-modal--metadataAndControls-tags-container">
                <div class="evidence-tags">
                  <ul class="evidence-list">
                    <li
                      class="evidence-item"
                      v-for="genre in details.genres"
                      :key="genre.id"
                    >
                      <a class="evidence-text" :href="`/${genre.id}`">{{
                        genre.name
                      }}</a>
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="expanded" class="preview-modal--episodeSelector">
                <div class="episodeSelector-header">
                  <span class="episodeSelector-header-text">Episodes</span>
                  <div class="episodeSelector-dropdown">
                    <select
                      ref="episodeSelector"
                      class="episodeSelector"
                      v-model="selectedSeason"
                    >
                      <option
                        v-for="s in seasons"
                        :key="s.id"
                        :value="`${s.id}`"
                      >
                        {{ s.name }}
                      </option>
                    </select>
                  </div>

                  <div class="episodeSelector-container" v-if="selectedSeason">
                    {{ selectedSeason }}
                    <div
                      class="episodeCard"
                      v-for="e in episodes(selectedSeason)"
                      :key="e.id"
                    >
                      {{ e.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="overlay" @click="onClickOutside"></div>
  </div>
</template>

<script>
import "./CardPop.scss";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faPlay,
  faPlus,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import videojs from "video.js";

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
  components: {
    FontAwesomeIcon,
  },
  props: {
    config: {
      required: true,
    },
  },
  emits: ["unpop", "modal-expand"],
  watch: {
    "video.playing": "onPlayStateChange",
    selectedSeason: "test",
  },
  data() {
    return {
      icon: {
        play: faPlay,
        add: faPlus,
        expand: faChevronDown,
      },
      video: {
        keys: null,
        streamingData: null,
        streamURL: null,
        videojs: null,
        playing: false,
      },
      mouseLeft: false,
      hoveringTimeout: setTimeout(() => {
        if (!this.hasMouseLeft) {
          this.renderVideo();
        }
      }, 2000),
      expanded: false,
      selectedSeason: this.seasons
        ? this.seasons[0]
          ? this.seasons[0]
          : this.seasons[1]
        : 0,
      selectedEpisode: 1,
    };
  },
  computed: {
    carddimensions() {
      return this.$props.config[1];
    },
    cardprops() {
      return this.$props.config[2];
    },
    details() {
      return this.$props.config[3];
    },
    progress() {
      return this.$props.config[7];
    },
    seasons() {
      return this.$props.config[6];
    },
    episodes(season) {
      console.log(JSON.parse(JSON.stringify(this.seasons)).get());
      return this.seasons;
    },
    certification() {
      const ratings =
        this.details.release_dates || this.details.content_ratings;
      let ratingForISO = ratings.results.find((i) => i.iso_3166_1 == "US");
      if (!ratingForISO) ratingForISO = ratings.results[0];
      if (!ratingForISO) return null;
      return ratingForISO.rating || ratingForISO.release_dates[0].certification;
    },
    hasMouseLeft() {
      return this.mouseLeft;
    },
    runtime() {
      const runtime = this.details.runtime;
      const numSsns = this.details.number_of_seasons;
      return runtime
        ? `${runtime} Minutes`
        : `${numSsns} Season${numSsns > 1 ? "s" : ""}`;
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
      if (this.details) return this.details.title || this.details.name;
      return null;
    },
    original_title() {
      if (this.details)
        return this.details.original_title || this.details.original_name;
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
      console.log(this.seasons);
      const episode =
        this.selectedEpisode || this.seasons
          ? this.seasons[1].episodes[0]
          : null;
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
    test() {
      console.log(this.selectedSeason, this.selectedEpisode);
    },
    onPlayStateChange() {
      if (this.video.playing) {
        // Fade out the images
        if (this.$refs.elBoxart) this.$refs.elBoxart.classList.add("hide");

        if (this.$refs.elFallbackwrapper)
          this.$refs.elFallbackwrapper.classList.add("hide");

        if (this.$refs.elProgresswrapper)
          this.$refs.elProgresswrapper.classList.add("hide");

        setTimeout(() => {
          this.$refs.elVideowrapper.classList.remove("hide");

          setTimeout(() => {
            this.$refs.elVideooverlay.classList.remove("hide");
            setTimeout(() => {
              this.$refs.elVideooverlayTitle.classList.add("faded");
            }, 4000);
          }, 6000);
        }, 500);
      } else {
        this.$refs.elVideowrapper.classList.add("hide");
        this.$refs.elVideooverlay.classList.add("hide");
        this.$refs.elVideooverlayTitle.classList.remove("faded");

        setTimeout(() => {
          if (this.$refs.elBoxart) this.$refs.elBoxart.classList.remove("hide");

          if (this.$refs.elFallbackwrapper)
            this.$refs.elFallbackwrapper.classList.remove("hide");

          if (this.$refs.elProgresswrapper)
            this.$refs.elProgresswrapper.classList.remove("hide");
        }, 500);
      }
    },
    isVideoPlaying() {
      return this.video.playing;
    },
    adjustedPopDimensions() {
      let origin = `228px 258px 0px`;

      let top = this.carddimensions.top - this.carddimensions.height;
      /*if (top < 70) {
        top = this.carddimensions.top;
        origin = "228px top 0px";
      } else if (top > window.innerHeight - this.carddimensions.height * 2) {
        top = this.carddimensions.bottom - this.carddimensions.height * 2;
        origin = "228px bottom 0px";
      }*/

      let left = this.carddimensions.left - this.carddimensions.width / 2;
      if (left < 0) {
        // left pos is under 0
        left = this.carddimensions.left;
        origin = "left 258px 0px";
      } else if (left > window.innerWidth - this.carddimensions.width * 2) {
        left = this.carddimensions.right - this.carddimensions.width * 2;
        origin = "right 258px 0px";
      }
      let width = this.carddimensions.width * 2;

      return {
        top: top,
        left: left,
        width: width,
        origin: origin,
      };
    },
    setDimensions() {
      if (!this.expanded) {
        const popDims = this.adjustedPopDimensions();
        //this.$refs.elModal.style.transform = `scaleX(0.5) scaleY(0.5) translateZ(0px) translateY(${popDims.top}px) translateX(${popDims.left}px)`;
        this.$refs.elModal.classList.remove("faded");
        this.$refs.elModal.style.top = `${popDims.top}px`;
        this.$refs.elModal.style.left = `${popDims.left}px`;
        this.$refs.elModal.style.width = `${popDims.width}px`;
        this.$refs.elModal.style["transform-origin"] = popDims.origin;
      } else {
        this.$refs.elModal.style.top = `${window.scrollY + 70}px`;
      }
    },
    onMouseEnter() {
      this.mouseLeft = false;
    },
    onMouseLeave() {
      this.mouseLeft = true;

      if (!this.expanded) {
        this.closeModal();
      }
    },
    closeModal() {
      this.destroyVideoJS();

      this.$refs.elModal.classList.remove("popped");
      this.$refs.elPopover.classList.remove("expanded");
      this.$refs.elModal.classList.remove("detail-modal");
      this.$refs.elModal.classList.remove("faded");

      setTimeout(() => this.$refs.elModal.classList.add("faded"), 200);
      setTimeout(() => {
        this.$emit("unpop");
        this.mouseLeft = false;
        this.expanded = false;
        document.body.style.overflow = "visible";
      }, 300);
    },
    onBoxartClick() {
      this.$router.push(this.getWatchLink);
    },
    getVideoData() {
      const videos = this.details.videos.results;

      if (videos.length > 0) {
        let validvideos = videos.filter((i) => i.type == "Trailer");
        validvideos.push(...videos.filter((i) => i.type == "Clip"));
        validvideos.push(...videos.filter((i) => i.type == "Teaser"));

        this.video.list = validvideos;

        // TODO
        //ipcRenderer.send("yt-get-video-info", validvideos[0].key);
      }
    },
    renderVideo() {
      if (!this.expanded) {
        if (this.$refs.videoplayer) {
          this.video.videojs = videojs(
            this.$refs.videoplayer.getAttribute("id"),
            {
              autoplay: true,
              controls: false,
              loop: false,
              sources: [
                {
                  type: "video/mp4",
                  src: this.video.streamURL,
                },
              ],
            },
            () => {
              // onPlayerReady()
            }
          );

          this.video.videojs.on("play", () => (this.video.playing = true));
          this.video.videojs.on("ended", () => (this.video.playing = false));
        }
      }
    },
    expandModal() {
      if (!this.expanded) {
        this.expanded = true;

        this.$emit("modal-expand");
        this.setDimensions();
        document.body.style.overflow = "hidden";

        if (this.$refs.elBoxart) {
          this.$refs.elBoxart.src = this.$refs.elBoxart.src.replace(
            "w500",
            "original"
          );
        } else {
          this.$refs.elFallbackwrapper.style["background-image"] =
            this.$refs.elFallbackwrapper.style["background-image"].replace(
              "w500",
              "original"
            );
        }

        this.$refs.elPopover.classList.add("expanded");
        this.$refs.elModal.classList.add("detail-modal");
      }
    },
    onClickOutside() {
      this.closeModal();
    },
    destroyVideoJS() {
      // destroy the videojs player if any
      if (this.video.videojs) {
        try {
          this.video.videojs.dispose();
        } catch (e) {
          //console.error(e);
        }
      }
    },
  },
  mounted() {
    //console.log("mounted", this.adjustedPopDimensions());
    this.getVideoData();
    this.setDimensions();
    this.render = true;
    setTimeout(() => {
      this.$refs.elModal.classList.add("popped");
    }, 1);

    console.log(this.seasons);
  },
  updated() {
    if (this.$refs) {
      //console.log("updated", this.adjustedPopDimensions());
      this.getVideoData();
      this.setDimensions();
      this.render = true;
      setTimeout(() => {
        this.$refs.elModal.classList.add("popped");
      }, 1);
    }
  },
  beforeUnmount() {
    this.destroyVideoJS();
  },
};
</script>
