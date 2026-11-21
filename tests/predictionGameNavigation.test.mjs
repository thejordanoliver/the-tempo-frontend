import assert from "node:assert/strict";
import test from "node:test";
import { sportsHookHarness } from "./helpers/sportsHookHarness.mjs";

const sports = {
  basketball: "mcbb",
  football: "cfb",
  baseball: "cb",
  hockey: "nhl",
  soccer: "eng.1",
  mma: "ufc",
  volleyball: "wcvb",
};

for (const [sport, league] of Object.entries(sports)) {
  test(`${sport} prediction links dispatch the game screen with its league, ID and initial participants`, () => {
    const h = sportsHookHarness();
    try {
      const { getPredictionGameHref } = h.load(
        "utils/navigation/predictionGameNavigation.ts",
      );
      const pick = {
        sport,
        league,
        gameId: "401234567",
        startsAt: "2026-11-15T20:00Z",
        state: "pre",
        home: {
          id: "1",
          name: "Home",
          code: "HOME",
          logo: "home.png",
          record: "4-1",
        },
        away: {
          id: "2",
          name: "Away",
          code: "AWAY",
          logo: "away.png",
          record: "3-2",
        },
      };
      const href = getPredictionGameHref(pick);
      const data = JSON.parse(decodeURIComponent(href.params.data));
      assert.equal(href.params.sport, sport);
      assert.equal(href.params.game, pick.gameId);
      assert.equal(data.id, pick.gameId);
      assert.equal(data.league.code, league);
      assert.equal(data.date, pick.startsAt);
      assert.equal(data.home.id, "1");
      assert.equal(data.away.id, "2");
      assert.equal(data.status.state, "pre");
      if (sport === "mma") assert.equal(data.competitors.length, 2);

      h.modules["./teamNavigation"] = { withTeamLeague: (value) => value };
      const { scopeHrefToTab } = h.load(
        "utils/navigation/tabStackNavigation.ts",
      );
      assert.equal(
        scopeHrefToTab(href, "(profile)").pathname,
        "/(tabs)/(profile)/game/[sport]/[game]",
      );
      h.modules["expo-router"] = { useLocalSearchParams: () => href.params };
      h.modules["react/jsx-runtime"] = {
        jsx: (type, props) => ({ type, props }),
      };
      for (const name of [...Object.keys(sports), "tennis", "racing"]) {
        h.modules[`app/(tabs)/(home)/game/${name}/[game]`] = { __esModule: true, default: name };
      }
      h.start(h.load("components/Navigation/GameRouteScreen.tsx").default);
      assert.equal(h.state.type, sport);
    } finally {
      h.stop();
    }
  });
}

test("prediction navigation preserves sport-specific snapshot data and ignores a mismatched snapshot", () => {
  const h = sportsHookHarness();
  try {
    const { getPredictionGameHref } = h.load(
      "utils/navigation/predictionGameNavigation.ts",
    );
    const pick = {
      sport: "mma",
      league: "ufc",
      gameId: "10",
      startsAt: "2026-11-15T20:00Z",
      home: { id: "1", record: "3-0" },
      away: { id: "2" },
      game: {
        sport: "mma",
        home: { id: 1, record: "4-0" },
        away: { id: 2 },
        competitors: [{ id: 1, headshot: "fighter.png" }, { id: 2 }],
        status: { state: "post", completed: true },
        method: "KO",
      },
    };
    const game = JSON.parse(
      decodeURIComponent(getPredictionGameHref(pick).params.data),
    );
    assert.equal(game.home.record, "4-0");
    assert.equal(game.competitors[0].headshot, "fighter.png");
    assert.equal(game.method, "KO");
    assert.equal(game.status.completed, true);
    const mismatched = JSON.parse(
      decodeURIComponent(
        getPredictionGameHref({ ...pick, sport: "hockey" }).params.data,
      ),
    );
    assert.equal(mismatched.home.record, "3-0");
    assert.equal(mismatched.competitors, undefined);
  } finally {
    h.stop();
  }
});
