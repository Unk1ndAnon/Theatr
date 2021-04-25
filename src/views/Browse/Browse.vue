<template>
  <div class="browse">
    <Header />
    <div class="browse-container">
      <Lolomo />
    </div>
  </div>
</template>

<script>
import Header from "../../components/Header/Header.vue";
import Lolomo from "../../components/Lolomo/Lolomo.vue";
import "./Browse.scss";

export default {
  components: { Header, Lolomo },
  name: "Home",
};
</script>
