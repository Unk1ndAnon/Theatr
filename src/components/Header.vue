<template>
  <div class="pinning-header">
    <div class="ph-container">
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
            <div class="searchBar">
              <input type="text" placeholder="Search" v-model="searchField" target="_blank" />
              <button @click="search" class="searchButton">O</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Header",
  methods: {
    search() {
      console.log('Searching', this.searchField)
      this.$emit("search", this.searchField);
    },
  },
  data() {
    return {
      searchField: "",
    }
  }
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

  .ph-container {
    background: none repeat scroll 0% 0%;
  }

  .main-header {
    position: relative;
    display: flex;

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

        a {
          text-decoration: none;
          color: darkgray;
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
    }
  }
}
</style>
