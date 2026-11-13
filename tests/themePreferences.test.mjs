import assert from "node:assert/strict";
import test from "node:test";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function setup({ system = "light", stored = null, platform = "ios" } = {}) {
  const h = sportsHookHarness();
  let deviceScheme = system;
  let override = "unspecified";
  const listeners = new Set();
  const nativeChanges = [];
  const writes = [];
  const emitAppearance = () => {
    for (const listener of listeners) {
      listener({
        colorScheme: override === "unspecified" ? deviceScheme : override,
      });
    }
  };
  const jsx = (type, props) => ({ type, props });
  h.react.createContext = () => ({ Provider: "PreferencesProvider" });
  Object.assign(h.modules, {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": {
      Platform: { OS: platform },
      Appearance: {
        getColorScheme: () =>
          override === "unspecified" ? deviceScheme : override,
        addChangeListener(listener) {
          listeners.add(listener);
          return { remove: () => listeners.delete(listener) };
        },
        // Native appearance notifications arrive after applying the override.
        ...(platform === "web"
          ? {}
          : {
              setColorScheme(scheme) {
                nativeChanges.push(scheme);
                override = scheme;
                queueMicrotask(emitAppearance);
              },
            }),
      },
    },
    "@react-native-async-storage/async-storage": {
      getItem: async () => stored,
      setItem: async (key, value) => {
        writes.push([key, value]);
      },
    },
    "hooks/useLeagueLayoutPreference": {
      useLeagueLayoutPreference: () => ({}),
    },
    "hooks/useGameCardLayoutPreference": {
      useGameCardLayoutPreference: () => ({
        gameCardLayout: "list",
        gameCardLayoutLoading: false,
      }),
    },
  });
  const { PreferencesProvider } = h.load("contexts/PreferencesContext.tsx");
  h.start(PreferencesProvider, [{ children: "mounted screens" }]);
  return {
    get preferences() {
      return h.state.props.value;
    },
    get children() {
      return h.state.props.children;
    },
    nativeChanges,
    writes,
    listeners,
    changeDeviceTheme(scheme) {
      deviceScheme = scheme;
      emitAppearance();
    },
    stop: h.stop,
  };
}

test("theme choices update shared preferences, native appearance, and persisted settings", async () => {
  const h = setup();
  try {
    await flush();
    for (const scheme of ["dark", "light", "dark"]) {
      h.preferences.setColorScheme(scheme);
      await flush();
      assert.equal(h.preferences.colorScheme, scheme);
      assert.equal(h.preferences.resolvedColorScheme, scheme);
      assert.equal(h.nativeChanges.at(-1), scheme);
      assert.deepEqual(h.writes.at(-1), ["@color_scheme_preference", scheme]);
      assert.equal(h.children, "mounted screens");
    }
    h.changeDeviceTheme("light");
    await flush();
    assert.equal(h.preferences.resolvedColorScheme, "dark");
    h.preferences.setColorScheme("system");
    await flush();
    assert.equal(h.nativeChanges.at(-1), "unspecified");
    assert.equal(h.preferences.resolvedColorScheme, "light");
    h.changeDeviceTheme("dark");
    await flush();
    assert.equal(h.preferences.resolvedColorScheme, "dark");
  } finally {
    h.stop();
  }
  assert.equal(h.listeners.size, 0);
});

test("saved themes apply to native controls on startup", async () => {
  const h = setup({ stored: "dark" });
  try {
    await flush();
    assert.equal(h.preferences.resolvedColorScheme, "dark");
    assert.equal(h.nativeChanges.at(-1), "dark");
    assert.equal(h.writes.length, 0);
  } finally {
    h.stop();
  }
});

test("a delayed storage read cannot replace a theme chosen by the user", async () => {
  const storage = deferred();
  const h = setup({ stored: storage.promise });
  try {
    h.preferences.setColorScheme("dark");
    await flush();
    storage.resolve("light");
    await flush();
    assert.equal(h.preferences.colorScheme, "dark");
    assert.equal(h.nativeChanges.at(-1), "dark");
  } finally {
    h.stop();
  }
});

test("theme toggling cycles light, dark, and system", async () => {
  const h = setup({ system: "dark" });
  try {
    await flush();
    for (const [choice, resolved] of [
      ["light", "light"],
      ["dark", "dark"],
      ["system", "dark"],
    ]) {
      h.preferences.toggleColorScheme();
      await flush();
      assert.equal(h.preferences.colorScheme, choice);
      assert.equal(h.preferences.resolvedColorScheme, resolved);
    }
  } finally {
    h.stop();
  }
});

test("web theme changes work without the native appearance setter", async () => {
  const h = setup({ platform: "web" });
  try {
    await flush();
    h.preferences.setColorScheme("dark");
    await flush();
    assert.equal(h.preferences.resolvedColorScheme, "dark");
    h.preferences.setColorScheme("system");
    await flush();
    assert.equal(h.preferences.resolvedColorScheme, "light");
    h.changeDeviceTheme("dark");
    await flush();
    assert.equal(h.preferences.resolvedColorScheme, "dark");
  } finally {
    h.stop();
  }
});

for (const group of ["home", "league", "explore", "profile"]) {
  test(`${group} stack allows mounted screens to receive theme changes`, () => {
    const h = sportsHookHarness();
    const jsx = (type, props) => ({ type, props });
    Object.assign(h.modules, {
      "react/jsx-runtime": { jsx, jsxs: jsx },
      "expo-router": { Stack: "Stack" },
      "components/CustomHeader": { CustomHeader: "CustomHeader" },
      "components/CustomHeader/GameHeaderPlaceholder": {
        GameHeaderPlaceholder: "Placeholder",
      },
    });
    const { default: Layout } = h.load(`app/(tabs)/(${group})/_layout.tsx`);
    h.start(Layout);
    assert.equal(
      h.state.props.screenOptions({ route: {}, navigation: {} }).freezeOnBlur,
      false,
    );
    h.stop();
  });
}

test("tab navigation and its bar respond to theme changes without remounting", () => {
  const h = sportsHookHarness();
  let scheme = "light";
  const jsx = (type, props) => ({ type, props });
  Object.assign(h.modules, {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "expo-router": {
      Tabs: Object.assign(() => {}, { Screen: "Screen" }),
      usePathname: () => "/profile",
    },
    "react-native-safe-area-context": {
      useSafeAreaInsets: () => ({ bottom: 20 }),
    },
    "contexts/NavigationBarInsetContext": {
      useNavigationBarRowHeight: () => 70,
      NavigationBarInsetContext: { Provider: "InsetProvider" },
    },
    "../../components/NavigationBar": { default: "NavigationBar" },
    "../../contexts/PreferencesContext": {
      usePreferences: () => ({ resolvedColorScheme: scheme }),
    },
  });
  const { default: Layout } = h.load("app/(tabs)/_layout.tsx");
  h.start(Layout);
  const tabs = h.state.props.children;
  assert.equal(tabs.props.screenOptions.freezeOnBlur, false);
  assert.equal(tabs.props.tabBar({}).props.isDark, false);
  scheme = "dark";
  h.update();
  assert.equal(h.state.props.children.type, tabs.type);
  assert.equal(h.state.props.children.props.tabBar({}).props.isDark, true);
  h.stop();
});

test("navigation bar opens each tab's concrete root screen", () => {
  const h = sportsHookHarness();
  const navigations = [];
  const jsx = (type, props) => ({ type, props });
  Object.assign(h.modules, {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": {
      StyleSheet: { create: (styles) => styles, hairlineWidth: 1 },
      View: "View",
      Text: "Text",
      TouchableOpacity: "TouchableOpacity",
    },
    "expo-router": {
      useRouter: () => ({ navigate: (href) => navigations.push(href) }),
    },
    "expo-blur": { BlurView: "BlurView" },
    "reicon-react-native": {
      Balls: "Balls",
      Compass: "Compass",
      Home: "Home",
      User: "User",
    },
    "contexts/NavigationBarInsetContext": {
      useNavigationBarRowHeight: () => 70,
    },
  });
  const { default: NavigationBar } = h.load("components/NavigationBar.tsx");
  const routes = ["(home)", "(league)", "(explore)", "(profile)"].map(
    (name) => ({ name, key: name }),
  );
  h.start(NavigationBar, [
    {
      state: { index: 0, routes },
      descriptors: Object.fromEntries(
        routes.map(({ key }) => [key, { options: {} }]),
      ),
      insets: { bottom: 20 },
      isDark: false,
    },
  ]);
  const buttons = h.state.props.children[1].props.children;
  buttons.forEach((button) => button.props.onPress());
  assert.deepEqual(navigations, [
    "/(tabs)/(league)/league",
    "/(tabs)/(explore)/explore",
    "/(tabs)/(profile)/profile",
  ]);
  h.stop();
});
