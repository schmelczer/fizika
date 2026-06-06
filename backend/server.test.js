const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Point the server at a throwaway data dir before importing it, so tests never
// touch real question data.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "fizika-test-"));
const dataPath = path.join(tmpDir, "fizika.json");
const picsPath = path.join(tmpDir, "pics");
fs.mkdirSync(picsPath, { recursive: true });

process.env.DATA_PATH = dataPath;
process.env.PICS_PATH = picsPath;

const { app, isUnsafeFilename } = require("./server");

const seedQuestions = [
  {
    id: 1,
    source: "2016/m1/1",
    description: "q1",
    a: "a",
    b: "b",
    c: "c",
    d: "d",
    correct: 1,
    type: "mk",
    image: null,
  },
  {
    id: 2,
    source: "2016/m1/2",
    description: "q2",
    a: "a",
    b: "b",
    c: "c",
    d: "d",
    correct: 2,
    type: "md",
    image: null,
  },
];

let server;
let baseUrl;

const api = (route, options) => fetch(`${baseUrl}${route}`, options);
const sendJson = (route, method, body) =>
  api(route, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

beforeEach(() => {
  fs.writeFileSync(dataPath, JSON.stringify(seedQuestions, null, 2));
});

test("GET /api/fizika returns every question", async () => {
  const res = await api("/api/fizika");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.length, 2);
});

test("POST creates a question with an incremented id", async () => {
  const res = await sendJson("/api/admin/questions", "POST", {
    source: "2020/1/1",
    description: "new",
    a: "a",
    b: "b",
    c: "c",
    d: "d",
    correct: 3,
    type: "h",
    image: null,
  });
  assert.equal(res.status, 201);
  const created = await res.json();
  assert.equal(created.id, 3);

  const all = await (await api("/api/fizika")).json();
  assert.equal(all.length, 3);
});

test("PUT updates an existing question", async () => {
  const res = await sendJson("/api/admin/questions/1", "PUT", {
    description: "updated",
  });
  assert.equal(res.status, 200);
  const updated = await res.json();
  assert.equal(updated.description, "updated");
  // unchanged fields are preserved
  assert.equal(updated.source, "2016/m1/1");
});

test("PUT returns 404 for a missing question", async () => {
  const res = await sendJson("/api/admin/questions/999", "PUT", { a: "x" });
  assert.equal(res.status, 404);
});

test("DELETE removes a question", async () => {
  const res = await api("/api/admin/questions/1", { method: "DELETE" });
  assert.equal(res.status, 200);
  const all = await (await api("/api/fizika")).json();
  assert.equal(all.length, 1);
  assert.equal(all[0].id, 2);
});

test("DELETE returns 404 for a missing question", async () => {
  const res = await api("/api/admin/questions/999", { method: "DELETE" });
  assert.equal(res.status, 404);
});

test("DELETE image rejects an unsafe filename", async () => {
  // Percent-encoded so the path survives client-side URL normalization and
  // reaches the route with a separator the guard must reject.
  const res = await api(`/api/admin/images/${encodeURIComponent("a\\b")}`, {
    method: "DELETE",
  });
  assert.equal(res.status, 400);
});

test("DELETE image returns 404 for a missing but valid filename", async () => {
  const res = await api("/api/admin/images/nope.png", { method: "DELETE" });
  assert.equal(res.status, 404);
});

test("unknown routes return 404 JSON", async () => {
  const res = await api("/api/does-not-exist");
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.error, "Not found");
});

test("isUnsafeFilename blocks traversal but allows plain names", () => {
  for (const bad of ["../etc", "a/b", "a\\b", "..", ".", "/abs.png", ""]) {
    assert.equal(isUnsafeFilename(bad), true, `${bad} should be unsafe`);
  }
  for (const ok of ["pic.png", "image_1.jpg", "2016-m1-1.png"]) {
    assert.equal(isUnsafeFilename(ok), false, `${ok} should be safe`);
  }
});
