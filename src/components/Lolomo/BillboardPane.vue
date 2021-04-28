<template>
  <div class="billboard-pane">
    <div class="fill-container">
      <div class="info">
        <div class="logo-and-text">
          <div class="title-wrapper">
            <div class="billboard-title">
              <img
                class="title-logo"
                v-bind:src="getLogo()"
                v-bind:alt="info.title || info.name"
              />
            </div>
          </div>

          <div class="info-wrapper">
            <div
              class="episode-title-container"
              v-if="this.details && this.media_type == 'tv'"
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
        :src="'https://images.tmdb.org/t/p/w1280' + info.backdrop_path"
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
  methods: {
    onPlayClick() {
      this.$router.push(
        `/watch/${encodeURI(
          btoa([
            this.details.id,
            this.details.imdb_id,
            this.media_type,
            this.details.title || this.details.name,
            this.details.release_date,
          ]).replace(/\//g, ".")
        )}`
      );
    },
    getLogo() {
      if (this.fanart == null) return null;

      if (this.fanart.hdmovielogo.length > 0) {
        let englishLogos = this.fanart.hdmovielogo.filter((l) => {
          return l.lang == "en";
        });

        return englishLogos[0].url;
      }

      return null;
    },
  },
  data() {
    return {
      media_type:
        this.$props.info.media_type ||
        (this.$props.info.title ? MEDIA.Movie : MEDIA.Show),
      details: null,
      fanart: null,
    };
  },
  mounted() {
    getDetails(this.$props.info.id, this.media_type).then((r) => {
      this.details = r.data;
    });

    getFanArt(this.$props.info.id)
      .then((r) => {
        this.fanart = r.data;
      })
      .catch(() => {
        console.error('Fanart error for ' + this.$props.info.id + ': ' + this.$props.info.name || this.$props.info.title);
      });
  },
};
</script>
