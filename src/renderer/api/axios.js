import localforage from "localforage";
import memoryDriver from "localforage-memoryStorageDriver";
import { setupCache } from "axios-cache-adapter";

localforage.defineDriver(memoryDriver);

// Create `localforage` instance
const forageStore = localforage.createInstance({
  // List of drivers used
  driver: [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE,
    memoryDriver._driver,
  ],
  // Prefix all storage keys to prevent conflicts
  name: "defaultCache",
});

// Create `axios-cache-adapter` instance
const cache = setupCache({
  store: forageStore,
  maxAge: 120 * 60 * 1000, // 120 minutes
  exclude: {
    query: false,
    methods: [""], // Cache all HTTP methods
  },
});

const axios = require("axios");

const CancelToken = axios.CancelToken;

export { CancelToken, axios, cache };
