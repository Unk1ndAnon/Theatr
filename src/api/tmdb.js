import { axios, cache } from "./axios";

const _api = axios.create({
  adapter: cache.adapter,
  baseURL: "https://api.tmdb.org/3/",
  timeout: 15000,
  params: {
    api_key: "205c5906f1be7842b0bf97875e23f54c",
    language: "en",
  },
});

// Media types
export const MEDIA = {
  All: "all",
  Movie: "movie",
  Show: "tv",
  Person: "person",
};

export const WINDOW = {
  Day: "day",
  Week: "week",
};

export const SEARCH = {
  Multi: "multi",
  Movie: "movie",
  Shows: "tv",
};

export function stringToTMDB(name, args = []) {
  var promise = null;

  switch (name) {
    case "search":
      return search(...args);

    case "discover":
      return discover(...args);

    case "movies_now_playing":
      return movies_now_playing(...args);

    case "on_the_air":
      return on_the_air(...args);

    case "trending":
      return trending(...args);

    default:
      return null;
  }
}

export function getEpisodes(id, season_number, episode_number, options) {
  return _api.get(
    `/tv/${id}/season/${season_number}${
      episode_number ? `/episode/${episode_number}` : ""
    }`,
    options
  );
}

export function getDetails(id, media_type = MEDIA.Movie, options = {}) {
  return _api.get(`/${media_type}/${id}`, options);
}

export function movies_now_playing(options = {}) {
  return _api.get(`/movie/now_playing`, options);
}

export function discover(media_type = MEDIA.Movie, options = {}) {
  return _api.get(`/discover/${media_type}`, {
    params: Object.assign(options.params || { without_genres: 10763 }), // 10763 = news
    ...options
  });
}

export function trending(time_window = WINDOW.Week, options = {}) {
  return _api.get(`/trending/all/${time_window}`, options);
}

/*
 *  TV
 */
export function on_the_air(options = {}) {
  return _api.get("/tv/on_the_air", options);
}

export function search(query, search = SEARCH.Multi, options = {}) {
  return _api.get(`/search/${search}`, {
    params: Object.assign(options.params || {}, { query: query }),
    ...options
  });
}

export function similar(id, media_type = MEDIA.Movie, options = {}) {
  return _api.get(`/${media_type}/${id}/similar`, {
    params: Object.assign(options.params || {}),
    ...options
  });
}
