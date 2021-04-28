import { createStore } from "vuex";

export default createStore({
  state: {
    ISO639: 'en'
  },
  mutations: {
    setLanguage(state, l) {
      state.ISO639 = l;
    }
  },
  actions: {},
  modules: {},
});
