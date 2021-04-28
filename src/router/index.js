import { createRouter, createWebHistory } from "vue-router";
import Browse from "../views/Browse";
import Watch from "../views/Watch";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: "/browse",
  },
  {
    path: "/browse",
    name: "Browse",
    component: Browse,
  },
  {
    path: "/watch/:mi",
    name: "Watch",
    component: Watch,
    props: true,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
