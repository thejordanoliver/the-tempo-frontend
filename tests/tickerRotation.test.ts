import assert from "node:assert/strict";
import test from "node:test";
import {
  rotationSignature,
  rotationEntryBytes,
  decodeRotation,
} from "../services/ticker/rotation";
import { encodeCommand, decodeFrame } from "../services/ticker/protocol";
import type { TickerRotationEntry } from "../types/ticker";
const entries: TickerRotationEntry[] = [
  { league: "nba", view: "scores", teamId: null, seconds: 6 },
  { league: "cfb", view: "schedule", teamId: 129689, seconds: 8 },
  { league: "wcbb", view: "ap", teamId: null, seconds: 3 },
];
test("rotation has matching native signature, qualified teams, order and minimum-MTU chunks", () => {
  assert.equal(rotationSignature(entries), 4834019);
  assert.notEqual(
    rotationSignature([...entries].reverse()),
    rotationSignature(entries),
  );
  const chunk = encodeCommand(
    1,
    { type: "rotation_chunk", offset: 0, entries: entries.slice(0, 2) },
    9,
  );
  assert.equal(chunk.length, 20);
  assert.deepEqual(
    Array.from(chunk.slice(4)),
    [20, 0, 2, 1, 0, 0, 0, 0, 6, 3, 1, 0x99, 0xfa, 1, 8, 0],
  );
  const bytes = Uint8Array.of(
    1,
    entries.length,
    ...entries.flatMap((entry) => Array.from(rotationEntryBytes(entry))),
  );
  assert.deepEqual(decodeRotation(bytes), { enabled: true, entries });
  assert.deepEqual(decodeRotation(new Uint8Array()), {
    enabled: false,
    entries: [],
  });
});
test("rotation rejects bad leagues, poll combinations, team IDs, duration, sizes and legacy commands", () => {
  for (const patch of [
    { league: "nba", view: "ap" },
    { league: "wcbb", view: "cfp" },
    { view: "schedule", teamId: null },
    { view: "scores", teamId: 1 },
    { seconds: 2 },
    { seconds: 61 },
    { seconds: 3.5 },
    { league: null },
    { view: "rotation" },
    { teamId: 0x1000000 },
  ])
    assert.throws(() =>
      rotationSignature([{ ...entries[0], ...patch } as TickerRotationEntry]),
    );
  assert.doesNotThrow(() =>
    rotationSignature([
      { league: null, view: "favorites", teamId: null, seconds: 6 },
    ]),
  );
  assert.throws(() => rotationSignature([]));
  assert.throws(() => rotationSignature(Array(9).fill(entries[0])));
  assert.throws(() => decodeRotation(Uint8Array.of(1, 8)));
  for (const version of [1, 2, 3, 4, 5, 6, 7, 8] as const)
    assert.throws(
      () => encodeCommand(1, { type: "rotation_begin", value: 1 }, version),
      /0.12.0/,
    );
  assert.throws(() =>
    encodeCommand(
      1,
      { type: "rotation_chunk", offset: 7, entries: entries.slice(0, 2) },
      9,
    ),
  );
  assert.throws(() =>
    encodeCommand(1, { type: "rotation_commit", value: 0 }, 9),
  );
});
test("v9 active rotation carries its signature independently of schedules and favorites", () => {
  const commit = encodeCommand(
    3,
    { type: "rotation_commit", value: rotationSignature(entries) },
    9,
  );
  const bytes = Uint8Array.of(
    9,
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
    12,
    0,
    1,
    6,
    6,
    ...commit.slice(5, 8),
  );
  const result = decodeFrame(bytes);
  if (result.kind !== "status") return assert.fail();
  assert.equal(result.status.settings.viewMode, "rotation");
  assert.equal(result.status.settings.rotationSignature, 4834019);
  assert.equal(result.status.settings.favoritesSignature, null);
  assert.equal(result.status.settings.teamId, null);
  assert.ok(result.status.capabilities.includes("rotation_commit"));
  bytes[0] = 8;
  assert.throws(() => decodeFrame(bytes));
  bytes[0] = 9;
  bytes.fill(0, 17);
  assert.throws(() => decodeFrame(bytes));
});
