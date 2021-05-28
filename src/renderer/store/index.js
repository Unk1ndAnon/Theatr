import { createStore, storeKey } from "vuex";
import createPersistedState from "vuex-persistedstate";
import Trakt from "../api/trakt";

export default createStore({
  state: {
    ISO639: "en",
    trakt: {
      authCode: null,
    }
  },
  getters: {
    isTraktLinked: () => {
      return null;
    }
  },
  mutations: {
    Language(state, l) {
      state.ISO639 = l;
    },
    TraktAuth(state, code) {
      state.trakt.authCode = code;
    },
  },
  actions: {},
  modules: {},

  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
    })
  ]
});
