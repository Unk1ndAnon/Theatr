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
      listName: "Recommendations",
      request: [
        {
          connector: "trakt",
          function: "recommendations.movies.get",
        },
        {
          connector: "trakt",
          function: "recommendations.shows.get",
        }
      ],
      config: {
        popover: true,
      },
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Now Playing",
      config: {
        popover: true,
      },
      request: [
        {
          connector: "tmdb",
          function: "movies_now_playing",
        },
        {
          connector: "tmdb",
          function: "on_the_air",
        }
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
      },
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Movies to Consider",
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
          args: [MEDIA.Show],
        },
      ],
      swiperOptions: swiperDefaults,
    },
    {
      listName: "Top-Rated Anime1",
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
      listName: "Top-Rated Anime2",
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
      listName: "Top-Rated Anime3",
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
      listName: "Top-Rated Anime4",
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
      listName: "Top-Rated Anime5",
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
      listName: "Top-Rated Anime6",
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
      listName: "Top-Rated Anime7",
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
