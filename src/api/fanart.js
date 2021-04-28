import { axios, cache } from "../axios";

const _api = axios.create({
  adapter: cache.adapter,
  baseURL: "https://webservice.fanart.tv/v3",
  params: {
    api_key: "2709d6aefbf223fdce9c6d44ae1706c4",
  },
});

function getFanArt(id, params) {
  return _api.get(`/movies/${id}`, { params: params });
}

export { getFanArt }
