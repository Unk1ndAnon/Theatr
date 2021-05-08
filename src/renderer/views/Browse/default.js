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
}


// Section Configuration
export default {
  billboard: {
    promise: trending(WINDOW.Week),
  },

  loms: [
    {
      listName: "New Releases",
      promise: discover(MEDIA.Movie, {}),
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Shows to Consider",
      promise: discover(MEDIA.Show),
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Top-Rated Anime",
      promise: discover(MEDIA.Show, {
        with_genre: 16,
        with_origin_country: "JP",
        "air_date.gte": "2020-04-28",
        "air_date.lte": "2021-04-28",
        "vote_count.gte": 100,
      }),
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Continue Watching",
      cardOrientation: "7x10",
      promise: movies_now_playing({
        transformResponse: (r) => {
          var results = r.results;
          results = results.splice(0, 2);
          var response = r;
          response.results = results;
          return response;
        },
      }),
      swiperOptions: swiperDefaults,
    },
  ],
};
