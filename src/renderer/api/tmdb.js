import { axios, cache } from "./axios";

const _api = axios.create({
  adapter: cache.adapter,
  baseURL: "https://api.tmdb.org/3/",
  timeout: 8000,
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

export function multi(...promise) {
  return axios.all([...promise]);
}

export function getEpisodes(id, season_number, episode_number, params = {}) {
  return _api.get(
    `/tv/${id}/season/${season_number}${
      episode_number ? `/episode/${episode_number}` : ""
    }`,
    { params: params }
  );
}

export function getDetails(
  id,
  media_type = MEDIA.Movie,
  params = {},
  data = {}
) {
  return _api.get(`/${media_type}/${id}`, { params: params, data: data });
}

export function movies_now_playing(params = {}, data = {}) {
  return _api.get(`/movie/now_playing`, { params: params, data: data });
}

export function discover(media_type = MEDIA.Movie, params = {}, data = {}) {
  return _api.get(`/discover/${media_type}`, { params: params, data: data });
}

export function trending(time_window = WINDOW.Week, params = {}) {
  return _api.get(`/trending/all/${time_window}`, { params: params });
}

export function search(
  query,
  search = SEARCH.Multi,
  params = {
    query: query,
  }
) {
  return _api.get(`/search/${search}`, { params: params });
}
