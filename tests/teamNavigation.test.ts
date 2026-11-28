import assert from "node:assert/strict";
import test from "node:test";
import {
  getTeamHref,
  resolveTeamRoute,
  withTeamLeague,
} from "../utils/navigation/teamNavigation";
import { resolveSoccerTeamLeague } from "../utils/teams/soccerTeamLeague";
import { TEAM_TABS } from "../utils/navigation/tabs";
import { getExploreRouteForResult } from "../utils/navigation/exploreNavigation";

test("legacy team URLs resolve to sport routes in every tab stack", () => {
  const leagues = {
    nba: "basketball",
    wnba: "basketball",
    gleague: "basketball",
    mcbb: "basketball",
    wcbb: "basketball",
    nfl: "football",
    cfb: "football",
    ufl: "football",
    mlb: "baseball",
    cb: "baseball",
    sb: "baseball",
    nhl: "hockey",
    mch: "hockey",
    wch: "hockey",
  };
  for (const prefix of [
    "",
    "/(tabs)/(home)",
    "/(tabs)/(league)",
    "/(tabs)/(explore)",
    "/(tabs)/(profile)",
  ]) {
    for (const [league, sport] of Object.entries(leagues)) {
      const path = `${prefix}/team/${league === "nba" ? "12" : `${league}/12`}`;
      assert.equal(
        withTeamLeague(path as never),
        `${prefix}/team/${sport}/12?league=${league}`,
      );
      assert.deepEqual(
        resolveTeamRoute(league === "nba" ? undefined : league, 12),
        { sport, league },
      );
    }
  }
});

test("sport routes carry league and retain other params", () => {
  const href = getTeamHref("football", "12", "nfl", "(explore)");
  assert.deepEqual(
    withTeamLeague({ ...href, params: { ...href.params, season: "2026" } }),
    {
      pathname: "/(tabs)/(explore)/team/[sport]/[teamId]",
      params: {
        sport: "football",
        teamId: "12",
        league: "nfl",
        season: "2026",
      },
    },
  );
});

test("overlapping team IDs are resolved by league", () => {
  assert.equal(resolveTeamRoute("basketball", 12, "nba")?.league, "nba");
  assert.equal(resolveTeamRoute("basketball", 12, "wnba")?.league, "wnba");
  assert.equal(resolveTeamRoute("basketball", 12, "nfl"), undefined);
  assert.equal(resolveTeamRoute("basketball", 12), undefined);
  assert.equal(resolveTeamRoute("constructor", 12), undefined);
});

test("soccer links preserve competition and recover college leagues for legacy favorites", () => {
  assert.equal(
    withTeamLeague("/team/soccer/5718?league=socc"),
    "/team/soccer/5718?league=msoc",
  );
  assert.equal(resolveSoccerTeamLeague(20310, undefined), "wsoc");
  assert.equal(resolveSoccerTeamLeague(5718, ["MSOC"]), "msoc");
  assert.equal(
    withTeamLeague("/team/soccer/12?league=epl"),
    "/team/soccer/12?league=epl",
  );
});

test("college soccer search routes preserve league and omit the roster tab", () => {
  for (const league of ["msoc", "wsoc"] as const) {
    const route = getExploreRouteForResult({
      type: "team",
      id: 5718,
      sport: "soccer",
      league,
    } as never);
    assert.ok(typeof route === "object");
    assert.equal(route.params.league, league);
    assert.equal(
      (TEAM_TABS[league] as readonly string[]).includes("roster"),
      false,
    );
  }
  assert.equal(TEAM_TABS.socc.includes("roster"), true);
});
