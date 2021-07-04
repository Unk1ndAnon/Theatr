import { axios, cache } from "./axios";

const _api = axios.create({
  adapter: cache.adapter,
  baseURL: "https://www.youtube.com",
  timeout: 15000,
  params: {
    hl: "en",
    gl: "US",
  },
  headers: {
    "User-Agent": "PostmanRuntime/7.28.0",
  },
});

export function get_video_info(id) {
  return _api.get("get_video_info", {
    params: {
      video_id: id,
      el: "embedded",
      html5: "1",
      eurl: `https://youtube.googleapis.com/v/${id}`,
      sts: "",
      c: "TVHTML5",
      cver: "6.20180913",
    },
    transformResponse: (r) => {
      return rockCrusher(r);
    },
  });
}

function rockCrusher(string) {
  const player_response = string.match(/player_response=(.*%7D)/)[1];
  if (player_response) {
    return JSON.parse(decodeURIComponent(player_response));
  }

  return null;
}
