<template>
  <div class="lolomo">
    <div class="lolomo-container">
      <div class="billboard"></div>

      <div class="lomcontainer">
          <Lom />
      </div>
    </div>
  </div>
</template>

<script>
import "./Lolomo.scss";
import Lom from './Lom/Lom.vue';

export default {
  components: { Lom },
  name: "Lolomo",
};
</script>
