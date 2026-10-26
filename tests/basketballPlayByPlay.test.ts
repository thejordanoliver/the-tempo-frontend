import assert from "node:assert/strict";
import test from "node:test";
import type { Play } from "../hooks/BasketballHooks/useBasketballGameDetails";
import {
  basketballPlayLocation,
  basketballShotTrajectory,
  BASKETBALL_RIM_HEIGHT,
  isBasketballPlayLive,
  latestBasketballPlay,
  projectBasketballCourtPoint,
  sortBasketballPlays,
} from "../utils/sports/basketball/basketballPlayByPlay";

import { projectBasketballRaisedPoint } from "../utils/sports/basketball/basketballCourtGeometry";

const play = (
  id: string,
  period: number,
  sequenceNumber: string,
  clock: string,
) =>
  ({
    id,
    period: { number: period },
    sequenceNumber,
    clock: { displayValue: clock },
  }) as Play;

test("selects the latest NBA play by period, sequence, and fractional final-second clocks", () => {
  const plays = [
    play("old", 1, "10", "3:12"),
    play("new", 2, "12", "4:00"),
    play("older", 2, "11", "4:00"),
  ];
  assert.equal(latestBasketballPlay(plays)?.id, "new");
  assert.equal(plays[0].id, "old");
  assert.equal(
    latestBasketballPlay([], play("explicit", 4, "1", "0.0"))?.id,
    "explicit",
  );
  assert.deepEqual(
    sortBasketballPlays([
      play("earlier", 4, "", "5.1"),
      play("later", 4, "", "3.1"),
    ]).map((p) => p.id),
    ["later", "earlier"],
  );
  assert.equal(latestBasketballPlay([]), null);
});

test("projects normalized court positions and leaves missing locations unmarked", () => {
  const base = play("shot", 1, "1", "11:00");
  assert.deepEqual(
    basketballPlayLocation({ ...base, courtPosition: { x: 47, y: 25 } }),
    projectBasketballCourtPoint(47, 25),
  );
  assert.equal(basketballPlayLocation({ ...base, courtPosition: null }), null);
  assert.equal(
    basketballPlayLocation({ ...base, courtPosition: { x: 95, y: 20 } }),
    null,
  );
  assert.equal(
    basketballPlayLocation({ ...base, courtPosition: { x: 0, y: NaN } }),
    null,
  );
  assert.equal(
    basketballPlayLocation({ ...base, coordinate: { x: 25, y: 4 } }),
    null,
  );
  const far = projectBasketballCourtPoint(0, 0),
    near = projectBasketballCourtPoint(0, 50);
  assert.ok(near.x < far.x && near.y > far.y);
});

test("suppresses the live indicator at halftime, between quarters, and after final", () => {
  assert.equal(
    isBasketballPlayLive("in", { gameStatusDescription: "In Progress" }),
    true,
  );
  assert.equal(
    isBasketballPlayLive("in", { gameStatusDescription: "Halftime" }),
    false,
  );
  assert.equal(
    isBasketballPlayLive("in", {
      gameStatusDetail: "End of the 3rd Quarter",
      name: "STATUS_END_PERIOD",
    }),
    false,
  );
  assert.equal(isBasketballPlayLive("post"), false);
});

test("shot arcs end at the shooting team's elevated rim, including shots beyond half court", () => {
  const base = {
    ...play("shot", 1, "1", "11:00"),
    shootingPlay: true,
    team: { id: 20 },
    courtPosition: { x: 15, y: 40 },
  };
  const homeShot = basketballShotTrajectory(base, "20", "6");
  const rightBasket = projectBasketballRaisedPoint(
    88.75,
    25,
    BASKETBALL_RIM_HEIGHT,
  );
  assert.ok(homeShot);
  assert.deepEqual(homeShot.start, basketballPlayLocation(base));
  assert.deepEqual(homeShot.end, {
    x: rightBasket.x,
    y: rightBasket.y,
  });
  assert.match(homeShot.path, /^M.+ Q.+/);

  const awayShot = basketballShotTrajectory(
    { ...base, team: { id: 6 }, courtPosition: { x: 80, y: 10 } },
    20,
    6,
  );
  const leftBasket = projectBasketballRaisedPoint(
    5.25,
    25,
    BASKETBALL_RIM_HEIGHT,
  );
  assert.deepEqual(awayShot?.end, {
    x: leftBasket.x,
    y: leftBasket.y,
  });
});

test("does not draw shot arcs for rebounds, unknown teams, or missing or invalid positions", () => {
  const base = {
    ...play("shot", 1, "1", "11:00"),
    shootingPlay: true,
    team: { id: 20 },
    courtPosition: { x: 80, y: 25 },
  };
  for (const candidate of [
    null,
    { ...base, shootingPlay: false, type: { id: "1", text: "Rebound" } },
    { ...base, team: { id: 99 } },
    { ...base, courtPosition: null },
    { ...base, courtPosition: { x: 95, y: 25 } },
    { ...base, courtPosition: { x: NaN, y: 25 } },
  ]) {
    assert.equal(basketballShotTrajectory(candidate, 20, 6), null);
  }
});

test("high shot arcs stay on screen for baseline shots, layups and long attempts toward either hoop", () => {
  for (const teamId of [20, 6]) {
    for (const position of [
      { x: 19, y: 25 },
      { x: 5.25, y: 25 },
      { x: 88.75, y: 25 },
      { x: 0, y: 0 },
      { x: 94, y: 50 },
    ]) {
      const shot = basketballShotTrajectory(
        {
          ...play("shot", 1, "1", "11:00"),
          shootingPlay: true,
          team: { id: teamId },
          courtPosition: position,
        },
        20,
        6,
      );
      assert.ok(shot);
      const heights = Array.from({ length: 101 }, (_, i) => {
        const t = i / 100;
        return (
          (1 - t) ** 2 * shot.start.y +
          2 * (1 - t) * t * shot.control.y +
          t ** 2 * shot.end.y
        );
      });
      assert.ok(heights.every(Number.isFinite));
      assert.ok(Math.min(...heights) >= 2 - 1e-8);
      assert.ok(Math.min(...heights) < Math.min(shot.start.y, shot.end.y));
    }
  }
});
