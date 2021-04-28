<template>
  <div class="watch-container">
    <div v-if="loading" class="loader">
      <div v-if="loading && mediaInfo" class="info-container">
        <div class="title">
          <span>{{ mediaInfo.title || mediaInfo.name }}</span>
        </div>

        <div class="watch-controls">
          <span class="btn-close" @click="onClose">X</span>
        </div>
      </div>

      <div class="status-meta-layer">
        <span class="status-text">{{ statusText }}</span>
      </div>

      <img :src="loadingBg" class="bg" alt="" />
    </div>

    <div v-if="!loading" class="video-container">
      <Video autoplay="any" class="video-js video-player" src="" />
    </div>
  </div>
</template>

<script>
import { getDetails } from "../api/tmdb";
import { getFanArt } from "../api/fanart";
import { search } from "../api/jackett";
import WebTorrent from "webtorrent";
import video from "video.js";

export default {
  name: "Watch",
  components: {
    video,
  },
  data() {
    return {
      webtorrent: null,
      loading: true,
      loadingBg: "black",
      mediaInfo: null,
      fanart: null,
      sources: null,
      statusText: "Loading component...",
    };
  },
  methods: {
    setStatus(text) {
      console.log("WATCH", text);
      this.statusText = text;
    },
    fetchData() {
      this.loading = true;

      // Decode the mediaInfo param.
      // This contains basic info on what we want to play.
      const mi = atob(decodeURI(this.$route.params.mi).replace(/\./g, "/")).split(",");

      /**
       * axios.all([getDetails(mi[0], mi[2]), getFanArt(mi[0])]).then(
        axios.spread((...r) => {
          this.mediaInfo = r[0].data;
          this.fanart = r[1].data;

          console.log(r);

          // Reload the background
          // Select a FanArtTV moviebackground, else fallback to TMDB backdrop_path.
          this.loadingBg = `black url(${
            r[1].data.moviebackground.length > 0
              ? r[1].data.moviebackground[0].url
            : r[0].data.images.backdrops.length > 0
              ? r[0].data.images.backdrops[0].file_path
              : r[0].data.backdrop_path
          }) center no-repeat`;
        })
      ).catch((e) => {
        console.error(e);
      });
       */

      this.setStatus("Fetching details...");
      getDetails(mi[0], mi[2]).then((r) => {
        this.mediaInfo = r.data;

        // Reload the background
        this.loadingBg = `https://image.tmdb.org/t/p/original${
          r.data.images.backdrops.filter((i) => {
            return i.lang == "";
          }).length > 0
            ? r.data.images.backdrops.filter((i) => {
                return i.lang == "";
              })[0].file_path
            : r.data.backdrop_path
        }`;
      });

      this.setStatus("Fetching fan art...");
      getFanArt(mi[0]).then((r) => {
        this.fanart = r.data;

        /*this.loadingBg = `${
          r.data.moviebackground.filter(i => { return i.lang == ""; }).length > 0
            ? r.data.moviebackground.filter(i => { return i.lang == ""; })[0].url
            : this.mediaInfo.images.backdrops.filter(i => { return i.lang == "" }).length > 0
            ? this.mediaInfo.images.backdrops.filter(i => { return i.lang == "" })[0].file_path
            : this.mediaInfo.backdrop_path
        }`;*/
      });

      this.setStatus("Searching for sources...");
      search(mi[1] /* IMDB */ || mi[3] /* Title or name */)
        .then((r) => {
          // Parse XML and convert to a JS Object
          const xml2js = require("xml2js").parseString;
          xml2js(r.data, (e, d) => {
            // Save the result items and update the status
            let items = d.rss.channel[0].item;
            this.sources = items;
            this.setStatus(
              `Found ${items.length} sources by search "${mi[1] || mi[3]}"`
            );
          });
        })
        .catch((e) => {
          console.error("JackettRequest", e);
        });
    },
    /**
     * Called whenever `this.sources` array changes.
     */
    renderVideo() {
      this.setStatus("Loading movie...");

      // TODO organize categories (quality, rips...), autoselection
      let torrentString = this.sources[0].link[0];

      let wt = new WebTorrent();
      wt.add(torrentString, (t) => {
        this.setStatus("Added source", t);

        /*var file = t.files.find(function (file) {
          return file.name.endsWith(".mp4");
        });

        // TODO intercept stream or blob URL and render to custom video component
        file.renderTo(".video-player");*/
      });

      //this.loading = false;
    },
    onClose() {
      // TODO go back if possible without reload, else go to /browse
      this.$router.back();
    },
  },
  watch: {
    sources: "renderVideo",
  },
  mounted() {
    console.log("Watch mount");
    this.fetchData();
  },
  unmounted() {
    console.log("Watch unmounted");
  },
};
</script>

<style lang="scss" scoped>
.watch-container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  color: white;
  background: black;

  .video-container {
    position: absolute;
    z-index: 4;
    width: 100%;
    height: 100%;

    .video-player {
      width: 100%;
      height: 100%;
    }
  }

  .loader {
    position: fixed;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;

    @keyframes animZoom {
      0% {
        transform: scale(1.1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1.1);
      }
    }

    .bg {
      position: absolute;
      z-index: 0;
      height: 100%;
      width: 100%;
      object-fit: cover;

      animation: animZoom 60s ease 0s infinite;
    }

    .info-container {
      position: absolute;
      z-index: 2;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 2.25%;

      z-index: 1;

      user-select: none;

      .title {
        position: absolute;
        font-size: 36px;
        font-weight: bold;
      }

      .watch-controls {
        position: absolute;
        font-size: 36px;
        color: gray;
        right: 0;

        .btn-close:hover {
          cursor: pointer;
          font-size: 40px;
          color: white;
        }
      }
    }

    .status-meta-layer {
      position: absolute;
      z-index: 2;
      left: 0;
      right: 0;
      bottom: 3%;

      .status-text {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;

        text-align: center;
        text-shadow: rgba(0, 0, 0, 0.45) 2px 2px 4px;
      }
    }
  }
}
</style>
