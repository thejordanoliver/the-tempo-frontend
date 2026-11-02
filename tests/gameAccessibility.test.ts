import assert from "node:assert/strict";
import test from "node:test";
import { getGameAccessibilityLabel } from "../utils/games/gameAccessibility";

const display = { date: "Nov 2", time: "7:00 PM" };
const game = {
  away: { name: "Boston Celtics", score: 0 },
  home: { name: "New York Knicks", score: 0 },
  league: { name: "NBA" },
};

test("scheduled cards announce teams and start time without misleading zero scores", () => {
  const label = getGameAccessibilityLabel(
    { ...game, status: { state: "pre", description: "Scheduled" } },
    display,
  );
  assert.match(label, /Boston Celtics at New York Knicks/);
  assert.match(label, /NBA.*Scheduled.*Nov 2.*7:00 PM/);
  assert.doesNotMatch(label, /Score:/);
});

test("live cards include zero scores and game progress, without announcing a start time", () => {
  const label = getGameAccessibilityLabel(
    { ...game, status: { state: "in", detail: "2nd quarter, 4:32" } },
    display,
  );
  assert.match(label, /2nd quarter, 4:32/);
  assert.match(label, /Score: Boston Celtics 0, New York Knicks 0/);
  assert.doesNotMatch(label, /7:00 PM/);
});

test("final cards announce results without relying on winner colors", () => {
  const label = getGameAccessibilityLabel(
    {
      ...game,
      away: { ...game.away, score: 102 },
      home: { ...game.home, score: 99 },
      status: { completed: true, description: "Final" },
    },
    display,
  );
  assert.match(label, /Final. Score: Boston Celtics 102, New York Knicks 99/);
});

test("postponed and TBD cards do not announce a stale start time", () => {
  for (const detail of ["Postponed", "Canceled", "TBD", "Delayed"]) {
    const label = getGameAccessibilityLabel(
      { ...game, status: { state: "pre", detail } },
      display,
    );
    assert.match(label, new RegExp(detail));
    assert.doesNotMatch(label, /7:00 PM|Score:/);
  }
});

test("neutral games use versus and incomplete games have readable fallbacks", () => {
  assert.match(
    getGameAccessibilityLabel({ ...game, isNeutralSite: true }, display),
    /Boston Celtics versus New York Knicks/,
  );
  const label = getGameAccessibilityLabel({ status: { state: "in" } }, display);
  assert.match(label, /Away team at Home team/);
  assert.doesNotMatch(label, /undefined|NaN|Score:/);
});

test("canceled events do not announce placeholder results even with a post-game state", () => {
  const label = getGameAccessibilityLabel(
    { ...game, status: { state: "post", description: "Canceled" } },
    display,
  );
  assert.match(label, /Canceled/);
  assert.doesNotMatch(label, /Score:/);
});
