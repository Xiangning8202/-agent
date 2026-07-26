import test from "node:test";
import assert from "node:assert/strict";
import { canView, getState, resetState, saveDraft, setRole } from "../src/state.mjs";

test("partner can only view partner routes", () => {
  assert.equal(canView("partner-assets", "partner"), true);
  assert.equal(canView("tasks", "partner"), false);
});

test("saving a draft updates Agent context only on explicit save", () => {
  resetState();
  assert.equal(getState().drafts.image, undefined);
  const draft = saveDraft("image", { headline: "新的主文案" });
  assert.equal(draft.headline, "新的主文案");
  assert.equal(getState().drafts.image.headline, "新的主文案");
});

test("role switch resets to a permitted route", () => {
  resetState();
  setRole("partner");
  assert.equal(getState().route, "partner-assets");
});
