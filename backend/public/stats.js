import { init } from "/vendor/plausible.js";

// Plausible analytics via the official npm tracker (@plausible-analytics/tracker).
// server.js serves /vendor/plausible.js straight from node_modules.
init({
  domain: "fizika.schmelczer.dev",
  endpoint: "https://stats.schmelczer.dev/status",
  autoCapturePageviews: true,
  outboundLinks: true,
  fileDownloads: true,
  hashBasedRouting: true,
});
