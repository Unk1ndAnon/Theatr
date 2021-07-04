<template>
  <div class="profile" @click="onProfileClick">
    <div class="profile-image-container">
      <img
        src="../assets/trakt.svg"
        alt=""
        class="profile-img"
        @click="onProfileImageClick"
      />
    </div>

    <div :class="`profile-dropdown-modal ${dropdownOpen ? 'opened' : ''}`">
      <div class="account-options">
        <li class="link" v-if="!traktAuthCode" @click="startLink">
          Link with Trakt.TV
        </li>
        <li class="signout" v-if="traktAuthCode">Sign out</li>
      </div>
    </div>
  </div>
</template>

<script>
import Trakt, { AuthenticationServer } from "../api/trakt";
import store from "../store";

export default {
  name: "ProfileImage",
  data() {
    return {
      dropdownOpen: false,
    };
  },
  watch: {
    dropdownOpen: ["dropdownToggled"],
  },
  computed: {
    traktAuthCode() {
      return store.state.trakt.authCode;
    },
  },
  methods: {
    onProfileImageClick(e) {
      // Toggle dropdown
      this.dropdownOpen = !this.dropdownOpen;
    },
    onProfileClick(e) {
      e.stopPropagation(); // Stop the click event from propagating to parents
    },
    onWindowClick() {
      this.dropdown = false;
    },
    dropdownToggled() {
      if (this.dropdownOpen) {
        console.log(this.traktAuthCode);
      }
    },
    startLink() {
      this.authServer = new AuthenticationServer(this.onAuthenticationReceived);
      this.authServer.start();

      const url = Trakt.get_url();
      this.authWindow = open(url);

      this.dropdownOpen = false;
    },
    onAuthenticationReceived(request, response) {
      const code = request.url.match(/authorize\?code=(\w+)/)[1];

      Trakt.exchange_code(code).then((r) => {
        this.authServer.close();
        this.authWindow.close();

        store.commit("TraktAuth", Trakt.export_token());
        this.$router.go(); // reload the page
      });
    },
  },
  created() {
    this.searchField = this.$route.params.searchTerm || "";
    window.addEventListener("click", this.onWindowClick);
  },
  unmounted() {
    window.removeEventListener("click", this.onWindowClick);
  },
};
</script>

<style lang="scss" scoped>
.profile {
  .profile-image-container {
    height: 34px;
    padding: 4px;

    .profile-img {
      cursor: pointer;
      height: 100%;
    }
  }

  div.profile-dropdown-modal {
    position: absolute;
    right: 0;

    z-index: 2;

    background: black;
    padding: 4px;
    border-radius: 4px;

    opacity: 0;
    transition: opacity 0.2s;

    div.account-options {
      list-style: none;

      li {
        cursor: pointer;
        transition: color 0.05s;
      }

      li:hover {
        color: lightgray;
      }
    }
  }

  div.profile-dropdown-modal.opened {
    opacity: 1;
  }
}
</style>
