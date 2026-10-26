import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise((resolve) => setImmediate(resolve));
function harness(file, name, dependencies, globals = {}) {
  const slots = [];
  let cursor = 0,
    pending = [];
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots))
        slots[i] = typeof initial === "function" ? initial() : initial;
      return [
        slots[i],
        (next) => {
          slots[i] = typeof next === "function" ? next(slots[i]) : next;
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      slots[i] ??= { current: initial };
      return slots[i];
    },
    useCallback: (callback) => callback,
    useMemo: (callback) => callback(),
    useEffect(callback, deps) {
      const i = cursor++,
        previous = slots[i];
      if (previous && deps.every((x, n) => Object.is(x, previous.deps[n])))
        return;
      slots[i] = { deps };
      pending.push(callback);
    },
  };
  const element = (type, props) => ({ type, props });
  const modules = {
    ...dependencies,
    react,
    "react/jsx-runtime": { jsx: element, jsxs: element },
  };
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      require: (key) => {
        assert.ok(key in modules, `Unexpected dependency: ${key}`);
        return modules[key];
      },
      console,
      setTimeout: (callback) => {
        callback();
      },
      ...globals,
    },
  );
  return (...args) => {
    cursor = 0;
    const result = exports[name](...args),
      effects = pending;
    pending = [];
    effects.forEach((effect) => effect());
    return result;
  };
}

function editor() {
  let sourceLoad,
    rejectCapture = false;
  const captures = [],
    saved = [];
  const player = { pause() {}, currentTime: 0 };
  const render = harness("components/Forum/VideoEditorModal.tsx", "default", {
    "@expo/vector-icons": { Ionicons: "Icon" },
    "@react-native-community/slider": "Slider",
    "constants/styles": { Colors: {}, Fonts: {} },
    "contexts/PreferencesContext": {
      usePreferences: () => ({ resolvedColorScheme: "dark" }),
    },
    expo: {
      useEventListener: (_player, _event, listener) => {
        sourceLoad = listener;
      },
    },
    "expo-video": { useVideoPlayer: () => player, VideoView: "VideoView" },
    "expo-video-thumbnails": {
      getThumbnailAsync: async (_uri, options) => {
        captures.push(options.time);
        if (rejectCapture) throw new Error("thumbnail failed");
        return { uri: "file:///kept-frame.jpg" };
      },
    },
    "react-native": {
      Alert: { alert() {} },
      Modal: "Modal",
      StyleSheet: { create: (styles) => styles },
      Text: "Text",
      TouchableOpacity: "Button",
      View: "View",
    },
    "react-native-safe-area-context": { SafeAreaView: "SafeAreaView" },
  });
  const props = {
    visible: true,
    videoUri: "file:///original.mp4",
    initialThumbnailUri: "file:///old-frame.jpg",
    onSave: (value) => saved.push(value),
    onClose() {},
  };
  function nodes(type) {
    const result = [];
    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (node.type === type) result.push(node);
      walk(node.props?.children);
    }
    walk(render(props));
    return result.map((node) => node.props);
  }
  return {
    nodes,
    saved,
    captures,
    load: () => sourceLoad({ duration: 10 }),
    failCapture: () => {
      rejectCapture = true;
    },
  };
}

test("video editor saves both slider values and captures its thumbnail inside the kept clip", async () => {
  const view = editor();
  view.nodes("Slider");
  await flush();
  view.load();
  view.nodes("Slider")[0].onValueChange(2000);
  view.nodes("Slider")[1].onValueChange(6000);
  view.nodes("Slider")[2].onValueChange(9000);
  await view.nodes("Button")[1].onPress();
  assert.equal(view.saved.length, 1);
  assert.equal(view.saved[0].trimStartMs, 2000);
  assert.equal(view.saved[0].trimEndMs, 6000);
  assert.equal(view.saved[0].thumbnailUri, "file:///kept-frame.jpg");
  assert.ok(view.captures[0] >= 2000 && view.captures[0] < 6000);
});

test("video trim controls prevent an empty or reversed clip", async () => {
  const view = editor();
  view.nodes("Slider");
  await flush();
  view.load();
  view.nodes("Slider")[0].onValueChange(4000);
  view.nodes("Slider")[1].onValueChange(2000);
  const sliders = view.nodes("Slider");
  assert.equal(sliders[0].value, 4000);
  assert.equal(sliders[1].value, 4001);
  sliders[0].onValueChange(10000);
  assert.equal(view.nodes("Slider")[0].value, 4000);
});

test("failed thumbnail generation cannot save a frame from excluded footage", async () => {
  const view = editor();
  view.nodes("Slider");
  await flush();
  view.load();
  view.failCapture();
  await view.nodes("Button")[1].onPress();
  assert.equal(view.saved.length, 0);
});

test("composer trim metadata indexes uploaded files when remote GIFs precede videos", async () => {
  let submitted;
  class Form {
    fields = [];
    append(key, value) {
      this.fields.push([key, value]);
    }
  }
  const render = harness(
    "hooks/ForumHooks/useCreatePost.ts",
    "useCreatePost",
    {
      "services/forumApi": { loadPostPolls: async (posts) => posts },
      "hooks/useScopedRouter": { useScopedRouter: () => ({ back() {} }) },
      "@/hooks/ForumHooks/useBadgeNotifications": {
        useBadgeNotifications: () => ({
          handleBadgeAwards() {},
          requestBadgeDataRefresh() {},
        }),
      },
      axios: { isAxiosError: () => false },
      "expo-image-picker": {},
      "expo-video-thumbnails": {},
      "react-native": {
        Animated: { Value: class {} },
        Platform: { OS: "ios" },
        UIManager: {},
      },
      "utils/apiClient": {
        apiClient: {
          post: async (_url, form) => {
            submitted = form;
            return { data: { post: { id: "1" } } };
          },
        },
      },
      "utils/forums/forumPostDestination": {
        getForumPostCreateEndpoint: () => "/api/forum/league/nba",
      },
    },
    { FormData: Form },
  );
  const destination = { league: "nba" };
  render(destination).setMedia([
    { id: "g", type: "gif", uri: "https://media.example/g.gif" },
    { id: "i", type: "image", uri: "file:///photo.jpg" },
    {
      id: "v",
      type: "video",
      uri: "file:///video.mp4",
      trimStartMs: 2000,
      trimEndMs: 6000,
    },
  ]);
  await render(destination).createPost();
  const trim = JSON.parse(
    submitted.fields.find(([key]) => key === "trimMeta")[1],
  );
  const files = submitted.fields.filter(([key]) => key === "media");
  assert.equal(trim.idx, 1);
  assert.equal(files[trim.idx][1].uri, "file:///video.mp4");
  assert.equal(trim.startMs, 2000);
  assert.equal(trim.endMs, 6000);
});
