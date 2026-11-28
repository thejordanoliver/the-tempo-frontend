import assert from "node:assert/strict";
import test from "node:test";
import type { PlayerResult, TeamResult, UserResult } from "../types/explore";
import { getExploreRouteForResult } from "../utils/navigation/exploreNavigation";
import {
  canSearchExploreQuery,
  getExploreResultIdentity,
  normalizeExploreSearchQuery,
  parseRecentExploreSearches,
} from "../utils/explore/exploreSearch";

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

test("sports recent-search identity includes league", () => {
  const nflPlayer: PlayerResult = {
    ...ranking,
    id: 4430841,
    team_id: 1,
    full_name: "Carson Beck",
    headshot_url: null,
    nickname: null,
    association_name: null,
    league: "nfl",
    sport: "football",
    team: null,
    position: "QB",
    type: "player",
  };
  const cfbPlayer: PlayerResult = {
    ...nflPlayer,
    league: "cfb",
  };

  assert.equal(getExploreResultIdentity(nflPlayer), "player:nfl:4430841");
  assert.equal(getExploreResultIdentity(cfbPlayer), "player:cfb:4430841");
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
  assert.deepEqual(getExploreRouteForResult(user), {
    pathname: "/(tabs)/(explore)/user/[id]",
    params: { id: "42", username: "tempo", fullName: "Tempo Fan" },
  });
});

test("routes G League team search results through the basketball screen", () => {
  const team: TeamResult = {
    ...ranking,
    id: 2,
    name: "Austin Spurs",
    shortName: "Spurs",
    league: "gleague",
    sport: "basketball",
    type: "team",
  };

  assert.equal(getExploreResultIdentity(team), "team:gleague:2");
  assert.deepEqual(getExploreRouteForResult(team), {
    pathname: "/(tabs)/(explore)/team/[sport]/[teamId]",
    params: { sport: "basketball", teamId: "2", league: "gleague" },
  });
});

test("routes players without legacy flags through the Explore stack", () => {
  const player: PlayerResult = {
    ...ranking,
    id: 23,
    team_id: 7,
    full_name: "Test Player",
    headshot_url: null,
    nickname: null,
    association_name: null,
    league: "nba",
    sport: "basketball",
    team: null,
    position: "G",
    type: "player",
  };

  assert.deepEqual(getExploreRouteForResult(player), {
    pathname: "/(tabs)/(explore)/player/[sport]/[id]",
    params: {
      sport: "basketball",
      id: "23",
      teamId: "7",
      league: "nba",
    },
  });
});

test("team routes use backend sport and league without flags or catalog lookups", () => {
  for (const [league, sport] of [
    ["nba", "basketball"],
    ["wnba", "basketball"],
    ["nfl", "football"],
    ["mlb", "baseball"],
    ["epl", "soccer"],
    ["msoc", "soccer"],
    ["wsoc", "soccer"],
  ] as const) {
    const team: TeamResult = {
      ...ranking,
      id: 999999,
      name: "New Team",
      shortName: "New",
      type: "team",
      league,
      sport,
    };
    assert.deepEqual(getExploreRouteForResult(team), {
      pathname: "/(tabs)/(explore)/team/[sport]/[teamId]",
      params: {
        teamId: "999999",
        league,
        sport,
      },
    });
  }
});

test("recent search migration preserves leagues and removes legacy sports flags", () => {
  const migrated = parseRecentExploreSearches(
    JSON.stringify([
      {
        ...ranking,
        id: 57,
        type: "team",
        name: "Florida",
        short_name: "Florida",
        full_name: "Florida Gators",
        affiliation: "mcbb",
        league: null,
        isMCBB: true,
      },
      {
        ...ranking,
        id: 20499,
        type: "team",
        name: "Florida",
        shortName: "Florida",
        affiliation: "soccer",
        league: "wsoc",
        isSOCC: true,
      },
      { ...ranking, id: 42, type: "player", affiliation: "nfl", team_id: 57 },
      { id: null, type: "team", affiliation: "nfl" },
    ]),
  );
  assert.equal(migrated.length, 3);
  assert.deepEqual(migrated.map(getExploreResultIdentity), [
    "team:mcbb:57",
    "team:soccer:20499",
    "player:nfl:42",
  ]);
  assert.equal(
    migrated[0].type === "team" && migrated[0].fullName,
    "Florida Gators",
  );
  for (const item of migrated) {
    assert.equal("affiliation" in item, false);
    assert.equal("isMCBB" in item || "isSOCC" in item, false);
  }
  assert.deepEqual(parseRecentExploreSearches("invalid json"), []);
  assert.deepEqual(parseRecentExploreSearches("{}"), []);
});

test("soccer history stays deduplicated when a legacy result gains a specific league", () => {
  const team: TeamResult = {
    ...ranking,
    id: 20499,
    name: "Florida",
    shortName: "Florida",
    type: "team",
    league: "soccer",
    sport: "soccer",
  };
  assert.equal(
    getExploreResultIdentity(team),
    getExploreResultIdentity({ ...team, league: "wsoc" }),
  );
});
