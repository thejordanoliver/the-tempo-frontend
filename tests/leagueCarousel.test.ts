import assert from "node:assert/strict";
import { test } from "node:test";
import { leagueCarouselWindow, leagueCarouselMotionAction, leagueDistanceFromFront, leagueOrbitGeometry, leagueOrbitPosition, wrapLeagueRotation } from "../utils/leagueCarousel";

const COUNT = 30;
const geometry = leagueOrbitGeometry(416, 280);

test("rotation and search take the shortest path across the first/last league", () => {
  assert.equal(wrapLeagueRotation(-1, COUNT), 29);
  assert.equal(wrapLeagueRotation(60, COUNT), 0);
  assert.equal(leagueDistanceFromFront(0, 29.75, COUNT), 0.25);
  assert.equal(leagueDistanceFromFront(29, 0.25, COUNT), -1.25);
});

test("repeating a revolution preserves every card's position and layering", () => {
  for (let league = 0; league < COUNT; league++) {
    const before = leagueOrbitPosition(league, 12.25, COUNT, geometry);
    const after = leagueOrbitPosition(league, 42.25, COUNT, geometry);
    assert.deepEqual(after, before);
  }
});

test("the front remains opaque, largest, and above the other visible cards", () => {
  for (const rotation of [0, 0.25, 0.5, 12.9, 29.75]) {
    const front = wrapLeagueRotation(Math.round(rotation), COUNT);
    const selected = leagueOrbitPosition(front, rotation, COUNT, geometry);
    assert.equal(selected.opacity, 1);
    let visible = 0;
    for (let league = 0; league < COUNT; league++) {
      const card = leagueOrbitPosition(league, rotation, COUNT, geometry);
      if (card.opacity === 0) continue;
      visible++;
      assert.ok(card.matrix[14] <= selected.matrix[14] + 1e-10);
      assert.ok(card.zIndex <= selected.zIndex);
      if (Math.abs(leagueDistanceFromFront(league, rotation, COUNT)) <= 1) {
        assert.equal(card.opacity, 1, "foreground cards must not show other logos through them");
      }
    }
    assert.ok(visible <= 4, "hide rear-facing cards instead of rendering mirrored logos");
  }
});

test("card centers follow one circle and their faces point outward, tangent to the ring", () => {
  for (let distance = -3; distance <= 3; distance += 0.125) {
    const { matrix } = leagueOrbitPosition(0, -distance, COUNT, geometry);
    const radial = [matrix[12], matrix[13] - geometry.sinPitch * geometry.radius, matrix[14] + geometry.cosPitch * geometry.radius];
    assert.ok(Math.abs(Math.hypot(...radial) - geometry.radius) < 1e-8);
    // The face normal is the matrix's Z column; the card's width lies tangent
    // to the circle. A billboard/scale-only transform would fail both checks.
    for (let axis = 0; axis < 3; axis++) {
      assert.ok(Math.abs(radial[axis] / geometry.radius - matrix[8 + axis]) < 1e-8);
    }
    assert.ok(Math.abs(radial[0] * matrix[0] + radial[1] * matrix[1] + radial[2] * matrix[2]) < 1e-8);
  }
});

test("perspective makes side cards recede symmetrically at phone and tablet widths", () => {
  for (const width of [280, 390, 768]) {
    const layout = leagueOrbitGeometry(width, Math.min(270, width * 0.62));
    const front = leagueOrbitPosition(0, 0, COUNT, layout);
    const left = leagueOrbitPosition(COUNT - 1, 0, COUNT, layout);
    const right = leagueOrbitPosition(1, 0, COUNT, layout);
    const projectX = (matrix: number[]) => matrix[12] / matrix[15];
    assert.equal(front.matrix[12], 0);
    assert.equal(front.matrix[14], 0);
    assert.ok(right.matrix[14] < 0);
    assert.ok(right.matrix[15] > 1, "the single native matrix must include perspective foreshortening");
    assert.equal(right.matrix.length, 16);
    assert.ok(right.matrix.every(Number.isFinite));
    assert.ok(Math.abs(projectX(left.matrix) + projectX(right.matrix)) < 1e-8);
    assert.ok(right.matrix[8] > 0 && left.matrix[8] < 0, "side faces rotate away from the ring's center");
    assert.ok(projectX(right.matrix) > width * 0.3, "leave space for the front card");
    assert.equal(leagueOrbitPosition(4, 0, COUNT, layout).opacity, 0);
  }
});

test("the seven-card window includes every visible face across wraparound and search jumps", () => {
  for (let rotation = -COUNT; rotation <= COUNT * 2; rotation += 0.125) {
    const index = wrapLeagueRotation(Math.round(rotation), COUNT);
    const window = leagueCarouselWindow(index, COUNT);
    assert.equal(window.length, 7);
    assert.equal(new Set(window).size, 7);
    for (let league = 0; league < COUNT; league++) {
      if (leagueOrbitPosition(league, rotation, COUNT, geometry).opacity > 0) {
        assert.ok(window.includes(league), `visible league ${league} missing at rotation ${rotation}`);
      }
    }
  }
  assert.deepEqual(new Set(leagueCarouselWindow(0, 3)), new Set([0, 1, 2]));
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
