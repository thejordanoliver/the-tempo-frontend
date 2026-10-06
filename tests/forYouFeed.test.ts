import test from "node:test";
import assert from "node:assert/strict";
import { interleavePredictions } from "../utils/forYouFeed";

test("spaces predictions without changing news and post ordering", () => {
  const content = Array.from({ length: 15 }, (_, i) => `content-${i}`);
  const result = interleavePredictions(content, ["pick-1", "pick-2", "pick-3", "pick-4"]);
  assert.deepEqual(result.filter(item => item.startsWith("content")), content);
  assert.equal(result[1], "pick-1");
  assert.equal(result[8], "pick-2");
  assert.equal(result[15], "pick-3");
  assert.equal(result.includes("pick-4"), false);
});

test("supports prediction-only and short feeds", () => {
  assert.deepEqual(interleavePredictions([], ["pick"]), ["pick"]);
  assert.deepEqual(interleavePredictions(["news"], ["pick-1", "pick-2"]), ["news", "pick-1", "pick-2"]);
  assert.deepEqual(interleavePredictions(["news"], []), ["news"]);
});
