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
          <div class="nav-element">
            <ProfileImage />
          </div>

          <div class="nav-element">
            <div class="searchBox">
              <input
                type="text"
                placeholder="Titles, people, genres"
                v-model="searchField"
                target="_blank"
                class="searchBar"
                ref="searchBar"
                @input="search"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileImage from "./ProfileImage";

export default {
  name: "Header",
  components: {
    ProfileImage,
  },
  methods: {
    focus() {
      console.log(1);
      this.$refs.searchBar.focus();
    },
    search() {
      this.searchTerm = this.searchField;
      this.$router.replace(`/search/${this.searchTerm}`);
    },
    windowScrolled() {
      this.pageYOffset = window.pageYOffset;
    },
  },
  data() {
    return {
      searchTerm: this.$route.params.searchTerm || null,
      pageYOffset: window.pageYOffset,
    };
  },
  created() {
    this.searchField = this.$route.params.searchTerm || "";
    window.addEventListener("scroll", this.windowScrolled);
  },
  mounted() {
    this.$refs.searchBar.focus();
  },
  unmounted() {
    window.removeEventListener("scroll", this.windowScrolled);
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

    .primary-nav {
      list-style-type: none;
      display: flex;

      .navigation-tab {
        margin-left: 20px;
        font-size: 1.4vh;

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
    }

    .secondary-nav {
      position: absolute;
      right: 0;
      display: flex;
      flex-flow: row-reverse;

      .nav-element {
        display: inline-flex;
        vertical-align: middle;
        align-items: center;

        .searchBox {
          .searchBar {
            background: black;
            color: lightgray;
            height: 1.75em;
            border: 1px solid lightgray;
            border-radius: 4px;
            outline: 0;
          }
        }

        .searchTab {
          display: inline-block;
          cursor: pointer;
          border: none;
          color: white;
        }
      }
    }
  }
}
</style>
