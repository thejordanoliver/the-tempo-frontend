import assert from "node:assert/strict";
import test from "node:test";
import {
  gameTeamIdsMatch,
  resolveGameTeamGroups,
} from "../utils/games/gameTeamIdentity";

test("shot team matching handles numeric props and string play IDs", () => {
  assert.equal(gameTeamIdsMatch("153", 153), true);
  assert.equal(gameTeamIdsMatch(302, "302"), true);
  assert.equal(gameTeamIdsMatch(" 17 ", 17), true);
  assert.equal(gameTeamIdsMatch("153", 302), false);
  assert.equal(gameTeamIdsMatch(undefined, undefined), false);
  assert.equal(gameTeamIdsMatch("", 0), false);
});

test("leader groups resolve canonical IDs despite reversed order and conflicting provider aliases", () => {
  const away = { team: { id: "153" }, leaders: ["away player"] };
  const home = { team: { id: 302 }, leaders: ["home player"] };
  assert.deepEqual(resolveGameTeamGroups([home, away], 153, "302"), {
    away,
    home,
  });
});

test("a partial payload cannot use another team's provider alias to fill a missing side", () => {
  const home = { team: { id: 302 } };
  assert.deepEqual(resolveGameTeamGroups([home], 153, 302), {
    away: undefined,
    home,
  });
});

test("WNBA groups use the local ID supplied by the backend", () => {
  const away = { team: { id: 162 } };
  const home = { team: { id: 163 } };
  assert.deepEqual(resolveGameTeamGroups([home, away], "162", 163), {
    away,
    home,
  });
  assert.deepEqual(resolveGameTeamGroups([home, away], 20, 19), {
    away: undefined,
    home: undefined,
  });
});
