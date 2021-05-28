import {
  MEDIA,
  WINDOW,
  trending,
  discover,
  multi,
  movies_now_playing,
  stringToTMDB,
} from "../../api/tmdb";
import Trakt, { TraktAPI } from "../../api/trakt";
import store from "../../store";

const swiperDefaults = {
  loop: false,
  lazy: true,
  allowTouchMove: false,
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
    1440: {
      slidesPerView: 6,
      slidesPerGroup: 6,
    },
    1920: {
      slidesPerView: 7,
      slidesPerGroup: 7,
      spaceBetween: 8,
    },
    2560: {
      slidesPerView: 8,
      slidesPerGroup: 8,
      spaceBetween: 8,
    },
  },
};

// Section Configuration
const sectionConfig = {
  billboard: {
    request: [
      {
        connector: "tmdb",
        function: "trending",
        args: [WINDOW.Week],
      },
    ],
  },

  loms: [
    {
      listName: "New Releases",
      config: {
        popover: true,
      },
      request: [
        {
          connector: "tmdb",
          function: "discover",
          args: [MEDIA.Movie],
        },
      ],
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Shows to Consider",
      request: [
        {
          connector: "tmdb",
          function: "discover",
          args: [
            MEDIA.Show
          ]
        }
      ],
      swiperOptions: swiperDefaults,
    },
    {
      listName: "test",
      request: [
        {
          connector: "tmdb",
          function: "multi",
          args: [
            {function: "discover"},
            {function: "discover", args: [MEDIA.Show]}
          ]
        },
      ],
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Top-Rated Anime",
      request: [
        {
          connector: "tmdb",
          function: "discover",
          args: [
            MEDIA.Show,
            {
              params: {
                with_genre: 16,
                with_origin_country: "JP",
                "air_date.gte": "2020-04-28",
                "air_date.lte": "2021-04-28",
                "vote_count.gte": 100,
              },
            },
          ],
        },
      ],
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Continue Watching",
      request: [
        {
          connector: "trakt",
          function: "sync.playback.get",
        },
      ],
      config: {
        showProgressbar: true,
        cardOrientation: "7x10",
      },
      swiperOptions: swiperDefaults,
    },
    /*{
      listName: "Continue Watching",
      //call: TraktAPI("sync.history.get"),
      config: {
        showProgressBar: true,
        cardOrientation: "7x10",
      },
      swiperOptions: swiperDefaults,
    },*/
  ],
};

export default sectionConfig;
