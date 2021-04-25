import { createRouter, createWebHistory } from "vue-router";
import Browse from "../views/Browse/Browse.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: "/browse"
  },
  {
    path: "/browse",
    name: "Browse",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Browse,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
