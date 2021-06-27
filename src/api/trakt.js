/*import store from "../store";
import { axios, cache } from "./axios";

const TraktTV = require("trakt.tv");

const Trakt = new TraktTV({
  client_id: "abd8388ef21f4471d28de0c6b7006499815a4c0916232ee094d55b388c0ae640",
  client_secret:
    "a2ce6a4e52fa3287f31dabdfe62a6038a402e7df3f05f2fe5e41cdd64ea75a64",
  pagination: true,
  redirect_uri: "http://localhost:8437/trakt/authorize",
});

export class AuthenticationServer {
  _http = require("http");
  _server = null;
  _port = 8437;

  constructor(cb) {
    this._server = this._http.createServer(cb);
  }

  start() {
    this._server.listen(this._port);
  }

  close() {
    this._server.close();
  }
}

export function isAuthenticated() {
  return store.state.trakt.authCode ? true : false;
}

export function TraktAPI(func, args = {}) {
  switch (func) {
    case "sync.history.get":
      return isAuthenticated() ? Trakt.sync.history.get(args) : null;
    case "sync.playback.get":
      return isAuthenticated() ? Trakt.sync.playback.get(args) : null;
    case "recommendations.movies.get":
      return isAuthenticated() ? Trakt.recommendations.movies.get(args) : null;
    case "recommendations.shows.get":
      return isAuthenticated() ? Trakt.recommendations.shows.get(args) : null;

    default:
      return null;
  }
}

export default Trakt;
*/