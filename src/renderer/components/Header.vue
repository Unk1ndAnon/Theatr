<template>
  <div class="pinning-header">
    <div class="ph-container" :class="pageYOffset >= 1 ? 'scrolled' : ''">
      <div class="main-header" role="navigation">
        <ul class="primary-nav">
          <li class="navigation-tab">
            <router-link to="/" exact-active-class="active">Home</router-link>
          </li>
          <li class="navigation-tab">
            <router-link to="/browse" exact-active-class="active"
              >Browse</router-link
            >
          </li>
          <li class="navigation-tab">
            <router-link to="/browse/movies" exact-active-class="active"
              >Movies</router-link
            >
          </li>
          <li class="navigation-tab">
            <router-link to="/browse/tv" exact-active-class="active"
              >Shows</router-link
            >
          </li>
        </ul>
        <div class="secondary-nav">
          <div class="navigation-element">
            <ProfileImage />
          </div>

          <div class="navigation-element">
            <Search
              placeholder="Titles, people, genres"
              ref="search"
              @onInput="onSearchInput"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileImage from "./ProfileImage";
import Search from "./Search";

export default {
  name: "Header",
  components: {
    ProfileImage,
    Search,
  },
  methods: {
    onSearchInput(input) {
      this.$router.replace(`/search/${input}`);
    },
  },
  data() {
    return {
      pageYOffset: window.pageYOffset,
    };
  },
  created() {
    window.addEventListener(
      "scroll",
      () => (this.pageYOffset = window.pageYOffset)
    );
  },
  beforeUnmount() {
    window.removeEventListener(
      "scroll",
      () => (this.pageYOffset = window.pageYOffset)
    );
  },
};
</script>

<style scoped lang="scss">
.pinning-header {
  position: fixed;
  height: 70px;
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  width: 100%;
  z-index: 4;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.5004202364539565) 30%,
    rgba(0, 0, 0, 0) 90%
  );

  .ph-container {
    background-color: transparent;
    transition: background-color 0.3s;
    text-shadow: rgba(0, 0, 0, 0.8) 2px 2px 4px;
  }

  .scrolled {
    background-color: black;
  }

  .main-header {
    position: relative;
    display: flex;
    margin: 0 12px;

    .logo {
      margin-right: 25px;
      display: inline-block;
      cursor: pointer;
    }

    .navigation-tab,
    .navigation-element {
      margin-left: 10px;
      margin-right: 10px;
      font-size: 14px;

      a {
        outline: 0;
        text-decoration: none;
        color: lightgray;

        transition: color 0.2s;
      }
      a:hover {
        color: gray;
      }
      a:active {
        color: dimgray;
      }

      .active {
        color: whitesmoke;
      }
    }

    .primary-nav {
      list-style-type: none;
      display: flex;
    }

    .secondary-nav {
      position: absolute;
      right: 4%;
      height: 100%;
      display: flex;
      flex-flow: row-reverse;

      align-items: center;
      justify-content: flex-end;
    }
  }
}
</style>
