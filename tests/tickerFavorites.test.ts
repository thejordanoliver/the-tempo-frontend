import assert from "node:assert/strict";
import test from "node:test";
import {
  tickerFavoriteTeams,
  favoriteTeamsSignature,
} from "../services/ticker/favorites";
import { encodeCommand, decodeFrame } from "../services/ticker/protocol";
import type { TickerFavoriteTeam } from "../types/ticker";

const teams: TickerFavoriteTeam[] = [
  { league: "nba", teamId: 1 },
  { league: "nfl", teamId: 1 },
  { league: "cfb", teamId: 129689 },
];
test("ticker favorites preserve league identity, skip unsupported teams and deduplicate", () => {
  assert.deepEqual(
    tickerFavoriteTeams([
      "nba:1",
      "nfl:1",
      "nba:001",
      "nhl:1",
      "cfb:129689",
      "nba:0",
      "nba:16777216",
      "bad",
    ]),
    teams,
  );
  assert.notEqual(
    favoriteTeamsSignature(teams),
    favoriteTeamsSignature(teams.slice(1)),
  );
  for (const invalid of [
    [],
    [...teams, teams[0]],
    [{ league: "nhl", teamId: 1 }],
    [{ league: "nba", teamId: 1.5 }],
    Array(51).fill(teams[0]),
  ])
    assert.throws(() =>
      favoriteTeamsSignature(invalid as TickerFavoriteTeam[]),
    );
});
test("v5 transfers three qualified IDs per minimum-MTU packet and confirms the list signature", () => {
  const begin = encodeCommand(
    1,
    { type: "favorites_begin", value: teams.length },
    5,
  );
  const chunk = encodeCommand(
    2,
    { type: "favorites_chunk", offset: 0, teams },
    5,
  );
  assert.deepEqual(Array.from(begin.slice(0, 6)), [5, 1, 1, 0, 14, 3]);
  assert.equal(chunk.length, 20);
  assert.deepEqual(
    Array.from(chunk.slice(4)),
    [15, 0, 3, 1, 1, 0, 0, 2, 1, 0, 0, 3, 0x99, 0xfa, 1, 0],
  );
  const signature = favoriteTeamsSignature(teams);
  const commit = encodeCommand(
    3,
    { type: "favorites_commit", value: signature },
    5,
  );
  const frame = Uint8Array.from([
    5,
    3,
    0,
    0,
    0,
    0,
    255,
    50,
    1,
    1,
    2,
    0,
    8,
    0,
    1,
    6,
    5,
    ...commit.slice(5, 8),
  ]);
  const result = decodeFrame(frame);
  if (result.kind !== "status") return assert.fail();
  assert.equal(result.status.settings.viewMode, "favorites");
  assert.equal(result.status.settings.teamId, null);
  assert.equal(result.status.settings.favoritesSignature, signature);
  assert.ok(result.status.capabilities.includes("favorites_commit"));
  frame[0] = 4;
  assert.throws(() => decodeFrame(frame));
  frame[0] = 5;
  frame.fill(0, 17);
  assert.throws(() => decodeFrame(frame));
  for (const version of [1, 2, 3, 4] as const)
    assert.throws(
      () => encodeCommand(1, { type: "favorites_begin", value: 3 }, version),
      /0.8.0/,
    );
  for (const value of [0, 51, 1.5])
    assert.throws(() =>
      encodeCommand(1, { type: "favorites_begin", value }, 5),
    );
  for (const offset of [-1, 49, 0.5])
    assert.throws(() =>
      encodeCommand(1, { type: "favorites_chunk", offset, teams }, 5),
    );
  assert.throws(() =>
    encodeCommand(
      1,
      { type: "favorites_chunk", offset: 0, teams: [...teams, teams[0]] },
      5,
    ),
  );
});
