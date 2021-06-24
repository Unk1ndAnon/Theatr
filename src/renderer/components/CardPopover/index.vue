<template>
  <div
    ref="elPopover"
    class="popover-wrapper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div ref="elModal" class="preview-modal--container">
      <div class="preview-modal--player_container">
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
            </div>
          </div>
        </div>
      </div>
    </div>
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
import { ipcRenderer } from "electron";

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
  emits: ["unpop"],
  watch: {
    "video.playing": "onPlayStateChange",
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
      let origin = "center";

      let top = this.carddimensions.top - this.carddimensions.height;
      let left = this.carddimensions.left - this.carddimensions.width / 2;
      if (left < 0) {
        // left pos is under 0
        left = this.carddimensions.left;
        origin = "left";
      } else if (left > window.innerWidth - this.carddimensions.width * 2) {
        left = this.carddimensions.right - this.carddimensions.width * 2;
        origin = "right";
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
      const popDims = this.adjustedPopDimensions();
      this.$refs.elPopover.style.top = `${popDims.top}px`;
      this.$refs.elPopover.style.left = `${popDims.left}px`;
      this.$refs.elModal.style.width = `${popDims.width}px`;
      this.$refs.elModal.style["transform-origin"] = popDims.origin;
    },
    onMouseEnter() {
      this.mouseLeft = false;
    },
    onMouseLeave() {
      this.mouseLeft = true;
      this.destroyVideoJS();

      this.$refs.elModal.classList.remove("popped");
      setTimeout(() => {
        this.$emit("unpop");
      }, 200);
    },
    onBoxartClick() {
      //this.$router.push(this.getWatchLink);
    },
    getVideoData() {
      const videos = this.details.videos.results;

      if (videos.length > 0) {
        let validvideos = videos.filter((i) => i.type == "Trailer");
        validvideos.push(...videos.filter((i) => i.type == "Clip"));
        validvideos.push(...videos.filter((i) => i.type == "Teaser"));

        this.video.list = validvideos;

        ipcRenderer.once(
          `yt-get-video-info-${validvideos[0].key}`,
          (e, ...args) => {
            const videos = args[0].streamingData;

            if (!videos) {
              return;
            }

            let suitable = videos.formats || videos.adaptiveFormats || null;
            if (suitable) {
              suitable = suitable.filter(
                (i) => i.mimeType.indexOf("video/mp4") > -1
              );

              /**
               * = ITAG Table =======================
                  133 	mp4 	video 	240p 	- 	- 	
                  134 	mp4 	video 	360p 	- 	- 	
                  135 	mp4 	video 	480p 	- 	- 	
                  136 	mp4 	video 	720p 	- 	- 	
                  137 	mp4 	video 	1080p 	- 	- 	
                  138 	mp4 	video 	2160p60 	- 	- 	
                  139 	m4a 	audio 	- 	48k 	- 	
                  140 	m4a 	audio 	- 	128k 	- 	
                  141 	m4a 	audio 	- 	256k 	- 	
                  151 	hls 	audio/video 	72p 	- 	- 	
                  160 	mp4 	video 	144p 	- 	- 	
                  167 	webm 	video 	360p 	- 	- 	
                  168 	webm 	video 	480p 	- 	- 	
                  169 	webm 	video 	1080p 	- 	- 	
                  171 	webm 	audio 	- 	128k 	- 	
                  218 	webm 	video 	480p 	- 	- 	
                  219 	webm 	video 	144p 	- 	- 	
                  242 	webm 	video 	240p 	- 	- 	
                  243 	webm 	video 	360p 	- 	- 	
                  244 	webm 	video 	480p 	- 	- 	
                  245 	webm 	video 	480p 	- 	- 	
                  246 	webm 	video 	480p 	- 	- 	
                  247 	webm 	video 	720p 	- 	- 	
                  248 	webm 	video 	1080p 	- 	- 	
                  249 	webm 	audio 	- 	50k 	- 	
                  250 	webm 	audio 	- 	70k 	- 	
                  251 	webm 	audio 	- 	160k 	- 	
                  264 	mp4 	video 	1440p 	- 	- 	
                  266 	mp4 	video 	2160p60 	- 	- 	
                  271 	webm 	video 	1440p 	- 	- 	
                  272 	webm 	video 	4320p 	- 	- 	
                  278 	webm 	video 	144p 	- 	- 	
                  298 	mp4 	video 	720p60 	- 	- 	
                  299 	mp4 	video 	1080p60 	- 	- 	
                  302 	webm 	video 	720p60 	- 	- 	
                  303 	webm 	video 	1080p60 	- 	- 	
                  308 	webm 	video 	1440p60 	- 	- 	
                  313 	webm 	video 	2160p 	- 	- 	
                  315 	webm 	video 	2160p60 	- 	- 	
                  330 	webm 	video 	144p60 	- 	hdr 	
                  331 	webm 	video 	240p60 	- 	hdr 	
                  332 	webm 	video 	360p60 	- 	hdr 	
                  333 	webm 	video 	480p60 	- 	hdr 	
                  334 	webm 	video 	720p60 	- 	hdr 	
                  335 	webm 	video 	1080p60 	- 	hdr 	
                  336 	webm 	video 	1440p60 	- 	hdr 	
                  337 	webm 	video 	2160p60 	- 	hdr 	
              */

              // Find a suitable video stream from suitable_formats
              // arranged in order. Top takes priority.
              const suitable_formats = [
                /* ordinary formats */
                22, // 720p h.264 aac
                18, // 360p h.264 aac

                /* adaptive formats */
                136, // 720p    h.264
                298, // 720p60  h.264 hfr
                135, // 480p    h.264
                137, // 1080p   h.264
                299, // 1080p60 h.264 hfr
              ];

              let stream = null;
              suitable_formats.forEach((f) => {
                if (stream) return;

                const found = suitable.find((i) => i.itag == f);
                if (found) stream = found;
              });

              if (stream) {
                this.video.streamingData = suitable;
                this.video.streamURL = stream.url;
              } else {
                console.log("YouTube", "No suitable video found");
              }
            }
          }
        );
        ipcRenderer.send("yt-get-video-info", validvideos[0].key);
      }
    },
    renderVideo() {
      //this.destroyVideoJS();
      console.log(this.video);

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
