import assert from "node:assert/strict";
import test from "node:test";
import { flush, sportsHookHarness } from "./helpers/sportsHookHarness.mjs";

const team = {
  id: 57,
  name: "Florida",
  fullName: "Florida Gators",
  shortName: "Florida",
  league: "mcbb",
  sport: "basketball",
  type: "team",
  logo: "https://example.com/florida.png",
  logoDark: "https://example.com/florida-dark.png",
};

function nodes(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}

function renderTeam(item, isDark = false) {
  const h = sportsHookHarness();
  h.modules["react/jsx-runtime"] = {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
  };
  h.modules["react-native"] = {
    Image: "Image",
    Text: "Text",
    TouchableOpacity: "TouchableOpacity",
    View: "View",
  };
  h.modules["expo-router"] = { useFocusEffect() {} };
  h.modules["@expo/vector-icons"] = { Ionicons: "Ionicons" };
  h.modules["constants/styles"] = { Colors: {}, activeOpacity: 0.7 };
  h.modules["contexts/PreferencesContext"] = {
    usePreferences: () => ({ resolvedColorScheme: isDark ? "dark" : "light" }),
  };
  h.modules["styles/ExploreStyles/ExploreStyles"] = {
    exploreStyles: () => ({}),
  };
  const Row = h.load("components/Explore/ResultItemRow.tsx").default;
  h.start(() => {
    h.row = Row({ item, onSelect() {}, query: "Florida" });
    const image = nodes(h.row).find((node) => typeof node.type === "function");
    return image.type(image.props);
  });
  return h;
}

test("Explore renders backend full names and logo URLs for each theme", () => {
  for (const [isDark, expected] of [
    [false, team.logo],
    [true, team.logoDark],
  ]) {
    const h = renderTeam(team, isDark);
    assert.equal(h.state.type, "Image");
    assert.equal(typeof h.state.props.source, "object");
    assert.equal(h.state.props.source.uri, expected);
    assert.equal(
      nodes(h.row).find((node) => node.type === "Text").props.children,
      team.fullName,
    );
    assert.ok(
      nodes(h.row).some(
        (node) => node.props.accessibilityLabel === `Open ${team.fullName}`,
      ),
    );
    h.stop();
  }
});

test("Explore uses the team name when fullName is unavailable", () => {
  for (const fullName of [undefined, null, "", "   "]) {
    const h = renderTeam({ ...team, fullName });
    assert.equal(
      nodes(h.row).find((node) => node.type === "Text").props.children,
      team.name,
    );
    h.stop();
  }
});

test("Explore falls back from missing dark logos to the main logo or placeholder", () => {
  for (const logoDark of [undefined, null, "", "   "]) {
    const h = renderTeam({ ...team, logoDark }, true);
    assert.equal(h.state.props.source.uri, team.logo);
    h.stop();
  }

  for (const league of ["mcbb", "mcvb"]) {
    const placeholder = renderTeam({
      ...team,
      league,
      logo: null,
      logoDark: null,
    });
    assert.match(placeholder.state.props.source, /teamPlaceholder\.png$/);
    placeholder.stop();
  }
});

test("Explore shows a placeholder when a remote team logo fails to load", async () => {
  const h = renderTeam(team);
  h.state.props.onError();
  await flush();
  assert.match(h.state.props.source, /teamPlaceholder\.png$/);
  h.stop();
});

test("player rows display backend team information without local team lookups", () => {
  const player = {
    id: 1,
    type: "player",
    full_name: "New Player",
    league: "mcbb",
    sport: "basketball",
    team_id: team.id,
    headshot_url: null,
    association_name: null,
    team,
  };
  const withTeam = renderTeam(player);
  assert.ok(
    nodes(withTeam.row).some(
      (node) => node.type === "Text" && node.props.children === team.fullName,
    ),
  );
  withTeam.stop();

  const unavailable = renderTeam({ ...player, team: null });
  assert.equal(
    nodes(unavailable.row).some((node) => node.props.children === "Free Agent"),
    false,
  );
  unavailable.stop();

  const freeAgent = renderTeam({ ...player, team: null, team_id: null });
  assert.ok(
    nodes(freeAgent.row).some((node) => node.props.children === "Free Agent"),
  );
  freeAgent.stop();
});
