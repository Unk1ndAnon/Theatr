import { axios, cache } from "./axios";
const { JSDOM } = require("jsdom");

const _api = axios.create({
  adapter: cache.adapter,
  baseURL: "https://webservice.fanart.tv/v3",
  timeout: 8000,
  params: {
    api_key: "2709d6aefbf223fdce9c6d44ae1706c4",
  },
});

export function scrapeIDs(query, sect) {
  return axios.get(`https://fanart.tv/`, {
    adapter: cache.adapter,
    timeout: 5000,
    params: {
      s: query,
      sect: sect,
    },
    transformResponse: (r) => {
      const dom = new JSDOM(r);
      const search_results = dom.window.document.querySelector(
        "div.search_results"
      );
      const section = search_results
        .getElementsByTagName("h2")[0]
        .innerHTML.split(" ")[0];
      const links = search_results.getElementsByTagName("a");
      const list = [];

      for (let link of links) {
        const regex =
          section == "Movie"
            ? link.innerHTML.match(/(.+) \(([\d-]+)\) <s.*>(\d+) I.*/)
            : link.innerHTML.match(/(.+) <s.*>(\d+) I.*/);

        list.push({
          id: link.getAttribute("href").split("/")[2],
          title: regex[1],
          year: section == "Movie" ? regex[2] : null,
          imagecount: regex[section == "Movie" ? 3 : 2],
        });
      }

      return JSON.stringify(list);
    },
  });
}

export function getFanArt(imdb_id, media_type = "movies", params) {
  return _api.get(
    `/${media_type == "movie" ? "movies" : media_type}/${imdb_id}`,
    { params: params }
  );
}
