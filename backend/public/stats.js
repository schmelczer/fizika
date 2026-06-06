import { init } from "/vendor/vendored.js";

// Plausible analytics via the official npm tracker (@plausible-analytics/tracker).
// server.js serves /vendor/vendored.js straight from node_modules.
init({
  domain: "fizika.schmelczer.dev",
  endpoint: "https://stats.schmelczer.dev/status",
  autoCapturePageviews: true,
  outboundLinks: true,
  fileDownloads: true,
  hashBasedRouting: true,
});
