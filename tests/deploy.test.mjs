import test from "node:test";
import assert from "node:assert/strict";

test("deployment worker serves the app shell and module assets", async () => {
  const { default: worker } = await import("../dist/server/index.js");

  const page = await worker.fetch(new Request("https://example.test/"));
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-type"), /text\/html/);
  assert.match(await page.text(), /id="app"/);

  const module = await worker.fetch(new Request("https://example.test/src/app.mjs"));
  assert.equal(module.status, 200);
  assert.match(module.headers.get("content-type"), /text\/javascript/);
  assert.match(await module.text(), /function render/);

  const icon = await worker.fetch(new Request("https://example.test/src/assets/icons/image.svg"));
  assert.equal(icon.status, 200);
  assert.match(icon.headers.get("content-type"), /image\/svg\+xml/);
  assert.match(await icon.text(), /^<svg[\s>]/);

  const knowledge = await worker.fetch(new Request("https://example.test/src/knowledge-base/data/common-assets.json"));
  assert.equal(knowledge.status, 200);
  assert.match(knowledge.headers.get("content-type"), /application\/json/);
  const knowledgeData = await knowledge.json();
  assert.ok(Array.isArray(knowledgeData.assets));
  assert.ok(knowledgeData.assets.length > 0);
});
