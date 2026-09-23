import assert from "node:assert/strict";
import test from "node:test";
import type { PlayerResult, TeamResult, UserResult } from "../types/explore";
import { getExploreRouteForResult } from "../utils/exploreNavigation";
import {
  canSearchExploreQuery,
  getExploreResultIdentity,
  normalizeExploreSearchQuery,
} from "../utils/exploreSearch";

const ranking = {
  matchClass: 4 as const,
  textScore: 1,
  score: 1,
};

test("normalizes whitespace before validating Explore queries", () => {
  assert.equal(
    normalizeExploreSearchQuery("  Patrick   Mahomes  "),
    "Patrick Mahomes",
  );
});

test("does not allow one-character Explore network queries", () => {
  assert.equal(canSearchExploreQuery(""), false);
  assert.equal(canSearchExploreQuery(" a "), false);
  assert.equal(canSearchExploreQuery("ca"), true);
  assert.equal(canSearchExploreQuery("x".repeat(81)), false);
});

test("sports recent-search identity includes affiliation", () => {
  const nflPlayer: PlayerResult = {
    ...ranking,
    id: 4430841,
    team_id: 1,
    full_name: "Carson Beck",
    headshot_url: null,
    nickname: null,
    association_name: null,
    affiliation: "nfl",
    position: "QB",
    type: "player",
  };
  const cfbPlayer: PlayerResult = {
    ...nflPlayer,
    affiliation: "cfb",
  };

  assert.equal(
    getExploreResultIdentity(nflPlayer),
    "player:nfl:4430841",
  );
  assert.equal(
    getExploreResultIdentity(cfbPlayer),
    "player:cfb:4430841",
  );
  assert.notEqual(
    getExploreResultIdentity(nflPlayer),
    getExploreResultIdentity(cfbPlayer),
  );
});

test("user recent-search identity remains globally keyed by user id", () => {
  const user: UserResult = {
    ...ranking,
    id: 42,
    full_name: "Tempo Fan",
    username: "tempo",
    profileImageUrl: null,
    type: "user",
  };

  assert.equal(getExploreResultIdentity(user), "user:42");
});

test("routes G League team search results to the G League team screen", () => {
  const team: TeamResult = {
    ...ranking,
    id: 2,
    name: "Austin Spurs",
    short_name: "Spurs",
    affiliation: "gleague",
    isGLEAGUE: true,
    type: "team",
  };

  assert.equal(getExploreResultIdentity(team), "team:gleague:2");
  assert.equal(getExploreRouteForResult(team), "/team/gleague/2");
});
