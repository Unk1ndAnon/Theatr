<template>
  <div class="browse">
    <Header />
    <div class="browse-container">
      <Lolomo :section="'search'" />
    </div>
  </div>
</template>

<script>
import Header from "../components/Header";
import Lolomo from "../components/Lolomo/Lolomo";

export default {
  name: "Home",
  components: { Header, Lolomo },
};
</script>

<style lang="scss" scoped>
.browse-container {
  position: relative;
  margin-top: 70px;
  z-index: 0;
}
</style>
