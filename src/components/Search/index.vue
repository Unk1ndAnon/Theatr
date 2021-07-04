<template>
  <div class="searchBox">
    <input
      :type="type"
      :placeholder="placeholder"
      v-model="inputText"
      class="searchBar"
      ref="searchBar"
      @input="onInput"
    />
  </div>
</template>

<script>
import "./Search.scss";

export default {
  name: "Search",
  props: {
    input: {
      type: String,
      required: false,
      default: "",
    },
    placeholder: {
      type: String,
      required: false,
      default: "",
    },
    type: {
      type: String,
      required: false,
      default: "text",
    },
  },
  watch: {
    $route(to, from) {
        console.log(1);
      this.$refs.searchBar.focus();
    },
  },
  methods: {
    onInput() {
      this.$emit("onInput", this.inputText);
    },
    onRouteChange() {
      console.log(1);
    },
  },
  data() {
    return {
      textInput: this.$props.input,
    };
  },
  created() {},
  mounted() {
    if (this.$route.params.searchTerm) {
      this.$refs.searchBar.value = this.$route.params.searchTerm;
      this.$refs.searchBar.focus();
    }
  },
};
</script>
