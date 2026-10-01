import assert from "node:assert/strict";
import test from "node:test";
import { getUserProfileCountParams, parseProfileCountParam } from "../utils/userProfileCounts";
import { getExploreRouteForResult } from "../utils/exploreNavigation";

test("profile count params preserve known counts, including zero", () => {
  assert.deepEqual(getUserProfileCountParams({ followers_count: 24, following_count: 0 }), {
    followers: "24", following: "0",
  });
});

test("missing or invalid source counts are omitted independently", () => {
  assert.deepEqual(getUserProfileCountParams({}), {});
  assert.deepEqual(getUserProfileCountParams({ followers_count: -1, following_count: NaN }), {});
  assert.deepEqual(getUserProfileCountParams({ followers_count: 3 }), { followers: "3" });
});

test("profile route counts normalize arrays and reject invalid values", () => {
  assert.equal(parseProfileCountParam(["42", "99"]), 42);
  assert.equal(parseProfileCountParam("0"), 0);
  for (const value of [undefined, [], "", " ", "NaN", "Infinity", "-1", "1.5", "9007199254740992"]) {
    assert.equal(parseProfileCountParam(value), undefined);
  }
});

test("Explore navigation supplies immediate username and known profile counts", () => {
  assert.deepEqual(getExploreRouteForResult({
    type: "user", id: 42, username: "tempo", full_name: null, profileImageUrl: null,
    matchClass: 4, textScore: 1, score: 1, followers_count: 24, following_count: 8,
  }), {
    pathname: "/(tabs)/(explore)/user/[id]",
    params: { id: "42", username: "tempo", followers: "24", following: "8" },
  });
});
