import assert from "node:assert/strict";
import test from "node:test";
import { withTeamLeague } from "../utils/teamNavigation";
import { resolveSoccerTeamLeague } from "../utils/soccerTeamLeague";
import { TEAM_TABS } from "../utils/tabs";
import { getExploreRouteForResult } from "../utils/exploreNavigation";

test("fixed team routes carry league in every tab stack", () => {
  for (const prefix of ["", "/(tabs)/(home)", "/(tabs)/(league)", "/(tabs)/(explore)", "/(tabs)/(profile)"]) {
    for (const league of ["nba", "wnba", "gleague", "mcbb", "wcbb", "nfl", "cfb", "ufl", "mlb", "cb", "sb", "nhl"]) {
      const path = `${prefix}/team/${league === "nba" ? "12" : `${league}/12`}`;
      assert.equal(withTeamLeague(path as never), `${path}?league=${league}`);
    }
  }
});

test("dynamic team routes recover their league and retain other params", () => {
  assert.deepEqual(withTeamLeague({
    pathname: "/(tabs)/(explore)/team/[teamType]/[teamId]",
    params: { teamType: "nfl", teamId: "12", season: "2026" },
  }), {
    pathname: "/(tabs)/(explore)/team/[teamType]/[teamId]",
    params: { teamType: "nfl", teamId: "12", season: "2026", league: "nfl" },
  });
});

test("soccer links preserve competition and recover college leagues for legacy favorites", () => {
  assert.equal(withTeamLeague("/team/soccer/5718?league=socc" as never), "/team/soccer/5718?league=msoc");
  assert.equal(resolveSoccerTeamLeague(20310, undefined), "wsoc");
  assert.equal(resolveSoccerTeamLeague(5718, ["MSOC"]), "msoc");
  assert.equal(withTeamLeague("/team/soccer/12?league=epl" as never), "/team/soccer/12?league=epl");
});

test("college soccer search routes preserve league and omit the roster tab", () => {
  for (const league of ["msoc", "wsoc"] as const) {
    const route = getExploreRouteForResult({ type: "team", id: 5718, isSOCC: true, league } as never);
    assert.ok(typeof route === "object");
    assert.equal(route.params.league, league);
    assert.equal((TEAM_TABS[league] as readonly string[]).includes("roster"), false);
  }
  assert.equal(TEAM_TABS.socc.includes("roster"), true);
});
