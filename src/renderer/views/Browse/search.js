import { search } from "../../api/tmdb";

const swiperDefaults = {
  lazy: true,
  allowTouchMove: false,
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
    1280: {
      slidesPerView: 8,
    }
  },
};

export default {
  loms: [
    {
      config: {
        cardOrientation: "7x10",
      },
      swiperOptions: swiperDefaults,
    },
  ],
};
