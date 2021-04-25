<template>
  <div class="pinning-header">
    <div class="ph-container">
      <div class="main-header" role="navigation">
        <nav>
          <ul class="primary-nav">
            <li class="navigation-tab">
              <router-link to="/">Home</router-link>
            </li>
            <li class="navigation-tab">
              <router-link to="/browse">Browse</router-link>
            </li>
            <li class="navigation-tab">
              <router-link to="/browse/movies">Movies</router-link>
            </li>
            <li class="navigation-tab">
              <router-link to="/browse/tv">Shows</router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import "./Header.scss";

export default {
  name: "Header",
};
</script>
