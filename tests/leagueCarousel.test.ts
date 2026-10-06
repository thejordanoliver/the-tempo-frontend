import assert from "node:assert/strict";
import { test } from "node:test";
import { leagueCarouselMotionAction, leagueDistanceFromFront, leagueOrbitPosition, wrapLeagueRotation } from "../utils/leagueCarousel";

const COUNT = 30;

test("rotation and search take the shortest path across the first/last league", () => {
  assert.equal(wrapLeagueRotation(-1, COUNT), 29);
  assert.equal(wrapLeagueRotation(60, COUNT), 0);
  assert.equal(leagueDistanceFromFront(0, 29.75, COUNT), 0.25);
  assert.equal(leagueDistanceFromFront(29, 0.25, COUNT), -1.25);
});

test("repeating a revolution preserves every card's position and layering", () => {
  for (let league = 0; league < COUNT; league++) {
    const before = leagueOrbitPosition(league, 12.25, COUNT, 416);
    const after = leagueOrbitPosition(league, 42.25, COUNT, 416);
    assert.deepEqual(after, before);
  }
});

test("the front remains opaque, largest, and above the other visible cards", () => {
  for (const rotation of [0, 0.25, 0.5, 12.9, 29.75]) {
    const front = wrapLeagueRotation(Math.round(rotation), COUNT);
    const selected = leagueOrbitPosition(front, rotation, COUNT, 416);
    assert.equal(selected.opacity, 1);
    let visible = 0;
    for (let league = 0; league < COUNT; league++) {
      const card = leagueOrbitPosition(league, rotation, COUNT, 416);
      if (card.opacity === 0) continue;
      visible++;
      assert.ok(card.scale <= selected.scale + 1e-10);
      assert.ok(card.zIndex <= selected.zIndex);
      assert.ok(Math.abs(card.translateX) <= 416 * 0.32);
      if (Math.abs(leagueDistanceFromFront(league, rotation, COUNT)) <= 3) {
        assert.equal(card.opacity, 1, "foreground cards must not show other logos through them");
      }
    }
    assert.ok(visible <= 7, "only a small arc should be drawn, rather than all 30 overlapping cards");
  }
});

test("paused arrows and search retain their manual animation until the target is reached", () => {
  const state = { focused: true, appActive: true, paused: true, reduceMotion: false, interacting: false };
  assert.equal(leagueCarouselMotionAction(state), "stop");
  assert.equal(leagueCarouselMotionAction({ ...state, interacting: true }), "manual");
  assert.equal(leagueCarouselMotionAction({ ...state, interacting: true, reduceMotion: true }), "manual");
  assert.equal(leagueCarouselMotionAction({ ...state, interacting: true, appActive: false }), "stop");
  assert.equal(leagueCarouselMotionAction({ ...state, paused: false }), "auto");
});

test("search holds the selected league and clearing search preserves manual pause", () => {
  const state = { focused: true, appActive: true, paused: false, reduceMotion: false, interacting: false, searching: false };
  assert.equal(leagueCarouselMotionAction(state), "auto");
  assert.equal(leagueCarouselMotionAction({ ...state, searching: true }), "stop");
  assert.equal(leagueCarouselMotionAction({ ...state, searching: true, interacting: true }), "manual");
  assert.equal(leagueCarouselMotionAction({ ...state, searching: false }), "auto");
  assert.equal(leagueCarouselMotionAction({ ...state, paused: true, searching: true }), "stop");
  assert.equal(leagueCarouselMotionAction({ ...state, paused: true, searching: false }), "stop");
});
