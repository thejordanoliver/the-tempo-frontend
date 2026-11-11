import assert from "node:assert/strict";
import test from "node:test";
import { sportsHookHarness, flush } from "./helpers/sportsHookHarness.mjs";

const FanPrediction = "FanPrediction";
const points = { pointsValue: 1, bonusReason: null };

function findPrediction(node) {
  if (!node || typeof node !== "object") return null;
  if (node.type === FanPrediction) return node.props;
  const children = node.props?.children;
  return (Array.isArray(children) ? children : [children])
    .map(findPrediction)
    .find(Boolean);
}

for (const id of [401234567, "401234567"]) {
  for (const fromRoute of [false, true]) {
    test(`UFC predictions load points with a ${typeof id} fight ID from ${fromRoute ? "route data" : "props"}`, async () => {
      const h = sportsHookHarness();
      const requests = [];
      const activeRef = { current: true };
      const game = {
        id,
        date: "2026-11-01T00:00:00Z",
        ...(fromRoute ? { parentEvent: { date: "2026-10-31T21:00:00Z" } } : {}),
        league: { code: "ufc" },
        status: { state: "pre" },
        competitors: [{ id: "1" }, { id: "2" }],
      };
      const jsx = (type, props) => ({ type, props });
      h.react.useLayoutEffect = h.react.useEffect;
      Object.assign(h.modules, {
        "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
        "react-native": { ScrollView: "ScrollView", View: "View" },
        "expo-router": {
          useNavigation: () => ({ setOptions() {} }),
          useLocalSearchParams: () =>
            fromRoute
              ? {
                  game: String(id),
                  data: encodeURIComponent(JSON.stringify(game)),
                }
              : {},
        },
        "expo-router/build/global-state/routing": { goBack() {} },
        "@/components/CustomHeader": { CustomHeader: "CustomHeader" },
        "components/CustomHeader/GameHeaderPlaceholder": {
          GameHeaderPlaceholder: "Placeholder",
        },
        "@/components/Sports/Basketball/GameDetails": {
          FanPrediction,
          GameLiveChatOverlay: "GameLiveChatOverlay",
          Venue: "Venue",
        },
        "@/hooks/useWeather": { useWeather: () => ({}) },
        "@/utils/common/dateUtils": {
          safeDate: (date) => new Date(date),
          formatDate: () => "Oct 31",
          formatTime: () => "7 PM",
          getHolidayLabel: () => null,
        },
        "components/CustomActivityIndicator": { default: "Loading" },
        "components/Sports/MMA/GameDetails/GameHeader": { default: "Header" },
        "components/Sports/MMA/GameDetails/MatchupComparison": {
          default: "Matchup",
        },
        "contexts/PreferencesContext": {
          usePreferences: () => ({ resolvedColorScheme: "dark" }),
        },
        "hooks/useGameChatAvailability": {
          useGameChatAvailability: () => false,
        },
        "hooks/useNavigationBarContentStyle": {
          useNavigationBarContentStyle: () => (style) => style,
        },
        "hooks/useScrollFade": { useScrollFade: () => ({}) },
        "styles/GameDetailStyles/GameDetailsScreenStyles": {
          gameDetailsScreenStyles: {},
        },
        "utils/games/games": {
          formatPeriod: () => "",
          formatVenueAddress: () => "",
          getBroadcastDisplay: () => "",
        },
        "../useScreenActivity": {
          useScreenActivity: () => ({ active: true, activeRef }),
        },
        "services/fanPredictionsApi": {
          async fetchPredictionScoring(gameId, context) {
            requests.push({ gameId, context });
            return points;
          },
        },
      });
      const { usePredictionScoring } = h.load(
        "hooks/FanPredictionHooks/usePredictionScoring.ts",
      );
      h.modules["@/hooks/FanPredictionHooks/useLiveVotes"] = {
        useLiveVotes: (gameId, context) => ({
          ...usePredictionScoring(gameId, context),
          votes: [],
          castVote: async () => ({ ok: true }),
        }),
      };
      try {
        h.start(h.load("app/(tabs)/(home)/game/mma/[game].tsx").default, [
          fromRoute ? {} : { game },
        ]);
        await flush();
        assert.equal(requests.length, 1, "prediction points must be requested");
        assert.equal(requests[0].gameId, Number(id));
        assert.equal(requests[0].context.sport, "mma");
        assert.equal(requests[0].context.league, "ufc");
        assert.equal(
          requests[0].context.date,
          game.parentEvent?.date ?? game.date,
        );
        const prediction = findPrediction(h.state);
        assert.equal(prediction.gameId, Number(id));
        assert.equal(prediction.state, "pre");
        assert.deepEqual(prediction.scoring, points);
      } finally {
        h.stop();
      }
    });
  }
}
