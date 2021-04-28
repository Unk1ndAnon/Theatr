<template>
  <div class="card" @click="onClick">
    <img :src="getBackdrop()" :alt="info.title || info.name" />
  </div>
</template>

<script>
import { MEDIA, getDetails } from "../../api/tmdb";

export default {
  name: "Card",
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  emits: ["media-play"],
  methods: {
    onClick() {
      // Base64 encode the mediaInfo into the `mi` variable
      let mi = encodeURI(
        btoa([
          this.details.id,
          this.details.imdb_id,
          this.media_type,
          this.details.title || this.details.name,
          this.details.release_date,
        ]).replace(/\//g, ".")
      );
      this.$emit("media-play", this.details); // Emit the 'media-play' event to the parent component
      this.$router.push(`/watch/${mi}`); // Navigate to /watch/<mediaInfo>
    },
  },
  data() {
    return {
      media_type: this.$props.info.title ? MEDIA.Movie : MEDIA.Show,
      details: null,
      fanart: null,
      getBackdrop: () => {
        // TODO rewrite this clusterfuck
        return this.fanart
          ? this.fanart.moviebackground[0].file_path
          : "https://image.tmdb.org/t/p/w400" +
              (this.details
                ? this.details.images.backdrops.length > 0
                  ? this.details.images.backdrops[0].file_path
                  : this.details.backdrop_path
                : this.$props.info.backdrop_path);
      },
    };
  },
  created() {
    getDetails(this.$props.info.id, this.media_type).then((r) => {
      this.details = r.data;
    });
  },
};
</script>
