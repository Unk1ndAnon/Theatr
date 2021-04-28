<template>
  <div class="browse">
    <Header />
    <div class="browse-container">
      <Lolomo @media-play="playMedia" />
    </div>
  </div>
</template>

<script>
import Header from "../components/Header";
import Lolomo from "../components/Lolomo/Lolomo";

export default {
  components: { Header, Lolomo },
  methods: {
    playMedia(e) {
      console.log(e);
    }
  },
  name: "Home",
};
</script>

<style lang="scss" scoped>
.browse-container {
  position: relative;
  z-index: 0;
}
</style>
