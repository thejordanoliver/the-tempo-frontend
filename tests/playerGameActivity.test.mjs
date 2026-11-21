import assert from "node:assert/strict";
import test from "node:test";
import { flush, sportsHookHarness } from "./helpers/sportsHookHarness.mjs";

function setupScreen(sport, league, profileLeague = league) {
  const h = sportsHookHarness();
  const player = { id: 100, team_id: 20, active: false };
  const requests = [];
  const game = {
    id: "fight-1",
    eventId: "event-1",
    date: "2026-01-01T12:00:00Z",
    status: { state: "post", completed: true },
    competitors: [{ id: "100" }, { id: "200" }],
  };
  const fightLog = {
    fights: [{ ...game, fightId: game.id, result: "W" }],
  };
  h.react.useLayoutEffect = h.react.useEffect;
  h.modules["react/jsx-runtime"] = {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
    Fragment: "Fragment",
  };
  h.modules["react-native"] = { View: "View", Text: "Text" };
  h.modules["expo-router"] = {
    useLocalSearchParams: () => ({ id: "100", teamId: "99", league }),
    useNavigation: () => ({ setOptions() {} }),
  };
  h.modules["contexts/PreferencesContext"] = {
    usePreferences: () => ({ resolvedColorScheme: "dark" }),
  };
  h.modules["constants/styles"] = {
    Colors: { midTone: "#888888" },
    globalStyles: () => ({}),
  };
  h.modules["@/hooks/LeagueHooks/usePlayerById"] = {
    usePlayerById: () => ({
      player,
      loading: false,
      error: null,
      resolvedPlayerId: player.id,
      resolvedLeague: profileLeague,
    }),
  };
  const stats = {
    data: [],
    seasons: [],
    collegeSeasons: [],
    loading: false,
    seasonsLoading: false,
  };
  for (const name of ["Baseball", "Basketball", "Football", "Hockey"]) {
    h.modules[`@/hooks/${name}Hooks/usePlayerSeasons`] = {
      usePlayerSeasons: () => stats,
      useBaseballPlayerSeasons: () => stats,
    };
  }
  h.modules["hooks/LeagueHooks/usePlayerGameLog"] = {
    usePlayerGameLog: () => ({ data: { season: 2026 }, loading: false }),
  };
  h.modules["hooks/MMAHooks/useFighterFightLog"] = {
    useFighterFightLog: () => ({ data: fightLog, loading: false }),
  };
  h.modules["utils/apiClient"] = {
    apiClient: {
      async get(url) {
        requests.push(url);
        return { data: { games: [game], game } };
      },
    },
  };
  h.modules.axios = { isAxiosError: () => false, isCancel: () => false };
  for (const suffix of [
    "",
    "CFB",
    "NFL",
    "MLB",
    "NHL",
    "MCBB",
    "WCBB",
    "WNBA",
  ]) {
    const team = (id) => ({ id, primaryColor: "#123456" });
    const key = suffix || "NBA";
    h.modules[`@/constants/teams${suffix}`] = h.modules[
      `constants/teams${suffix}`
    ] = {
      [`get${key}Team`]: team,
      [`get${key}TeamLogo`]: () => "team-logo",
    };
  }
  for (const path of [
    "@/components/CustomHeader",
    "components/CustomHeader/GameHeaderPlaceholder",
    "@/components/Player/LatestGame",
    "@/components/Player/PlayerAwardList",
    "components/CustomActivityIndicator",
    "components/Player/PlayerDetailsPager",
    "components/Player/PlayerGameLog",
    "components/Player/PlayerHeader",
    "components/Sports/MMA/Player/FighterCareerStats",
    "components/Sports/MMA/Player/FighterFightLog",
    ...["Baseball", "Basketball", "Football", "Hockey"].flatMap((name) => [
      `@/components/Sports/${name}/Player/PlayerStatTable`,
      `components/Sports/${name}/Player/PlayerStatTable`,
      `@/components/Sports/${name}/Player/SeasonStatCard`,
    ]),
  ]) {
    const name = path.split("/").at(-1);
    h.modules[path] = { __esModule: true, default: name, [name]: name };
  }
  h.start(h.load(`app/(tabs)/(home)/player/${sport}/[id].tsx`).default);
  return { h, player, requests, game };
}

function overviewGame(h) {
  return h.state.props.overview.props.children.find(
    (child) => child?.type === "LatestGame",
  );
}

for (const [sport, league] of [
  ["basketball", "nba"],
  ["basketball", "wnba"],
  ["basketball", "mcbb"],
  ["basketball", "wcbb"],
  ["football", "nfl"],
  ["football", "cfb"],
  ["baseball", "mlb"],
  ["hockey", "nhl"],
  ["mma", "ufc"],
]) {
  test(`${league} overview games require an explicitly active profile`, async () => {
    const { h, player, requests, game } = setupScreen(sport, league);
    try {
      for (const active of [false, null, undefined, "true"]) {
        player.active = active;
        h.update();
        await flush();
        assert.equal(overviewGame(h), undefined);
        assert.equal(requests.length, 0);
        assert.ok(
          h.state.props.pages.some((page) => page.label === "Career Stats"),
        );
        if (league !== "wnba") {
          assert.ok(
            h.state.props.pages.some((page) =>
              ["Game Log", "Fight Log"].includes(page.label),
            ),
          );
        }
      }

      player.active = true;
      h.update();
      await flush();
      assert.equal(requests.length, 1);
      assert.equal(overviewGame(h).props.game, game);

      // Changing status must hide both the game and its live subscription immediately.
      player.active = false;
      h.update();
      assert.equal(overviewGame(h), undefined);
      if (sport !== "mma") assert.equal(h.subscription.enabled, false);
      await flush();
      assert.equal(requests.length, 1);
    } finally {
      h.stop();
    }
  });
}

for (const [sport, college, pro] of [
  ["basketball", "mcbb", "nba"],
  ["basketball", "wcbb", "wnba"],
  ["football", "cfb", "nfl"],
]) {
  test(`${college} uses the linked ${pro} profile's active status and schedule`, async () => {
    const { h, player, requests } = setupScreen(sport, college, pro);
    try {
      await flush();
      assert.equal(requests.length, 0);
      assert.equal(overviewGame(h), undefined);

      player.active = true;
      h.update();
      await flush();
      assert.equal(requests[0], `/api/games/${sport}/team/${pro}/20`);
      assert.equal(overviewGame(h).props.league, pro);
    } finally {
      h.stop();
    }
  });
}
