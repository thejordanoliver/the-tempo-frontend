import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { normalizeFavoriteTeamKeys } from "../types/favorites";
import type {
  VolleyballDirectoryTeam,
  VolleyballGame,
  VolleyballStandingsGroup,
} from "../types/volleyball/volleyball";
import { getExploreResultIdentity } from "../utils/explore/exploreSearch";
import { getExploreRouteForResult } from "../utils/navigation/exploreNavigation";
import { scopeHrefToTab } from "../utils/navigation/tabStackNavigation";
import { LEAGUE_TABS, TEAM_TABS } from "../utils/navigation/tabs";
import {
  isVolleyballLeague,
  volleyballDirectoryTeam,
  volleyballStandingGroups,
  volleyballStatus,
} from "../utils/volleyball";
import { getVolleyballGameParams, getVolleyballGameRoute } from "../utils/navigation/volleyballGame";

test("volleyball favorites retain gender and league when school IDs overlap", () => {
  assert.deepEqual(
    normalizeFavoriteTeamKeys(["MCVB:221", "WCVB:221", "mcvb:221"]),
    ["mcvb:221", "wcvb:221"],
  );
  assert.equal(isVolleyballLeague("mcvb"), true);
  assert.equal(isVolleyballLeague("wcvb"), true);
  assert.equal(isVolleyballLeague("nba"), false);
});

test("backend directory fields become eligible team choices with both logo variants", () => {
  const row: VolleyballDirectoryTeam = {
    id: 221,
    name: "Pittsburgh Panthers",
    shortName: "Pitt",
    code: "PITT",
    primaryColor: "#003594",
    secondaryColor: null,
    logo: "light.png",
    logoDark: "dark.png",
    isActive: true,
    isNational: false,
    isAllStar: false,
  };
  const team = volleyballDirectoryTeam(row, "wcvb");
  assert.equal(team.league, "wcvb");
  assert.equal(team.name, "Pitt");
  assert.deepEqual(team.logo, { uri: "light.png" });
  assert.deepEqual(team.logoLight, { uri: "dark.png" });
  assert.equal(
    volleyballDirectoryTeam({ ...row, logo: null, logoDark: null }, "mcvb")
      .logo,
    null,
  );
});

test("volleyball search results navigate within each tab and retain separate identities", () => {
  for (const league of ["mcvb", "wcvb"] as const) {
    const item = {
      type: "team" as const,
      id: 221,
      name: "Pitt",
      short_name: "Pitt",
      affiliation: league,
      isMCVB: league === "mcvb",
      isWCVB: league === "wcvb",
      matchClass: 4 as const,
      textScore: 1,
      score: 1,
    };
    const route = getExploreRouteForResult(item);
    assert.equal(typeof route, "object");
    if (typeof route !== "object") throw new Error("Expected a team route");
    assert.equal(route.params.teamType, league);
    assert.equal(route.params.league, league);
    assert.equal(getExploreResultIdentity(item), `team:${league}:221`);
    for (const tab of [
      "(home)",
      "(league)",
      "(explore)",
      "(profile)",
    ] as const) {
      assert.equal(
        scopeHrefToTab(`/team/${league}/221`, tab),
        `/(tabs)/${tab}/team/${league}/221?league=${league}`,
      );
    }
    assert.ok(existsSync(`app/(tabs)/(home)/team/${league}/[teamId].tsx`));
  }
  assert.ok(existsSync("app/(tabs)/(home)/game/volleyball/[game].tsx"));
});

test("only implemented volleyball tabs are exposed", () => {
  assert.deepEqual(LEAGUE_TABS.wcvb, [
    "scores",
    "news",
    "standings",
    "rankings",
    "forum",
  ]);
  assert.deepEqual(TEAM_TABS.mcvb, ["schedule", "news", "standings", "forum"]);
});

test("live and final volleyball labels use set periods", () => {
  const game = {
    status: { state: "in", period: 5, completed: false },
  } as VolleyballGame;
  assert.equal(volleyballStatus(game), "Live · Set 5");
  assert.equal(
    volleyballStatus({ ...game, status: { ...game.status, completed: true } }),
    "Final",
  );
});

test("volleyball detail links retain league identity for cards and every tab", () => {
  for (const league of ["mcvb", "wcvb"] as const) {
    const game = { id: "401902970", league: { code: league, id: league === "mcvb" ? 401 : 402 } } as VolleyballGame;
    const route = getVolleyballGameRoute(game);
    assert.equal(route.pathname, "/game/volleyball/[game]");
    assert.equal(route.params.league, league);
    assert.deepEqual(getVolleyballGameParams(route.params), { gameId: game.id, league });
    for (const tab of ["(home)", "(league)", "(explore)", "(profile)"] as const) {
      assert.equal(scopeHrefToTab(`/game/volleyball/${game.id}`, tab), `/(tabs)/${tab}/game/volleyball/${game.id}`);
    }
    assert.deepEqual(getVolleyballGameParams({ game: game.id, leagueId: route.params.leagueId }), { gameId: game.id, league });
    assert.deepEqual(getVolleyballGameParams({ game: encodeURIComponent(JSON.stringify(game)) }), { gameId: game.id, league });
  }
});

test("volleyball deep links reject invalid leagues and mismatched serialized games", () => {
  assert.deepEqual(getVolleyballGameParams({ game: ["401902970"], league: ["wcvb"] }), { gameId: "401902970", league: "wcvb" });
  assert.equal(getVolleyballGameParams({ game: "401902970", league: "nfl" }).league, null);
  assert.equal(getVolleyballGameParams({ game: "bad", league: "mcvb", data: "%broken" }).gameId, "");
  assert.equal(getVolleyballGameParams({ game: "401902970", data: JSON.stringify({ id: "different", league: { code: "mcvb" } }) }).league, null);
});

test("standings preserve nested conference groups and skip empty headings", () => {
  const entry = { team: { id: "221" }, stats: [] };
  const groups = [
    {
      id: "division",
      name: "Division I",
      standings: [],
      children: [{ id: "acc", name: "ACC", standings: [entry], children: [] }],
    },
  ] as unknown as VolleyballStandingsGroup[];
  assert.deepEqual(
    volleyballStandingGroups(groups).map((group) => group.id),
    ["acc"],
  );
});
