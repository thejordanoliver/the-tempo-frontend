import assert from "node:assert/strict";
import test from "node:test";
import type { Play } from "../hooks/HockeyHooks/useHockeyGameDetails";
import {
  hockeyPlayLocation,
  isHockeyPlayLive,
  latestHockeyPlay,
  projectHockeyRinkPoint,
} from "../utils/sports/hockey/hockeyPlayByPlay";

const play = (id: string, sequenceNumber: string, period = 1) =>
  ({
    id,
    sequenceNumber,
    period: { number: period },
    clock: { displayValue: "4:00" },
  }) as Play;

test("selects the latest hockey event by period and sequence without mutating plays", () => {
  const plays = [
    play("new", "20", 2),
    play("old", "10", 1),
    play("older", "19", 2),
  ];
  assert.equal(latestHockeyPlay(plays)?.id, "new");
  assert.equal(plays[0].id, "new");
  assert.equal(latestHockeyPlay([], play("end", "21", 2))?.id, "end");
  assert.equal(latestHockeyPlay([]), null);
});

test("projects real hockey locations including center ice without inventing missing positions", () => {
  const center = hockeyPlayLocation({
    ...play("center", "1"),
    coordinate: { x: 0, y: 0 },
  });
  assert.equal(center?.x, 500);
  assert.ok(center && center.y > 20 && center.y < 130);
  assert.deepEqual(
    hockeyPlayLocation({
      ...play("far", "1"),
      coordinate: { x: -100, y: 42.5 },
    }),
    { x: 70, y: 20 },
  );
  assert.deepEqual(
    hockeyPlayLocation({
      ...play("near", "1"),
      coordinate: { x: 100, y: -42.5 },
    }),
    { x: 1000, y: 240 },
  );
  assert.equal(
    hockeyPlayLocation({ ...play("missing", "1"), coordinate: null }),
    null,
  );
  assert.equal(
    hockeyPlayLocation({
      ...play("invalid", "1"),
      coordinate: { x: 150, y: 0 },
    }),
    null,
  );
});

test("rink perspective widens the near edge and makes the far half recede", () => {
  const farLeft = projectHockeyRinkPoint(-100, 42.5);
  const farRight = projectHockeyRinkPoint(100, 42.5);
  const nearLeft = projectHockeyRinkPoint(-100, -42.5);
  const nearRight = projectHockeyRinkPoint(100, -42.5);
  const center = projectHockeyRinkPoint(0, 0);
  assert.ok(nearRight.x - nearLeft.x > farRight.x - farLeft.x);
  assert.ok(center.y - farLeft.y < nearLeft.y - center.y);
  for (const y of [-42.5, 0, 42.5]) {
    assert.ok(
      Math.abs(
        projectHockeyRinkPoint(-25, y).x +
          projectHockeyRinkPoint(25, y).x -
          1000,
      ) < 1e-8,
    );
  }
});

test("suppresses the live indicator during intermissions and after the game", () => {
  assert.equal(
    isHockeyPlayLive("in", { gameStatusDescription: "In Progress" }),
    true,
  );
  assert.equal(
    isHockeyPlayLive("in", { gameStatusDescription: "Intermission" }),
    false,
  );
  assert.equal(isHockeyPlayLive("in", { name: "STATUS_END_PERIOD" }), false);
  assert.equal(
    isHockeyPlayLive("post", { gameStatusDescription: "Final" }),
    false,
  );
});
