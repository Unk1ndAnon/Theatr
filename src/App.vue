<template>
  <router-view @media-play="playMedia" />
</template>

<script>
export default {
  name: "App",
  methods: {
    playMedia(...arg) {
      console.log(arg);
    }
  }
}
</script>

<style lang="scss">
body {
  font-family: Avenir, Arial, Helvetica, sans-serif;
  margin: 0; padding: 0;
  user-select: none;
  background: #202020;
  color: white;
}
</style>
