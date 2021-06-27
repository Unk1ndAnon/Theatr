<template>
  <div class="watch-container" v-show="details" ref="watchcontainer">
    <video id="videoPlayer" ref="video" class="hidden video-js" />

    <img
      :src="getBackdrop(currentBackdrop)"
      ref="backdropElement"
      alt=""
      class="poster pan-left"
      v-show="loading"
    />

    <div
      class="overlay"
      ref="overlay"
    >
      <div class="overlay-loading" v-if="loading">
        <button @click="goBack">Back</button>

        <div class="status">
          {{statusText}}
          <span class="dlspeed" v-if="client">{{client.downloadSpeed / 1024}} KB/s {{torrent ? " from " + torrent.numPeers + `peer${this.numPeers == 1 ? "" : "s"}` : ""}}</span>
        </div>
      </div>

      <div
        class="overlay-watching"
        v-if="!loading"
        @click="togglePlay"
        @dblclick="toggleFullscreen"
        @mouseenter="overlayShow"
        @mouseleave="overlayHide"
      >
        <div class="control-back">
          <button @click="goBack">Back</button>
        </div>

        <div class="control-trackbar">
          <progress
            class="trackbar"
            :value="videocurrenttime"
            :max="videoduration"
          />

          <div class="trackbar-controls">
            <div class="primary-controls">
              <button class="playpause">p</button>
              <button class="rewind">r</button>
              <button class="forward">f</button>
              <button class="volume">v</button>
              <div class="meta-info">
                {{ getMediaTitle }}
                <div class="episode-meta"></div>
              </div>
            </div>

            <div class="secondary-controls">
              <button class="queue-next">n</button>
              <button class="episode-select">e</button>
              <button class="settings">s</button>
              <button class="magnify">m</button>
              <button class="fullscreen-toggle">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from "../store";
import Trakt, { isAuthenticated } from "../api/trakt";
import { MEDIA, getDetails, getEpisodes } from "../api/tmdb";
import { getFanArt } from "../api/fanart";
import { search } from "../api/jackett";
import { CancelToken, axios } from "../api/axios";

import videojs from "video.js";

//const { ipcRenderer } = require("electron");
const WebTorrent = require("webtorrent-hybrid");

export default {
  name: "Watch",
  data() {
    return {
      mi: atob(
        decodeURIComponent(this.$route.params.mi).replace(/\./g, "/")
      ).split(","),
      backdrops: [],
      current_backdrop: 0,
      backdrop_interval: null,
      details: null,
      episodes: {},
      fanart: null,
      sources: null,
      sourceIndex: null,
      magnet: null,
      file: null,
      loading: true,
      client: null,
      torrent: null,
      player: null,
      blob: null,
      statusText: "Loading component...",
      cancelTokens: {
        details: CancelToken.source(),
        fanart: CancelToken.source(),
      },
    };
  },
  watch: {
    blob: ["renderVideoFromBlob"],
    file: ["renderVideo"],
    magnet: ["addMagnet"],
    sourceIndex: ["downloadTorrent"],
    details: ["fetchFanArt", "fetchSources"],
    backdrops: ["startRotatingBackdrops"],
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
      return this.details
        ? this.details.title || this.details.name
        : this.mi[2];
    },
    getMediaType() {
      return this.mi[2];
    },
    videoduration() {
      if (this.player) {
        console.log(this.player.duration());
        return this.player.duration();
      }
      return 0;
    },
    videocurrenttime() {
      if (this.player) {
        console.log(this.player.currentTime());
        return this.player.currentTime();
      }
      return 0;
    },
  },
  methods: {
    videoprogress() {
      // Get the video player progress as a percentage with maximum
      // 2 decimal points.
      if (this.player)
        return ((this.videocurrenttime / this.videoduration) * 100).toFixed(2);
      return 0;
    },
    onMouseMove() {
      if (this.overlayhidden) {
        this.overlayShow();
      } else {
        clearTimeout(this.hovertimeout);
        this.hovertimeout = setTimeout(() => {
          this.overlayHide();
        }, 3000);
      }
    },
    overlayShow() {
      this.overlayhidden = false;
      document.body.style.cursor = "auto";
      this.$refs.overlay.classList.remove("hidden");
      document.addEventListener("mousemove", this.onMouseMove, false);
    },
    overlayHide() {
      this.overlayhidden = true;
      document.body.style.cursor = "none";
      if (!this.loading) this.$refs.overlay.classList.add("hidden");
      if (this.player) {
        if (!this.player.isPlaying) {
          setTimeout(() => {
            // Display movie meta info
          }, 5000);
        }
      }
    },
    toggleFullscreen() {
      if (document.fullscreenEnabled) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          this.$refs.watchcontainer.requestFullscreen();
        }
      }
    },
    togglePlay() {
      if (this.player) {
        if (!this.player.paused) this.player.pause();
        else this.player.play();
      }
    },
    setStatus(text) {
      console.log("WATCH", text);
      this.statusText = text;
    },
    goBack() {
      this.$router.back();
    },
    fetchSources() {
      this.setStatus("Searching for sources...");

      const imdb_id = this.details.imdb_id || this.mi[1];
      const nameOrTitle = this.details.title || this.details.name || this.mi[3];

      var match = null;
      var s = null;
      var e = null;

      if (this.getMediaType == MEDIA.Show) {
        match = this.mi[5].match(/s(\d+):e(\d+)/);
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
                restructured.source_type =
                  o.link.toString().startsWith("magnet:") ||
                  o["torznab:attr"].find((i) => i.$.name == "magneturl")
                    ? "magnet"
                    : "http";
                restructured.source =
                  restructured.source_type == "magnet"
                    ? o.link.toString().startsWith("magnet")
                      ? o.link.toString()
                      : o["torznab:attr"].find((i) => i.$.name == "magneturl").$
                          .value
                    : o.link.toString();
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
                restructured.torznab = o["torznab:attr"];

                return restructured;
              });

              // Set the sources object
              this.sources = items;
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

      getFanArt(this.mi[1], this.getMediaType, {
        cancelToken: this.cancelTokens.fanart.token,
      })
        .then((r) => {
          this.fanart = r.data;

          const backgrounds = r.data.moviebackground || r.data.showbackground;

          if (backgrounds) {
            this.backdrops.push(
              ...(r.data.moviebackground || r.data.showbackground).filter(
                (i) => {
                  return i.lang == "";
                }
              )
            );
          }
        })
        .catch((e) => {
          // Try again with IMDB ID
          if (this.details && this.details.imdb_id) {
            getFanArt(this.details.imdb_id, this.getMediaType)
              .then((r) => {
                this.fanart = r.data;
              })
              .catch((e) => {
                this.scrapeFanArt();
              });
          } else {
            this.scrapeFanArt();
          }
        });
    },
    scrapeFanArt() {
      // Scrape the ID from the HTML results on the site
      // Their TOS doesn't allow this
      // so shut up about it
      const releaseDate =
        this.details.release_date || this.details.first_air_date;

      
    },
    fetchDetails() {
      // Decode the `mi` param.
      // This contains basic info on what we want to play.
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
          const matches = this.mi[5].match(/s(\d+):e(\d+)/);
          const s = matches[1];
          const e = matches[2];

          getEpisodes(this.mi[0], s, e, {
            params: {
              append_to_response: "images,videos",
            },
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
    downloadTorrent() {
      const source = this.sources[this.sourceIndex].source;

      if (source.startsWith("http")) {
        // Download
        this.setStatus("Downloading");
        const http = require("http");
        http.get(source, (r) => {
          if (r.headers.location.startsWith("magnet"))
            this.setStatus("Downloaded torrent file");
            this.magnet = r.headers.location;
        });
      } else {
        this.magnet = source;
      }
    },
    addMagnet() {
      this.setStatus("Loading movie...");
      console.log("JACKETT SOURCES", this.sources); // TODO remove

      const client = new WebTorrent();

      client.on("error", (err) => {
        console.error("client", err); // TODO remove
      });

      client.on("torrent", (t) => {
        console.log("client", t); // TODO remove
      });

      if (this.magnet) {
        console.log("Adding", this.magnet); // TODO remove

        client.add(this.magnet, (t) => {
          t.on("infohash", () => {
            console.log("torrent", "infohash"); // TODO remove
          });
          t.on("metadata", () => {
            console.log("torrent", "metadata"); // TODO remove
          });
          t.on("ready", () => {
            console.log("torrent", "ready"); // TODO remove
          });
          t.on("warning", (warn) => {
            console.warn("torrent", warn); // TODO remove
          });
          t.on("error", (err) => {
            console.error("torrent", err); // TODO remove
          });
          t.on("done", () => {
            console.log("torrent", "done"); // TODO remove
            t.pause();
          });
          t.on("wire", (w) => {
            console.log("torrent", "wire", w);
          });

          this.torrent = t;

          // Filter files by those with supported file extensions
          // then reduce down to the single largest file.
          var f = t.files.filter((f) =>
            ["mp4", "mkv", "avi", "m4v"].some((ext) =>
              f.name.endsWith("." + ext)
            )
          );

          var selectedFile;

          if (this.getMediaType == MEDIA.Show) {
            // Sometimes the torrents are bundles of multiple episodes
            // or seasons. So if this is the case, find the file that
            // matches our intended episode.
            selectedFile = f.find((f) => {
              let s = this.mi[5].split(":")[0];
              let e = this.mi[5].split(":")[1];
              if (f.name.indexOf(s) >= 0) {
                if (f.name.indexOf(e) >= 0) {
                  return true;
                }
              }
              return false;
            });
            console.log(selectedFile); // TODO remove
          } else {
            // Media type is a movie, so reduce the files down to the
            // largest.
            selectedFile = f.reduce((a, b) => {
              return a.length > b.length ? a : b;
            });
          }

          this.file = selectedFile;

          this.transcodeVideo();
        });

        this.client = client;
      } else {
        this.setStatus("No sources found for torrent.");
      }
    },
    async transcode() {
      // TODO ffmpeg transcode stream
      /*ffmpeg.setLogger(({ type, message }) => {
        console.log(type, message); // TODO remove
      });

      await ffmpeg.load();

      ffmpeg.FS(
        "writeFile",
        this.file.name,
        await fetchFile(`${this.torrent.path}/${this.file.name}`)
      );
      const mp4 = this.file.name.replace(/\..+$/, ".mp4");

      await ffmpeg.run("-i", this.file.name, mp4);

      const data = ffmpeg.FS("readFile", mp4);
      this.blob = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );*/
    },
    transcodeVideo() {
      if (!this.file.name.endsWith(".mp4")) {
        this.transcode();
      }
    },
    renderVideo() {
      console.log("rendering", this.file); // TODO remove

      if (this.sources[this.sourceIndex]) {
        this.sources[this.sourceIndex].mime_type = "video/mp4";
        this.setStatus("Initializing video player");

        /*setTimeout(() => {
            if (this.player.readyState() == 0) {
              // Change the source type
              this.sourceIndex++;
              this.setStatus("Trying another source");
            }
          }, 30000);*/

        if (this.$refs.video) {
          this.player = videojs(
            this.$refs.video.getAttribute("id"),
            {
              autoplay: true,
              controls: false,
              loop: false,
              playbackRates: [0.5, 1, 1.5, 2],
              sources: [
                {
                  type: "video/mp4",
                  src: this.torrent.torrentFileBlobURL,
                },
              ],
            },
            () => {
              this.file.renderTo(`#${this.$refs.video.getAttribute("id")}`);
              const blob = this.$refs.video.getAttribute("src");

              setTimeout(() => {
                this.setStatus("Setting player blob");

                /*this.player.cache_.source = {
                  type: this.sources[this.sourceIndex].mime_type,
                  src: blob,
                };*/

                this.setStatus("Streaming");

                // Begin background fade
                this.$refs.backdropElement.classList.add("hidden", "fade");

                setTimeout(() => {
                  this.$refs.video.parentNode.classList.remove("hidden");
                  this.$refs.video.classList.remove("hidden");

                  this.loading = false;

                  // TODO scrobble
                  // TODO videojs event hooks

                  // TODO resume
                  if (this.mi[8] || this.mi[7]) {
                    console.log(this.mi[8], this.mi[7]);
                    console.log(
                      "Resuming",
                      ((this.mi[8] || this.mi[7]) / 100) *
                        this.player.duration()
                    );
                    this.player.currentTime(
                      ((this.mi[8] || this.mi[7]) / 100) *
                        this.player.duration() -
                        15
                    );
                  }

                  this.player.play();

                  this.player.on("play", () => {
                    if (isAuthenticated()) {
                      Trakt.scrobble.start({
                        movie: {
                          ids: {
                            slug: this.mi[this.getMediaType == "movie" ? 6 : 7],
                          },
                        },
                        progress: this.videoprogress(),
                      });
                    }
                  });

                  this.player.on("pause", () => {
                    if (isAuthenticated()) {
                      Trakt.scrobble.pause({
                        movie: {
                          ids: {
                            slug: this.mi[this.getMediaType == "movie" ? 6 : 7],
                          },
                        },
                        progress: this.videoprogress(),
                      });
                    }
                  });

                  this.player.on("ended", () => {
                    if (isAuthenticated()) {
                      Trakt.scrobble.stop({
                        movie: {
                          ids: {
                            slug: this.mi[this.getMediaType == "movie" ? 6 : 7],
                          },
                        },
                        progress: 100,
                      });
                    }
                  });

                  //ipcRenderer.send("onVideoPlay");

                  console.log(this.player);
                }, 3000); // create suspense... 3 seconds of blackness :)
              }, 100);
            }
          );
        } else {
          console.log("Video not referenced"); // TODO remove
        }
      }
    },
    renderVideoFromBlob() {
      console.log("rendering", this.blob); // TODO remove
      this.setStatus("Initializing video player");
      if (this.$refs.video) {
        this.player = videojs(
          this.$refs.video.getAttribute("id"),
          {
            videoOptions: {
              autoplay: false,
            },
          },
          () => {
            this.setStatus("Setting player blob");

            this.player.cache_.source = {
              type: this.sources[this.sourceIndex].mime_type,
              src: this.blob,
            };

            this.setStatus("Streaming");

            // Begin background fade
            this.$refs.backdropElement.classList.add("hidden", "fade");
            setTimeout(() => {
              this.$refs.video.parentNode.classList.remove("hidden");
              this.$refs.video.classList.remove("hidden");

              this.loading = false;
              this.player.play();

              //ipcRenderer.send("onVideoPlay");
            });
          }
        );
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
          this.$refs.backdropElement.classList.add("hidden", "fade", "zoomed");
          setTimeout(() => {
            console.log("Changing backdrop"); // TODO remove

            if (this.currentBackdrop >= this.backdrops.length - 1) {
              this.currentBackdrop = 0; // reset
            } else {
              this.currentBackdrop++;
            }

            // Switch pan directions
            if (this.$refs.backdropElement) {
              let classList = this.$refs.backdropElement.classList;

              if (classList.contains("pan-left")) {
                classList.remove("pan-left");
                classList.add("pan-right");
              } else if (classList.contains("pan-right")) {
                classList.remove("pan-right");
                classList.add("pan-left");
              }
            }

            setTimeout(() => {
              if (this.$refs.backdropElement) {
                // show
                this.$refs.backdropElement.classList.remove("hidden");
                this.$refs.backdropElement.classList.add("show");
              }
            }, 3000);
          }, 2100);
        }
      }, 45000); // 45 seconds
    },
    onClose() {
      // TODO go back if possible without reload, else go to /browse
      this.$router.back();
    },
  },
  created() {
    this.startRotatingBackdrops();
    this.setStatus("Created view");
  },
  mounted() {
    this.fetchDetails();
  },
  beforeUnmount() {
    //ipcRenderer.send("onVideoEnd");

    // Cancel all requests
    this.cancelTokens.fanart.cancel("Operation canceled by lifecycle hook.");
    this.cancelTokens.details.cancel("Operation canceled by lifecycle hook.");

    if (this.player) {
      if (isAuthenticated()) {
        Trakt.scrobble.pause({
          movie: {
            ids: {
              slug: this.mi[this.getMediaType == "movie" ? 6 : 7],
            },
          },
          progress: this.videoprogress(),
        });
      }

      try {
        this.player.dispose();
      } catch (e) {
        console.error(e); // TODO remove
      }
    }

    if (this.torrent) {
      this.torrent.pause();
    }

    if (this.client) {
      try {
        this.client.destroy((e) => {
          console.error(e); // TODO remove
        });
      } catch (e) {
        // Suppress
      }
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

  .video-js {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  @keyframes Zoom {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes PanLeft {
    0% {
      transform: translateX(-15%);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes PanRight {
    0% {
      transform: translateX(15%);
    }
    100% {
      transform: translateX(0);
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
    opacity: 0 !important;
  }

  .show {
    opacity: 1;
  }

  .fade {
    transition: opacity 2s, transform 2s;
  }

  .poster {
    position: absolute;
    z-index: 2;
    object-fit: cover;

    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .zoom {
    animation: Zoom 90s ease-out 0s infinite;
  }

  .zoomed {
    transform: scale(1.3);
  }

  .pan-left {
    animation: PanLeft 90s ease-out 0s infinite;
    width: 120%;
    height: 120%;
    left: 0;
  }

  .pan-right {
    animation: PanRight 90s ease-out 0s infinite;
    width: 120%;
    height: 120%;
    right: 0;
  }

  .overlay {
    position: absolute;
    z-index: 99;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;

    text-shadow: rgb(0, 0, 0) 2px 2px 4px;

    opacity: 1;
    transition: opacity 0.2s;

    .overlay-loading {
      .status {
        position: absolute;
        display: flex;
        flex-flow: column;
        bottom: 2%;
        width: 100%;
        text-align: center;
        font-size: 16px;
        font-weight: 400;

        * { margin: 0.2em; }
        .dlspeed {
          font-size: 13px;
          color: dimgray;
          font-weight: 500;
        }
      }
    }

    .overlay-watching {
      position: absolute;
      width: 98%;
      height: 98%;
      margin: 1%;

      .control-back {
      }

      .control-trackbar {
        position: absolute;
        width: 100%;
        bottom: 0;

        display: flex;
        flex-flow: column;

        .trackbar {
          width: 100%;
        }

        .trackbar-controls {
          display: flex;
          justify-content: space-between;

          .primary-controls {
            display: flex;
            flex-flow: row;
          }

          .secondary-controls {
            display: flex;
            flex-flow: row;
          }
        }
      }
    }
  }
}
</style>
