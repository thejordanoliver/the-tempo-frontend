import assert from "node:assert/strict";
import test from "node:test";
import { collectFootballSummaryPlays, filterFootballSummaryPlays } from "../utils/sports/football/footballSummary";

const play = (id: string, period: number | string, sequence: number, text = "Run") => ({
  id, period: { number: period }, sequenceNumber: sequence, text, clock: { displayValue: "10:00" },
});

test("combines drive and live plays once, using live corrections and drive team fallback", () => {
  const drivePlay = { ...play("1", 1, 1), awayScore: 0, homeScore: 0 };
  const livePlay = { ...play("1", 1, 1, "Corrected touchdown"), scoringPlay: true, homeScore: 6 };
  const result = collectFootballSummaryPlays([livePlay], { previous: [{ team: { id: 7 }, plays: [drivePlay] }] });
  assert.equal(result.length, 1);
  assert.equal(result[0].text, livePlay.text);
  assert.equal(result[0].team?.id, 7);
  assert.equal(result[0].awayScore, 0);
  assert.equal(result[0].homeScore, 6);
});

test("orders later quarters and sequences first without changing input", () => {
  const input = [play("early", 1, 1), play("later", "4", 2), play("latest", 4, 3)];
  assert.deepEqual(collectFootballSummaryPlays(input).map(p => p.id), ["latest", "later", "early"]);
  assert.equal(input[0].id, "early");
});

test("uses countdown clocks when sequences are unavailable and separates overtime", () => {
  const input = [{ id: "a", text: "Run", period: { number: 4 }, clock: { displayValue: "9:00" } },
    { id: "b", text: "Pass", period: { number: 4 }, clock: { displayValue: "8:00" } },
    play("ot", 5, 10), play("2ot", 6, 11)];
  const result = collectFootballSummaryPlays(input);
  assert.deepEqual(filterFootballSummaryPlays(result, "4th").map(p => p.id), ["b", "a"]);
  assert.deepEqual(filterFootballSummaryPlays(result, "OT").map(p => p.id), ["2ot", "ot"]);
});

test("uses position metadata for drive plays and gives ID-less plays stable identities", () => {
  const input = [{ text: "Run", start: { period: { number: 2 }, clock: { displayValue: "7:01" }, team: { id: 9 } } }];
  const first = collectFootballSummaryPlays(input);
  const second = collectFootballSummaryPlays(input);
  assert.equal(first[0].id, second[0].id);
  assert.equal(first[0].period?.number, 2);
  assert.equal(first[0].team?.id, 9);
});

test("omits empty events and invalid periods", () => {
  assert.deepEqual(collectFootballSummaryPlays([{ text: "Run" }, { period: { number: 1 } }, play("bad", 0, 1)]), []);
});
