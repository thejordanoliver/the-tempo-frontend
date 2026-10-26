import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(path) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    { exports },
  );
  return exports;
}
const { applyLiveDelta } = load("utils/games/liveDelta.ts");
const { decodeRosterResponse } = load("utils/rosterWire.ts");

test("lossless live field patches preserve static fields, replace arrays, and reject missing bases", () => {
  const before = {
    score: {
      status: { state: "in" },
      plays: [{ id: 1 }],
      venue: { name: "Arena" },
    },
    details: { odds: [1] },
  };
  const message = {
    representation: "delta-v1",
    revision: 2,
    baseRevision: 1,
    changes: [
      { path: ["score", "status"], value: { state: "post" } },
      { path: ["score", "plays"], value: [{ id: 2 }] },
    ],
    removed: [["details", "odds"]],
  };
  const result = applyLiveDelta(before, 1, message);
  assert.equal(result.score.status.state, "post");
  assert.equal(result.score.venue.name, "Arena");
  assert.equal(result.score.plays[0].id, 2);
  assert.equal(result.details.odds, undefined);
  assert.equal(before.score.status.state, "in");
  assert.equal(applyLiveDelta(before, 0, message), undefined);
  assert.equal(
    applyLiveDelta(before, 1, {
      ...message,
      changes: [{ path: ["__proto__", "polluted"], value: true }],
    }),
    undefined,
  );
  assert.equal({}.polluted, undefined);
  assert.equal(
    applyLiveDelta(null, undefined, {
      representation: "delta-v1",
      revision: 4,
      snapshot: before,
    }),
    before,
  );
});

test("indexed rosters preserve section ordering and duplicate IDs with legacy fallback", () => {
  const players = [
    { id: 1, name: "One" },
    { id: 1, name: "Two" },
    { id: 2, name: "Three" },
  ];
  const decoded = decodeRosterResponse({
    representation: "indexed-v1",
    players,
    sections: [{ title: "Group", indices: [2, 0, 1] }],
  });
  assert.equal(decoded.sections[0].data[0], players[2]);
  assert.equal(decoded.sections[0].data[2], players[1]);
  const legacy = { players, sections: [{ title: "Group", data: players }] };
  assert.equal(decodeRosterResponse(legacy).sections, legacy.sections);
  assert.throws(() =>
    decodeRosterResponse({
      representation: "indexed-v1",
      players,
      sections: [{ title: "Bad", indices: [4] }],
    }),
  );
});
