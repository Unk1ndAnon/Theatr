import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";

import Browse from "../views/Browse/Browse.vue";
import Search from "../views/Search";
import Watch from "../views/Watch";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: "/browse",
  },
  {
    path: "/browse/:section?",
    name: "Browse",
    component: Browse,
    params: true,
  },
  {
    path: "/search/:searchTerm?",
    name: "Search",
    component: Search,
    params: true,
  },
  {
    path: "/watch/:mi",
    name: "Watch",
    component: Watch,
    props: true,
  },
];

const router = createRouter({
  history: process.env.IS_ELECTRON
    ? createWebHashHistory(process.env.BASE_URL)
    : createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
