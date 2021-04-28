import { axios, cache } from "../axios";

const _api = axios.create({
  adapter: cache.adapter,
  baseURL: "https://api.tmdb.org/3/",
  timeout: 5000,
  params: {
    api_key: "205c5906f1be7842b0bf97875e23f54c",
    language: "en",
  },
});

// Media types
const MEDIA = {
  All: "all",
  Movie: "movie",
  Show: "tv",
  Person: "person",
};

const WINDOW = {
  Day: "day",
  Week: "week",
};

const SEARCH = {
  Multi: "multi",
  Movie: "movie",
  Shows: "tv",
};

function getEpisodes(
  id,
  season_number,
  episode_number,
  params = {}
) {
  return _api.get(`/tv/${id}/season/${season_number}${episode_number ? `/episode/${episode_number}` : ""}`, { params: params });
}

function getDetails(
  id,
  media_type = MEDIA.Movie,
  params = {
    'append_to_response': "images,videos,release_dates",
  }
) {
  return _api.get(`/${media_type}/${id}`, { params: params });
}

function discover(
  media_type = MEDIA.Movie,
  params = {
    primary_release_year: 2021,
  }
) {
  return _api.get(`/discover/${media_type}`, { params: params });
}

function trending(time_window = WINDOW.Week, params = {}) {
  return _api.get(`/trending/all/${time_window}`, { params: params });
}

function search(
  query,
  search = SEARCH.Multi,
  params = {
    query: query,
  }
) {
  return _api.get(`/search/${search}`, { params: params });
}

export { MEDIA, WINDOW, SEARCH, getEpisodes, getDetails, discover, trending, search };
