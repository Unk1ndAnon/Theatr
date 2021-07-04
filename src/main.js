import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const ErrorReporting = false;

const isDevelopment = true;
const release = "0.0.1-dev";

/**
 * Initialize Sentry
 */
import * as Sentry from "@sentry/browser";
import * as Tracing from "@sentry/tracing";
import { Offline, Dedupe } from "@sentry/integrations";

if (ErrorReporting) {
  let integrations = [
    new Offline({ maxStoredEvents: 50 }), // offline storage of events
    new Tracing.Integrations.BrowserTracing(), // tracing
    new Dedupe({}), // "deduplicate" errors
  ];

  Sentry.init({
    dsn: "https://5c8df48c36b54dcabe06e7072c710503@o830530.ingest.sentry.io/5835459",
    debug: isDevelopment, // print Sentry debug info
    release,
    environment: isDevelopment ? "staging" : "production",
    sampleRate: 1.0,
    tracesSampleRate: 1.0,
    maxBreadcrumbs: 20,
    attachStacktrace: true,
    autoSessionTracking: true,
    integrations,
  });
}

// Create App
createApp(App).use(store).use(router).mount("#app");
