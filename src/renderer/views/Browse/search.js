import { search } from "../../api/tmdb";

const swiperDefaults = {
  lazy: true,
  spaceBetween: 10,
  slidesPerColumn: Number.MAX_SAFE_INTEGER,
  slidesPerColumnFill: "row",
  watchSlidesVisibility: true,
  breakpoints: {
    320: {
      slidesPerView: 3,
    },
    640: {
      slidesPerView: 6,
    },
  },
};

export default {
  loms: [
    {
      cardOrientation: "7x10",
      swiperOptions: swiperDefaults,
    },
  ],
};
