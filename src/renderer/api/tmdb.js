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
  var promises = [];

  switch (name) {
    case "multi":
      args.forEach((req) => {
        promises.push(stringToTMDB(req.function, req.args));
      });
      break;

    case "search":
      promises.push(search(...args));
      console.log(promises[0]);
      break;

    case "getEpisodes":
      promises.push(getEpisodes(...args));
      break;

    case "getDetails":
      promises.push(getDetails(...args));
      break;

    case "discover":
      promises.push(discover(...args));
      break;

    case "trending":
      promises.push(trending(...args));
      break;

    default:
      return null;
  }
  return promises.length > 1 ? multi(promises) : promises[0];
}

export function multi(promises) {
  return axios.all(promises);
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
  return _api.get(`/discover/${media_type}`, options);
}

export function trending(time_window = WINDOW.Week, options = {}) {
  return _api.get(`/trending/all/${time_window}`, options);
}

export function search(query, search = SEARCH.Multi, options = {}) {
  console.log("Searching", query);
  return _api.get(`/search/${search}`, {
    params: { query: query },
    ...options,
  });
}
