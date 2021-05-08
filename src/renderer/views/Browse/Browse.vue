<template>
  <div class="browse">
    <Header />
    <div class="browse-container">
      <Lolomo :section="section" />
    </div>
  </div>
</template>

<script>
import Header from "../../components/Header";
import Lolomo from "../../components/Lolomo/Lolomo";

export default {
  name: "Home",
  components: { Header, Lolomo },
  methods: {},
  computed: {
    section: {
      get() {
        return this.$route.params.section;
      },
      set(newSection) {
        this.$router.push({
          name: "Browse",
          params: { section: newSection },
        });
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.browse-container {
  position: relative;
  z-index: 0;
}
</style>
