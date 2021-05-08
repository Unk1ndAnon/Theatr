<template>
  <div class="billboard-pane">
    <div class="fill-container">
      <div class="info">
        <div class="logo-and-text" v-if="this.details">
          <div class="title-wrapper">
            <div class="billboard-title">
              <img
                class="title-logo"
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
            <div class="synopsis-container">
              <div class="synopsis" v-if="this.details">
                {{ this.details.tagline || info.overview }}
              </div>
            </div>
          </div>

          <div class="billboard-links">
            <button @click="onPlayClick">Play</button>
          </div>
        </div>
      </div>
    </div>
    <div class="image-wrapper">
      <img
        :src="'https://images.tmdb.org/t/p/original' + info.backdrop_path"
        :alt="info.title"
      />
    </div>
  </div>
</template>

<script>
import { MEDIA, getDetails } from "../../api/tmdb";
import { getFanArt } from "../../api/fanart";

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
    };
  },
  watch: {
    details: ["fetchFanArt"],
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
                const { ipcRenderer } = require("electron");

                const releaseDate =
                  this.details.release_date || this.details.first_air_date;

                ipcRenderer.once(`fanarttv-scrape-${this.id}`, (e, data) => {
                  var fanartResults = JSON.parse(data);

                  fanartResults = fanartResults.filter((m) => {
                    if (m.year > 0) {
                      // if year exists in fanart response
                      return m.year == releaseDate.split("-")[0];
                    }
                  });

                  fanartResults = fanartResults.sort((a, b) => {
                    b.imageCount - a.imageCount;
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
              });
          }
        });
    },
    fetchDetails() {
      getDetails(this.$props.info.id, this.mediaType, {
        append_to_response: "images,videos",
      }).then((r) => {
        this.details = r.data;
      });
    },
  },
  mounted() {
    this.fetchDetails();
  },
};
</script>
