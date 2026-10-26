import assert from "node:assert/strict";
import test from "node:test";
import type { Play as BasketballPlay } from "../hooks/BasketballHooks/useBasketballGameDetails";
import type { Play as HockeyPlay } from "../hooks/HockeyHooks/useHockeyGameDetails";
import {
  basketballSummaryModel,
  footballSummaryModel,
  hockeySummaryModel,
} from "../utils/games/gameSummaryModels";
import { collectFootballSummaryPlays } from "../utils/sports/football/footballSummary";

const play = (id: string, period: number, sequence: number) => ({
  id,
  period: { number: period },
  sequenceNumber: String(sequence),
  text: "Play description",
  clock: { displayValue: "3:12" },
  team: { id: 153 },
  awayScore: 0,
  homeScore: 3,
  scoringPlay: true,
  scoreValue: 3,
  type: { text: "Made shot" },
});

test("basketball adapter preserves newest-first ordering, zero scores, and point labels", () => {
  const input = [play("old", 1, 1), play("new", 2, 2)] as BasketballPlay[];
  const model = basketballSummaryModel(input, "MCBB");
  assert.deepEqual(
    model.plays.map((p) => p.id),
    ["new", "old"],
  );
  assert.equal(model.plays[0].periodLabel, "2nd Half");
  assert.equal(model.plays[0].eventLabel, "+3 PTS");
  assert.equal(model.plays[0].awayScore, 0);
  assert.equal(input[0].id, "old");
});

test("basketball orders live plays by period and clock when sequences are unavailable", () => {
  const input = [
    { ...play("previous-period", 1, 99) },
    {
      ...play("older", 2, 0),
      sequenceNumber: "",
      clock: { displayValue: "5:00" },
    },
    {
      ...play("latest", 2, 0),
      sequenceNumber: "",
      clock: { displayValue: "4:30" },
    },
  ] as BasketballPlay[];
  assert.deepEqual(
    basketballSummaryModel(input, "nba").plays.map((p) => p.id),
    ["latest", "older", "previous-period"],
  );
  assert.deepEqual(
    input.map((p) => p.id),
    ["previous-period", "older", "latest"],
  );
});

test("women's basketball uses quarters and extra periods remain independently selectable", () => {
  const model = basketballSummaryModel(
    [play("ot", 5, 1), play("2ot", 6, 2)] as BasketballPlay[],
    "wcbb",
  );
  assert.deepEqual(
    model.periods.map((p) => p.label),
    ["All", "OT", "2OT"],
  );
  assert.equal(model.plays[0].periodLabel, "2OT");
});

test("hockey adapter preserves goal labels and separates shootouts", () => {
  const input = [
    play("goal", 3, 1),
    { ...play("so", 5, 2), period: { number: 5, displayValue: "Shootout" } },
  ] as HockeyPlay[];
  const model = hockeySummaryModel(input);
  assert.equal(model.plays[0].periodLabel, "SO");
  assert.equal(model.plays[1].periodLabel, "P3");
  assert.equal(model.plays[1].eventLabel, "GOAL");
});

test("football adapter keeps down-and-distance and scoring names", () => {
  const input = collectFootballSummaryPlays([
    {
      ...play("run", 4, 1),
      scoringPlay: false,
      start: { shortDownDistanceText: "2nd & 4" },
      type: { text: "Rush" },
    },
    { ...play("score", 5, 2), scoringType: { displayName: "Touchdown" } },
  ]);
  const model = footballSummaryModel(input);
  assert.equal(model.plays[0].periodLabel, "OT");
  assert.equal(model.plays[0].eventLabel, "Touchdown");
  assert.equal(model.plays[1].eventLabel, "2nd & 4 · Rush");
  assert.equal(model.plays[1].periodLabel, "Q4");
});
