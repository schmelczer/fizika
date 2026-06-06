import { init } from "./vendored.js";

init({
  domain: "fizika.schmelczer.dev",
  endpoint: "https://stats.schmelczer.dev/status",
  autoCapturePageviews: true,
  outboundLinks: true,
  fileDownloads: true,
  hashBasedRouting: true,
});
