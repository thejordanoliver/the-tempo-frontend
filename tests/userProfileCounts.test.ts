import { getUserProfileParams } from "../utils/userProfileNavigation";
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

test("profile links preserve every available preview field and known false follow status", () => {
  assert.deepEqual(getUserProfileParams(7, {
    username: "fan", full_name: "Tempo Fan", bio: "",
    profile_image: "https://images.test/avatar", banner_image: "https://images.test/banner",
    followers_count: 0, following_count: 8, isFollowing: false,
  }), {
    id: "7", username: "fan", fullName: "Tempo Fan", bio: "",
    profileImage: "https://images.test/avatar", bannerImage: "https://images.test/banner",
    followers: "0", following: "8", isFollowing: "false",
  });
});

test("unknown follow status and absent profile fields are omitted rather than guessed", () => {
  assert.deepEqual(getUserProfileParams("7", {
    full_name: null, profileImageUrl: null, isFollowing: null,
  }), { id: "7" });
});
