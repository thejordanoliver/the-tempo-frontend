import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const { transformSync } = require("@babel/core");
const filename = require.resolve(
  "react-native-draggable-flatlist/src/components/DraggableFlatList.tsx",
);
const source = readFileSync(filename, "utf8");

for (const platform of ["ios", "android", "web"]) {
  test(`DraggableFlatList defers the data reset on ${platform}`, () => {
    const { code } = transformSync(source, {
      filename,
      configFile: path.resolve("babel.config.js"),
      caller: {
        name: "metro",
        platform,
        isDev: true,
        isHMREnabled: true,
        supportsStaticESM: true,
      },
    });

    const scheduler =
      platform === "web"
        ? /InteractionManager.*runAfterInteractions\(/
        : /requestAnimationFrame\(/;
    const dataChange =
      code.match(/if\s*\(dataHasChanged\)\s*\{[^\n]{0,120}/)?.[0] ?? "";
    assert.match(dataChange, scheduler);
    if (platform !== "web") assert.doesNotMatch(code, /InteractionManager/);
  });
}
