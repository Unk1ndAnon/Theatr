<template>
  <div
    class="billboard-pane"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="fill-container">
      <div class="info">
        <div class="logo-and-text" v-show="this.details">
          <div class="title-wrapper">
            <div class="billboard-title">
              <img
                class="title-logo hidden"
                ref="titlelogo"
                :src="getLogo()"
                :alt="info.title || info.name"
              />
            </div>
          </div>

          <div class="info-wrapper">
            <div
              class="episode-title-container"
              v-if="this.details && this.getMediaType == 'tv'"
            >
              {{ this.details.number_of_seasons || 0 }} Seasons :
              {{ this.details.number_of_episodes || 0 }} Episodes
            </div>
            <div class="synopsis-container hidden" ref="synopsis">
              <div class="synopsis" v-if="this.details">
                {{ this.details.tagline || info.overview.split(".")[0] + "." }}
              </div>
            </div>
          </div>

          <div class="billboard-links hidden" ref="linkscontainer">
            <button class="btn-play" @click="onPlayClick">Play</button>
            <button class="btn-info">Info</button>
          </div>
        </div>
      </div>
    </div>
    <div class="video-container">
      <video
        id="video-player"
        class="theatr-trailer image-layer video-js vjs-default-style"
        ref="video"
      ></video>
    </div>
    <div class="image-wrapper">
      <div class="image-vignette"></div>
      <img
        class="image-layer static-img"
        :src="'https://images.tmdb.org/t/p/original' + info.backdrop_path"
        :alt="info.title"
      />
    </div>
  </div>
</template>

<script>
import { MEDIA, getDetails } from "../../api/tmdb";
import { getFanArt } from "../../api/fanart";
//import { ipcRenderer } from "electron";

import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: "Pane",
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      details: null,
      fanart: null,
      youtube: null,
      player: null,

      isMouseOver: false,
      isHovering: false,
    };
  },
  watch: {
    details: ["fetchFanArt", "fetchVideos"],
    isHovering: ["onHover"],
  },
  computed: {
    getMediaType() {
      return (
        this.$props.info.media_type ||
        (this.$props.info.title ? MEDIA.Movie : MEDIA.Show)
      );
    },
  },
  methods: {
    onMouseEnter() {
      this.isMouseOver = true;

      setTimeout(() => {
        if (this.isMouseOver) {
          this.isHovering = true;
        }
      }, 2000);
    },
    onMouseLeave() {
      this.isHovering = false;
      this.isMouseOver = false;
    },
    onHover() {
      // TODO load and play video
      if (this.isHovering) {
        if (this.youtube) {
          /* console.log(
            this.youtube.formats[0].mimeType.split(";")[0],
            this.youtube.formats[0].url
          );

          this.player = videojs(
            this.$refs.video.getAttribute("id"),
            {
              controls: true,
              autoplay: false,
              preload: "auto",
            },
            () => {}
          );

          setTimeout(() => {
            this.player.src({
              type: this.youtube.formats[0].mimeType.split(";")[0],
              src: this.youtube.formats[0].url,
            });

            this.$refs.video.classList.add("playing");

            setTimeout(() => {
              this.player.play();
            }, 1200);
          }, 1000); */
        }
      } else {
        // TODO
      }
    },
    onPlayClick() {
      this.$router.push(
        `/watch/${encodeURI(
          btoa([
            this.details.id,
            this.details.imdb_id,
            this.mediaType,
            this.details.title || this.details.name,
            this.details.release_date,
          ]).replace(/\//g, ".")
        )}`
      );
    },
    getLogo() {
      if (this.fanart == null) return null;

      const hdlogos =
        this.fanart.hdmovielogo ||
        this.fanart.hdtvlogo ||
        this.fanart.hdclearlogo;

      if (hdlogos) {
        if (hdlogos.length > 0) {
          let englishLogos = hdlogos.filter((l) => {
            return l.lang == "en";
          });

          return englishLogos[0].url;
        }
      }
      return null;
    },
    fetchFanArt() {
      getFanArt(this.details.id, this.getMediaType)
        .then((r) => {
          this.fanart = r.data;
        })
        .catch(() => {
          // Try again with IMDB ID
          if (this.details && this.details.imdb_id) {
            getFanArt(this.details.imdb_id, this.getMediaType)
              .then((r2) => {
                this.fanart = r2.data;
              })
              .catch(() => {
                // TODO Scrape
                //const { ipcRenderer } = require("electron");

                const releaseDate =
                  this.details.release_date || this.details.first_air_date;
              });
          }
        });
    },

    fetchDetails() {
      getDetails(this.$props.info.id, this.mediaType, {
        params: { append_to_response: "images,videos" },
      }).then((r) => {
        this.details = r.data;
      });
    },

    fetchVideos() {
      if (this.details.videos) {
        const selectedLangs = this.details.videos.results.filter(
          (o) => o.iso_639_1 == this.$store.state.ISO639
        );
        var selectedTypes = selectedLangs.filter((o) => o.type == "Clip");

        if (selectedTypes.length <= 0)
          selectedTypes = selectedLangs.filter((o) => o.type == "Trailer");
        if (selectedTypes.length <= 0)
          selectedTypes = selectedLangs.filter((o) => o.type == "Teaser");
        if (selectedTypes.length <= 0)
          selectedTypes = selectedLangs.filter(
            (o) => o.type == "Behind the Scenes"
          );
        if (selectedTypes.length <= 0) return;

        const selectedSites = selectedTypes.filter((o) => o.site == "YouTube");

        const key = selectedSites[0].key;

        //ipcRenderer.send("yt-get-video-info", key);
      }
    },
  },
  created() {
    this.fetchDetails();
  },
  mounted() {
    console.log(this.$refs);

    this.$refs.titlelogo.onload = () => {
      this.$refs.titlelogo.classList.remove("hidden");
      this.$refs.synopsis.classList.remove("hidden");
      this.$refs.linkscontainer.classList.remove("hidden");

      this.$refs.titlelogo.classList.add("untranslate");
      this.$refs.synopsis.classList.add("untranslate");
      this.$refs.linkscontainer.classList.add("untranslate");
    };
  },
  beforeUnmount() {
    if (this.player) {
      try {
        this.player.dispose();
      } catch (e) {
        console.error(e);
      }
    }
  },
};
</script>
