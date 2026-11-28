import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { transformSync } = require("@babel/core");
const compatibility = require("../plugins/babelNativeReanimatedDependencies");
const hooks = [
  "useAnimatedStyle",
  "useAnimatedProps",
  "useDerivedValue",
  "useAnimatedReaction",
  "useAnimatedScrollHandler",
  "useHandler",
];
const fixture = `
  import {
    useAnimatedStyle, useAnimatedProps, useDerivedValue as derive,
    useAnimatedReaction, useAnimatedScrollHandler, useHandler
  } from "react-native-reanimated";
  import * as Reanimated from "react-native-reanimated";
  export const effects = [];
  export const dependencies = ["state"];
  export const adapter = () => {};
  const getDependencies = () => {
    effects.push("dependencies");
    return dependencies;
  };
  useAnimatedStyle(() => ({ opacity: 1 }), getDependencies());
  useAnimatedProps(() => ({ opacity: 1 }), getDependencies(), adapter);
  derive(() => 42, getDependencies());
  useAnimatedReaction(() => 42, () => {}, getDependencies());
  useAnimatedScrollHandler({ onScroll: () => {} }, getDependencies());
  useHandler({ onScroll: () => {} }, getDependencies());
  Reanimated.useDerivedValue(() => 43, getDependencies());
`;

function run(source, platform, filename) {
  const calls = [];
  const warnings = [];
  const reanimated = Object.fromEntries(
    hooks.map((name) => [
      name,
      (...args) => {
        calls.push({ name, args });
        const dependencyIndex = name === "useAnimatedReaction" ? 2 : 1;
        if (platform !== "web" && args[dependencyIndex] !== undefined) {
          warnings.push("Dependencies should only be used on the web");
        }
      },
    ]),
  );
  const { code } = transformSync(source, {
    filename,
    caller: { name: "tempo-test", platform },
    configFile: false,
    babelrc: false,
    plugins: [compatibility, "@babel/plugin-transform-modules-commonjs"],
  });
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      assert.ok(["react-native-reanimated", "other-hooks"].includes(name));
      return reanimated;
    },
  });
  return { calls, warnings, exports, code };
}

for (const library of [
  "@gorhom/bottom-sheet",
  "react-native-draggable-flatlist",
]) {
  const filename = path.resolve("node_modules", library, "src/example.js");
  for (const platform of ["ios", "android"]) {
    test(`${library} passes no web dependencies to native hooks on ${platform}`, () => {
      const result = run(fixture, platform, filename);
      assert.equal(result.calls.length, 7);
      assert.deepEqual(result.warnings, []);
      assert.equal(result.exports.effects.length, 7);
      assert.equal(result.calls[1].args[2], result.exports.adapter);
      assert.equal(result.calls[2].args[0](), 42);
      assert.equal(result.calls[6].args[0](), 43);
    });
  }
  test(`${library} retains dependency identity and evaluation on web`, () => {
    const result = run(fixture, "web", filename);
    assert.equal(result.exports.effects.length, 7);
    for (const { name, args } of result.calls) {
      const index = name === "useAnimatedReaction" ? 2 : 1;
      assert.equal(args[index], result.exports.dependencies);
    }
    assert.equal(result.calls[1].args[2], result.exports.adapter);
  });
}

test("app code and unrelated libraries retain their native diagnostics", () => {
  for (const filename of [
    "components/Example.js",
    "node_modules/other-library/example.js",
  ]) {
    const result = run(fixture, "ios", path.resolve(filename));
    assert.equal(result.warnings.length, 7);
  }
});

test("similarly named imports and shadowed functions are unchanged", () => {
  const result = run(
    `import { useDerivedValue } from "other-hooks";
     useDerivedValue(() => 1, []);
     function local(useDerivedValue) { useDerivedValue(() => 2, []); }
     local(useDerivedValue);`,
    "ios",
    path.resolve("node_modules/@gorhom/bottom-sheet/src/example.js"),
  );
  assert.equal(result.warnings.length, 2);
});

test("the Expo preset still serializes third-party worklet closures", () => {
  const filename = require.resolve(
    "react-native-draggable-flatlist/src/hooks/useCellTranslate.tsx",
  );
  for (const platform of ["ios", "android", "web"]) {
    const { code } = transformSync(
      require("node:fs").readFileSync(filename, "utf8"),
      {
        filename,
        configFile: path.resolve("babel.config.js"),
        caller: {
          name: "metro",
          platform,
          isDev: true,
          isHMREnabled: true,
          supportsStaticESM: true,
        },
      },
    );
    assert.ok(
      code.includes("__closure"),
      `${platform}: retain worklet tracking`,
    );
  }
});
