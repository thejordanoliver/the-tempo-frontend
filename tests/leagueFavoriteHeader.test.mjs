import assert from "node:assert/strict";
import test from "node:test";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function find(node, type) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = find(child, type);
      if (match) return match;
    }
    return undefined;
  }
  if (!node || typeof node !== "object") return undefined;
  return node.type === type ? node : find(node.props?.children, type);
}

function setup(league = "nba", pendingSave = false) {
  const h = sportsHookHarness();
  const savedRequests = [];
  const pending = deferred();
  h.modules["services/usersApi"] = {
    getFavoriteSports: async () => [],
    updateFavoriteSports: async (favorites) => {
      savedRequests.push([...favorites]);
      return pendingSave ? pending.promise : favorites;
    },
  };
  const leagues = h.load("constants/leagues.ts");
  h.modules["constants/leagues"] = leagues;
  const { useFavoriteSports } = h.load("hooks/UserHooks/useFavoriteSports.ts");
  let context;
  h.modules["contexts/FavoriteTeamsContext"] = {
    useFavoriteTeamsContext: () => context,
  };
  const { useLeagueFavoriteHeader } = h.load(
    "hooks/UserHooks/useLeagueFavoriteHeader.ts",
  );
  Object.assign(h.modules, {
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "constants/styles": { activeOpacity: 0.7, Colors: { white: "white" } },
    "expo-haptics": {
      ImpactFeedbackStyle: { Light: "light" },
      impactAsync: async () => undefined,
    },
    "react-native": {
      Pressable: "Pressable",
      Text: "Text",
      TouchableOpacity: "TouchableOpacity",
      View: "View",
      useWindowDimensions: () => ({ width: 390 }),
    },
    "../../styles/CustomHeaderStyles": { CustomHeaderStyles: () => ({}) },
    "@/utils/customheader/favoriteAction": h.load(
      "utils/customheader/favoriteAction.ts",
    ),
    "./ProfileHeaderMenu": { ProfileHeaderMenu: "ProfileHeaderMenu" },
    "react/jsx-runtime": {
      jsx: (type, props) =>
        typeof type === "function" ? type(props) : { type, props },
      jsxs: (type, props) =>
        typeof type === "function" ? type(props) : { type, props },
    },
  });
  const { HeaderRightActions } = h.load(
    "components/CustomHeader/HeaderRightActions.tsx",
  );
  h.start(
    (currentLeague) => {
      // Use the same real favorite-sports callbacks that the context exposes.
      context = useFavoriteSports(123);
      return { header: useLeagueFavoriteHeader(currentLeague), context };
    },
    [league],
  );
  return {
    h,
    leagues,
    savedRequests,
    pending,
    renderHeader: () =>
      HeaderRightActions({
        ...h.state.header,
        isTeamScreen: false,
        isDark: true,
        isMessagesListScreen: false,
        favoriteIconColor: "white",
      }),
  };
}

test("every browsable league shows its heart and saves add/remove through the context callback", async () => {
  const { h, leagues, savedRequests, renderHeader } = setup();
  try {
    await flush();
    for (const league of leagues.BROWSEABLE_LEAGUES) {
      h.update([league]);
      assert.equal(h.state.header.showFavoriteAction, true, league);
      assert.equal(h.state.header.isFavorite, false, league);
      assert.equal(h.state.header.favoritePending, false, league);
      assert.equal(
        find(renderHeader(), "Ionicons").props.name,
        "heart-outline",
      );

      find(renderHeader(), "TouchableOpacity").props.onPress();
      await flush();
      assert.equal(h.state.header.isFavorite, true, league);
      assert.deepEqual(savedRequests.at(-1), [league]);
      assert.deepEqual(Array.from(h.state.context.favoriteSports), [league]);
      assert.equal(find(renderHeader(), "Ionicons").props.name, "heart");

      find(renderHeader(), "TouchableOpacity").props.onPress();
      await flush();
      assert.equal(h.state.header.isFavorite, false, league);
      assert.deepEqual(savedRequests.at(-1), []);
    }
    assert.equal(savedRequests.length, leagues.BROWSEABLE_LEAGUES.length * 2);
  } finally {
    h.stop();
  }
});

test("the league heart blocks changes before favorites load and while a save is pending", async () => {
  const { h, savedRequests, pending, renderHeader } = setup("nba", true);
  try {
    assert.equal(h.state.header.showFavoriteAction, true);
    assert.equal(h.state.header.favoritePending, true);
    assert.equal(find(renderHeader(), "TouchableOpacity").props.disabled, true);
    h.state.header.onToggleFavorite();
    assert.equal(savedRequests.length, 0);

    await flush();
    assert.equal(h.state.header.favoritePending, false);
    h.state.header.onToggleFavorite();
    await flush();
    assert.equal(h.state.header.favoritePending, true);
    assert.equal(h.state.header.isFavorite, true);
    assert.equal(find(renderHeader(), "TouchableOpacity").props.disabled, true);
    h.state.header.onToggleFavorite();
    await flush();
    assert.deepEqual(savedRequests, [["nba"]]);

    pending.resolve(["nba"]);
    await flush();
    assert.equal(h.state.header.favoritePending, false);
    assert.equal(h.state.header.isFavorite, true);
  } finally {
    h.stop();
  }
});

test("unknown league values do not expose a heart or start a save", async () => {
  const { h, savedRequests, renderHeader } = setup("unknown-league");
  try {
    await flush();
    for (const league of ["unknown-league", "", null, undefined]) {
      h.update([league]);
      assert.equal(h.state.header.showFavoriteAction, false);
      assert.equal(h.state.header.isFavorite, false);
      assert.equal(find(renderHeader(), "Ionicons"), undefined);
      h.state.header.onToggleFavorite();
    }
    assert.equal(savedRequests.length, 0);
  } finally {
    h.stop();
  }
});
