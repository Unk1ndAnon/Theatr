import {
  MEDIA,
  WINDOW,
  trending,
  discover,
  multi,
  movies_now_playing,
} from "../../api/tmdb";
require("../../api/trakt");

const swiperDefaults = {
  loop: false,
  lazy: true,
  spaceBetween: 4,
  slidesOffsetBefore: 16,
  slidesOffsetAfter: 16,
  watchSlidesVisibility: true,
  breakpoints: {
    320: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },
    480: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    },
    640: {
      slidesPerView: 4,
      slidesPerGroup: 4,
    },
    1280: {
      slidesPerView: 5,
      slidesPerGroup: 5,
    },
  },
};

// Section Configuration
export default {
  billboard: {
    promise: trending(WINDOW.Week),
  },

  loms: [
    {
      listName: "New Movies",
      promise: discover(MEDIA.Movie, {}),
      swiperOptions: swiperDefaults,
    },
  ],
};
