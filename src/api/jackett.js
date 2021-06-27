import { axios, cache } from "./axios";

const _api = axios.create({
  adapter: cache.adapter,
  baseURL: "https://torrents.theatr.tv/api/v2.0/",
  timeout: 15000, // 15s
  params: {
    apikey: "y0nahd91fc4ghg0g6sc6xr0rrp550n6f",
  },
});

export function search(
  query,
  ep = "",
  season = "",
  params = {
    t: "search",
    ep: ep,
    season: season,
    q: query,
  }
) {
  return _api.get("/indexers/all/results/torznab", {
    params: params,
  });
}
