<template>
  <div class="watch-container" v-if="details">
    <video
      id="videoPlayer"
      ref="video"
      class="hidden theatr-player video-js vjs-default-style"
    />

    <img
      :src="getBackdrop(currentBackdrop)"
      ref="backdropElement"
      alt=""
      class="poster pan"
      v-if="loading"
    />
  </div>
</template>

<script>
import { MEDIA, getDetails, getEpisodes } from "../api/tmdb";
import { getFanArt } from "../api/fanart";
import { search } from "../api/jackett";
import { CancelToken, axios } from "../api/axios";

import videojs from "video.js";
import "video.js/dist/video-js.css";

const WebTorrent = require("webtorrent");

export default {
  name: "Watch",
  data() {
    return {
      mi: null,
      backdrops: [],
      current_backdrop: 0,
      backdrop_interval: null,
      details: null,
      episodes: {},
      fanart: null,
      sources: null,
      sourceIndex: null,
      loading: true,
      client: null,
      torrent: null,
      player: null,
      blob: null,
      loadingBg: "black",
      statusText: "Loading component...",
      cancelTokens: {
        details: CancelToken.source(),
        fanart: CancelToken.source(),
      },
    };
  },
  watch: {
    sourceIndex: "renderVideo",
    details: ["fetchFanArt", "fetchSources"],
    backdrops: "startRotatingBackdrops",
  },
  computed: {
    currentBackdrop: {
      get() {
        return this.current_backdrop;
      },
      set(i) {
        this.current_backdrop = i;
      },
    },
    getMediaTitle() {
      return this.details.title || this.details.name || this.mi[2];
    },
    getMediaType() {
      return this.mi[2];
    },
  },
  methods: {
    setStatus(text) {
      console.log("WATCH", text);
      this.statusText = text;
    },
    fetchSources() {
      this.setStatus("Searching for sources...");

      const imdb_id = this.details.imdb_id || this.mi[1];
      const nameOrTitle = this.details.title || this.details.name || this.mi[3];

      var match = null;
      var s = null;
      var e = null;

      if (this.getMediaType == MEDIA.Show) {
        match = this.mi[5].match(/s(\d+)e(\d+)/);
        s = match[1];
        e = match[2];
      }
      search(imdb_id || nameOrTitle, s, e)
        .then((r) => {
          // Parse XML and convert to a JS Object
          const xml2js = require("xml2js").parseString;
          xml2js(r.data, (e, d) => {
            if (d.rss.channel[0].item) {
              const items = d.rss.channel[0].item.map((o) => {
                var restructured = {};

                restructured.title = o.title.toString();
                restructured.source_type = o.link
                  .toString()
                  .startsWith("magnet:")
                  ? "magnet"
                  : "http";
                restructured.source = o.link.toString();
                restructured.size = o.size[0];
                restructured.quality =
                  o.title
                    .toString()
                    .match(
                      /[^A-Za-z0-9](2160|1080|720|480|360|4K)?p[^A-Za-z0-9]/i
                    ) || "Unknown";
                restructured.rip =
                  o.title
                    .toString()
                    .match(
                      /[^A-Za-z0-9](BLURAY|B|BD|WEB|HD|HDTV|HC|DVD|SCR|CAM|TC|TS?[\s-][RIP|DL|MUX|SCR|CAM])[^A-Za-z0-9]/i
                    ) || "Unknown";
                restructured.features = o.title
                  .toString()
                  .match(
                    /[^A-Za-z0-9](HDR|6CH|ATMO?S|5[\\.\s]1|DUBBED)[^A-Za-z0-9]/gi
                  );
                restructured.seeders = o["torznab:attr"].find(
                  (i) => i.$.name == "seeders"
                ).$.value;
                restructured.peers = o["torznab:attr"].find(
                  (i) => i.$.name == "peers"
                ).$.value;

                return restructured;
              });

              // Filter by magnet, then sort by quality exluding those that quality isn't known.
              this.sources = items
                .filter((s) => s.source_type == "magnet")
                .sort((a, b) =>
                  a.quality && b.quality ? a.quality[1] > b.quality[1] : false
                );

              this.sourceIndex = 0;

              this.setStatus(
                `Found ${this.sources.length} sources by search "${
                  imdb_id || nameOrTitle
                }"`
              );
            } else {
              this.setStatus("No results found!");
            }
          });
        })
        .catch((e) => {
          console.error("JackettRequest", e);
        });
    },
    fetchFanArt() {
      this.setStatus("Fetching fan art...");

      getFanArt(this.details.imdb_id || this.mi[1], this.getMediaType, {
        cancelToken: this.cancelTokens.fanart.token,
      }).then((r) => {
        this.fanart = r.data;

        const backgrounds = r.data.moviebackground || r.data.showbackground;

        if (backgrounds) {
          this.backdrops.push(
            ...(r.data.moviebackground || r.data.showbackground).filter((i) => {
              return i.lang == "";
            })
          );
        }
      });
    },
    fetchDetails() {
      // Decode the `mi` param.
      // This contains basic info on what we want to play.
      this.mi = atob(
        decodeURIComponent(this.$route.params.mi).replace(/\./g, "/")
      ).split(",");
      this.mi[3] = decodeURIComponent(this.mi[3]); // title is double-uri-encoded

      this.setStatus("Fetching details...");

      getDetails(this.mi[0], this.mi[2], {
        params: {
          append_to_response: "images",
          language: "",
        },
        cancelToken: this.cancelTokens.details.token,
      }).then((r) => {
        this.details = r.data;

        this.backdrops.push(
          ...r.data.images.backdrops.filter((i) => {
            return i.iso_639_1 == null;
          })
        );
      });

      if (this.mi[2] == MEDIA.Show) {
        if (this.mi[5]) {
          const matches = this.mi[5].match(/s(\d+)e(\d+)/);
          const s = matches[1];
          const e = matches[2];

          getEpisodes(this.mi[0], s, e, {
            append_to_response: "images,videos",
          }).then((r) => {
            if (!this.episodes[s]) this.episodes[s] = {};
            this.episodes[s][e] = r.data;

            if (r.data.images.stills.length > 0) {
              this.backdrops.push(...r.data.images.stills);
            }
          });
        }
      }
    },
    renderVideo() {
      this.setStatus("Loading movie...");
      console.log("JACKETT SOURCES", this.sources);

      var client = new WebTorrent();

      client.on("error", (err) => {
        console.error("client", err);
      });

      client.on("torrent", (t) => {
        console.log("client", t);
      });

      console.log("Adding", this.sources[this.sourceIndex].source);

      if (this.sources[this.sourceIndex]) {
        client.add(this.sources[this.sourceIndex].source, (t) => {
          t.on("infohash", () => {
            console.log("torrent", "infohash");
          });
          t.on("metadata", () => {
            console.log("torrent", "metadata");
          });
          t.on("ready", () => {
            console.log("torrent", "ready");
          });
          t.on("warning", (warn) => {
            console.warn("torrent", warn);
          });
          t.on("error", (err) => {
            console.error("torrent", err);
          });
          t.on("done", () => {
            console.log("torrent", "done");
          });

          // TODO support multiple video and audio codecs (mkv avi m4v...)

          // Filter files by those with supported file extensions
          // then reduce down to the single largest file.
          const f = t.files
            .filter((f) =>
              ["mp4"].some((ext) =>
                f.name.endsWith("." + ext)
              )
            )
            .reduce((a, b) => {
              return a.length > b.length ? a : b;
            });

          if (f) {
            this.sources[this.sourceIndex].mime_type = "video/mp4";
            this.setStatus("Initializing video player");

            setTimeout(() => {
              if (this.player.readyState() == 0) {
                // Change the source type
                this.sourceIndex++;
                this.setStatus("Trying another source");
              }
            }, 13000);

            this.player = videojs(
              this.$refs.video.getAttribute("id"),
              function () {
                f.renderTo(`#${this.$refs.video.getAttribute("id")}`);
                this.blob = this.$refs.video.getAttribute("src");

                setTimeout(() => {
                  this.setStatus("Setting player blob");

                  this.player.cache_.source = {
                    type: this.source.mime_type,
                    src: this.blob,
                  };

                  this.client = client;
                  this.torrent = t;

                  this.setStatus("Streaming");

                  // Begin background fade
                  this.$refs.backdropElement.classList.add("hidden", "fade");

                  setTimeout(() => {
                    this.$refs.video.parentNode.classList.remove("hidden");
                    this.$refs.video.classList.remove("hidden");

                    this.loading = false;
                    this.player.play();

                    setInterval(
                      () =>
                        console.log(
                          t.progress * 100,
                          (t.downloaded / 1024) ^
                            (2 + "MB of " + t.length / 1024) ^
                            2,
                          ("@" + t.downloadSpeed / 1024) ^ (2 + "MB/s")
                        ),
                      5000
                    );
                  }, 3000); // create suspense... 1 second of blackness :)
                }, 100);
              }
            );
          } else {
            this.setStatus(
              "Video type is unsupported. Streaming to VLC instead."
            );
            console.log("Opening", t.path);
            require("child_process").spawn("vlc", [t.path, "--fullscreen"]);
            this.$router.back();
          }
        });
      } else {
        this.setStatus("Source unavailable. Check log for details.");
      }
    },
    getBackdrop(i) {
      var backdrop = this.backdrops[i]
        ? this.backdrops[i].file_path || this.backdrops[i].url
        : "";

      if (backdrop.startsWith("/")) {
        backdrop = "https://image.tmdb.org/t/p/original" + backdrop;
      }

      return backdrop;
    },
    startRotatingBackdrops() {
      // Set the current backdrop to the first in `backdrops`
      this.currentBackdrop = 0;

      clearInterval(this.backdrop_interval);
      this.backdrop_interval = setInterval(() => {
        if (this.loading && this.$refs.backdropElement) {
          // hide
          this.$refs.backdropElement.classList.remove("show");
          this.$refs.backdropElement.classList.add("hidden", "fade");
          setTimeout(() => {
            console.log("Changing backdrop");

            if (this.currentBackdrop >= this.backdrops.length - 1) {
              this.currentBackdrop = 0; // reset
            } else {
              this.currentBackdrop++;
            }

            setTimeout(() => {
              // show
              this.$refs.backdropElement.classList.remove("hidden");
              this.$refs.backdropElement.classList.add("show");
            }, 3000);
          }, 2100);
        }
      }, 15000); // 45 seconds
    },
    onClose() {
      // TODO go back if possible without reload, else go to /browse
      this.$router.back();
    },
  },
  created() {
    this.setStatus("Created view");
    this.fetchDetails();
  },
  mounted() {
    this.startRotatingBackdrops();
  },
  beforeUnmount() {
    // Cancel all requests
    this.cancelTokens.fanart.cancel("Operation canceled by lifecycle hook.");
    this.cancelTokens.details.cancel("Operation canceled by lifecycle hook.");

    if (this.player) {
      try {
        this.player.dispose();
      } catch (e) {
        console.error(e);
      }
    }

    if (this.client) {
      this.client.destroy();
    }

    console.log("Destroyed");
  },
};
</script>

<style lang="scss" scoped>
.watch-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;

  background: black;
  color: white;

  overflow: hidden;

  .theatr-player {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;

    video.vjs-tech {
      outline: 0;
    }
  }

  @keyframes Pan {
    0% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1.1);
    }
  }

  @keyframes FadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .hidden {
    opacity: 0;
  }

  .show {
    opacity: 1;
  }

  .fade {
    transition: opacity 2s;
  }

  .poster {
    position: absolute;
    z-index: 2;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .pan {
    animation: Pan 60s ease-out 0s infinite;
  }
}
</style>
