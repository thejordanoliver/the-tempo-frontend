import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const exports = {};
const source = ts.transpileModule(
  fs.readFileSync("components/Messages/ConversationEmptyState.tsx", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  },
).outputText;

vm.runInNewContext(source, {
  exports,
  require: (name) => {
    if (name === "react/jsx-runtime") return require(name);
    if (name === "react-native")
      return {
        View: "View",
        Text: "Text",
        TouchableOpacity: "TouchableOpacity",
      };
    if (name === "@expo/vector-icons") return { Ionicons: "Icon" };
    if (name === "components/CustomActivityIndicator")
      return { default: "ActivityIndicator" };
    if (name === "constants/styles")
      return {
        Colors: { white: "white", black: "black" },
        globalStyles: () => ({ emptyContainer: { flex: 1 } }),
      };
    throw new Error(`Unexpected import: ${name}`);
  },
});

for (const state of [
  { name: "no remaining messages", isLoading: false, error: null },
  { name: "loading", isLoading: true, error: null },
  { name: "load error", isLoading: false, error: "offline" },
]) {
  test(`the ${state.name} state stays upright inside an inverted message list`, () => {
    // FlatList injects this transform into ListEmptyComponent to cancel the
    // list's own inversion after the last message is removed.
    const inversionStyle = { transform: [{ scaleY: -1 }] };
    const element = exports.default({
      styles: { emptyState: { flex: 1 } },
      style: inversionStyle,
      isDark: false,
      isLoading: state.isLoading,
      error: state.error,
      refresh() {},
    });
    const rootStyle = Object.assign({}, ...element.props.style.flat(Infinity));
    assert.equal(rootStyle.flex, 1);
    assert.equal(rootStyle.transform, inversionStyle.transform);
    assert.equal(-1 * rootStyle.transform[0].scaleY, 1);
  });
}
