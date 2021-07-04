<template>
  <div class="browse">
    <Header />
    <div class="browse-container">
      <Lolomo :config="sectionConfig" />
    </div>
    <Footer />
  </div>
</template>

<script>
import Footer from '../../components/Footer';
import Header from "../../components/Header";
import Lolomo from "../../components/Lolomo/Lolomo";

export default {
  name: "Home",
  components: { Header, Footer, Lolomo },
  computed: {
    sectionConfig: {
      get() {
        return this.$route.params.section;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.browse-container {
  min-height: 100%;
  width: 100%;
}
</style>
