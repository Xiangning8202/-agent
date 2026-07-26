import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("shell contains the product brand and accessible app mount", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /创意智造台/);
  assert.match(html, /id="app"/);
  assert.match(html, /lang="zh-CN"/);
});

test("build script creates the Sites worker entrypoint", async () => {
  const buildScript = await readFile(new URL("../scripts/build.mjs", import.meta.url), "utf8");
  assert.match(buildScript, /dist, "server", "index\.js"/);
  assert.match(buildScript, /export default/);
});
