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

          <div v-if="expanded" class="preview-modal--boxart-titlewrapper">
            <div class="boxart-title-container">
              <img
                v-if="fanartLogo"
                :src="fanartLogo"
                :alt="media_title"
                class="boxart-title"
              />
              <div class="boxart-buttonControls">
                <button class="btn-play" type="button">
                  <font-awesome-icon :icon="icon.play" size="md" />
                  <span class="btn-play_text">Play</span>
                </button>
              </div>
            </div>
          </div>

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
                      <a
                        class="evidence-text"
                        :href="`/browse/genre/${genre.id}`"
                        >{{ genre.name }}</a
                      >
                    </li>
                  </ul>
                </div>
              </div>

              <div
                v-if="expanded && media_type == 'tv'"
                class="preview-modal--episodeSelector"
              >
                <div class="episodeSelector-header">
                  <span class="episodeSelector-header-text">Episodes</span>
                  <div class="episodeSelector-dropdown">
                    <select
                      ref="seasonSelector"
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
                </div>

                <div class="episodeSelector-container" v-if="selectedSeason">
                  <div
                    :class="`episodeCard ${
                      e.episode_number == 1 ? 'selected' : ''
                    } ${currentDate > new Date(e.air_date) ? 'pointer' : ''}`"
                    v-for="e in episodes"
                    :key="e.id"
                  >
                    <div class="episodeCard-title_index">
                      {{ e.episode_number }}
                    </div>

                    <div class="episodeCard-stillWrapper">
                      <img
                        v-if="e.still_path"
                        class="still"
                        :src="`https://image.tmdb.org/t/p/w200/${e.still_path}`"
                      />
                      <img
                        v-else
                        class="still-placeholder"
                        :src="backdrop"
                        alt=""
                      />
                      <div
                        :class="`episodeCard-playIcon ${
                          currentDate > new Date(e.air_date) ? '' : 'hidden'
                        }`"
                      >
                        <font-awesome-icon
                          class="icon"
                          :icon="icon.play"
                          size="xs"
                        />
                      </div>
                    </div>

                    <div class="episodeCard-metadataWrapper">
                      <div class="episodeCard-title">
                        <span class="episodeCard-title_text">{{ e.name }}</span>
                        <span
                          v-if="currentDate > new Date(e.air_date)"
                          class="duration"
                          >{{ details.episode_run_time[0] }}m</span
                        >
                        <span v-else class="future-air-date">{{
                          e.air_date
                        }}</span>
                      </div>
                      <div class="episodeCard-synopsis">{{ e.overview }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="expanded && similar"
                class="preview-modal--similar--wrapper"
              >
                <p class="preview-modal--similar-header">Similar To This</p>

                <div class="section-container">
                  <div class="similar--container">
                    <div
                      class="titleCard--container"
                      v-for="o in similar.slice(0, 9)"
                      :key="o.id"
                    >
                      <div class="titleCard-imagewrapper">
                        <img
                          :src="`https://image.tmdb.org/t/p/w500/${
                            o.images
                              ? (o.images.backdrops ? ((o.images.backdrops.filter(
                                  (i) => i.iso_639_1 == 'en'
                                )[0]) ? (o.images.backdrops.filter(
                                          (i) => i.iso_639_1 == 'en'
                                        )[0].file_path)
                                      : o.backdrop_path)
                              : o.backdrop_path) : o.backdrop_path
                          }`"
                          :alt="o.title || o.name"
                        />
                        <div class="playIcon"></div>
                        <div class="duration">
                          {{
                            o.title
                              ? `${
                                  Math.trunc(o.runtime / 60) >= 1
                                    ? Math.trunc(o.runtime / 60) + "h"
                                    : ""
                                } ${
                                  Math.trunc(o.runtime % 60) >= 1
                                    ? Math.trunc(o.runtime % 60) + "m"
                                    : ""
                                }`
                              : `${
                                  o.number_of_seasons +
                                  " Season" +
                                  (o.number_of_seasons == 1 ? "" : "s")
                                }`
                          }}
                        </div>
                      </div>
                      <div class="titleCard-metadatawrapper">
                        <div class="titleMetadata--container">
                          <div class="titleMetadata">
                            <b>{{ o.title || o.name }}</b>
                          </div>
                        </div>

                        <div class="titleCard-synopsis">{{ o.overview }}</div>
                      </div>
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
import store from "../../store";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faPlay,
  faPlus,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { getDetails, similar } from "../../api/tmdb";
import videojs from "video.js";

/**
this.$emit("card-popover", [
  true,                         0
  this.getAbsoluteDimensions(), 1
  this.$props,                  2
  this.details,                 3
  this.fanart,                  4
  this.backdrop,                5
  this.seasons,                 6
  this.progress,                7
  this.trakt,                   8
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
      similarList: null,
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
      selectedSeason: null,
      selectedEpisode: null,
    };
  },
  computed: {
    currentDate() {
      const d = new Date();
      return new Date(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    },
    carddimensions() {
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
    fanartLogo() {
      let logos = this.fanart.hdmovielogo || this.fanart.hdtvlogo;
      if (!logos) return null;
      logos = logos.filter((o) => o.lang == store.state.ISO639);
      return logos[0].url;
    },
    similar() {
      return this.similarList;
    },
    progress() {
      return this.$props.config[7];
    },
    seasons() {
      return this.$props.config[6];
    },
    traktdetails() {
      return this.$props.config[8];
    },
    episodes() {
      for (const i in this.seasons) {
        if (this.seasons[i].id == this.selectedSeason) {
          return this.seasons[i].episodes;
        }
      }
      return null;
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
    backdrop() {
      return this.$props.config[5];
    },
    card_config() {
      return this.$props.config;
    },
    media_info() {
      return this.$props.config;
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
      return this.details.title ? "movie" : "tv";
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
      console.log(this.traktdetails);

      return encodeURIComponent(
        btoa([
          this.tmdb_id,
          this.details ? this.details.imdb_id : "",
          this.media_type,
          encodeURIComponent(this.details.title || this.details.name),
          this.details.release_date,
          this.traktdetails ? this.traktdetails.id : null,
          this.traktdetails ? this.traktdetails.ids.slug : null,
          this.progress || null,
        ]).replace(/\//g, ".")
      );
    },
    getEncodedInfoForEpisode() {
      const episode = this.episodes.find(
        (e) => e.episode_number == this.selectedEpisode
      );
      console.log(episode);
      console.log(this.traktdetails);

      return encodeURIComponent(
        btoa([
          this.tmdb_id,
          null,
          this.media_type,
          encodeURIComponent(episode.name),
          episode.air_date,
          `s${this.selectedSeason}:e${this.selectedEpisode}`,
          this.traktdetails ? this.traktdetails.id : null,
          this.traktdetails ? this.traktdetails.ids.slug : null,
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
      console.log(
        this.selectedSeason,
        this.selectedEpisode,
        this.$refs.seasonSelector.length
      );
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
      let origin = `${this.carddimensions.width}px ${this.carddimensions.height * 2}px`;

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
        origin = `left ${this.carddimensions.height * 2}px`;
      } else if (left > window.innerWidth - this.carddimensions.width * 2) {
        left = this.carddimensions.right - this.carddimensions.width * 2;
        origin = `right ${this.carddimensions.height * 2}px`;
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
        this.$refs.elModal.style["transform-origin"] = "bottom center";
        this.$refs.elModal.style.top = `${window.scrollY + 70}px`;
        this.$refs.elModal.style.width = `40%`;
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

      if (this.$refs.elModal) {
        this.$refs.elModal.style.position = "absolute";
        this.$refs.elModal.classList.remove("popped");
        this.$refs.elPopover.classList.remove("expanded");
        this.$refs.elModal.classList.remove("detail-modal");
        this.$refs.elModal.classList.remove("faded");
      }

      setTimeout(() => this.$refs.elModal.classList.add("faded"), 200);
      setTimeout(() => {
        this.$emit("unpop");
        this.mouseLeft = false;
        this.expanded = false;
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
    getSimilar() {
      similar(this.details.id, this.media_type)
        .then((r) => {
          this.similarList = r.data.results;
          console.log(this.similarList);

          r.data.results.forEach((o, i) => {
            console.log(i, o);
            this.getDetailsOfSimilar(i);
          });
        })
        .catch((e) => {
          // TODO
          console.error(e);
        });
    },
    getDetailsOfSimilar(similarIndex) {
      if (this.similar) {
        const similarTitle = this.similar[similarIndex];
        console.log(similarTitle);

        getDetails(similarTitle.id, similarTitle.title ? "movie" : "tv", {
          params: {
            append_to_response: `images,videos,${
              similarTitle.title ? "release_dates" : "content_ratings"
            }`,
          },
        })
          .then((r) => {
            console.log(
              similarTitle.title || similarTitle.name,
              similarTitle,
              r.data
            );

            this.similarList[similarIndex] = r.data;
          })
          .catch((e) => {
            // TODO
            console.error(e);
          });
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
        this.getSimilar();

        this.$emit("modal-expand", true);
        this.setDimensions();

        if (this.$refs.elBoxart) {
          if (this.fanartLogo) {
            this.$refs.elBoxart.src =
              "https://image.tmdb.org/t/p/original/" +
              this.details.backdrop_path;
          } else {
            this.$refs.elBoxart.src = this.$refs.elBoxart.src.replace(
              "w500",
              "original"
            );
          }
        } else {
          this.$refs.elFallbackwrapper.style["background-image"] =
            this.$refs.elFallbackwrapper.style["background-image"].replace(
              "w500",
              "original"
            );
        }

        this.$refs.elPopover.classList.add("expanded");
        this.$refs.elModal.classList.add("detail-modal");
        //setTimeout(() => this.$refs.elModal.style.position = "sticky", 1000);
        //document.addEventListener('scroll', (e) => e.preventDefault(), false);
      }
    },
    collapseModal() {
      this.$refs.elModal.classList.remove("detail-modal");
      this.$refs.elPopover.classList.remove("expanded");
      setTimeout(() => {
        this.closeModal();
      }, 200);
      this.expanded = false;
      this.$emit("modal-expand", false);
    },
    onClickOutside() {
      this.collapseModal();
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
      /*this.getVideoData();
      this.getSimilar(); */

      /* this.render = true;
      setTimeout(() => {
        this.$refs.elModal.classList.add("popped");
      }, 1);*/

      this.setDimensions();
    }
  },
  beforeUnmount() {
    this.destroyVideoJS();
  },
};
</script>
