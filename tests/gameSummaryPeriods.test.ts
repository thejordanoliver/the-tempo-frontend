import assert from "node:assert/strict";
import test from "node:test";
import { filterGameSummaryPeriod, getGameSummaryPeriods } from "../utils/games/gameSummaryPeriods";

const quarters = ["1st", "2nd", "3rd", "4th"];
const plays = (...numbers: (number | string)[]) => numbers.map(number => ({ period: { number } }));

test("only shows periods represented in the feed, in chronological order", () => {
  assert.deepEqual(getGameSummaryPeriods(plays(3, "1", 3), quarters).map(tab => tab.label), ["All", "1st", "3rd"]);
  assert.deepEqual(getGameSummaryPeriods([], quarters), [{ label: "All", number: null }]);
});

test("men's college halves and overtime use the correct period numbers", () => {
  assert.deepEqual(getGameSummaryPeriods(plays(1, 2, 3, 4), ["1st Half", "2nd Half"]).map(tab => tab.label), ["All", "1st Half", "2nd Half", "OT", "2OT"]);
});

test("each overtime tab filters only its own period, including double-digit overtime", () => {
  const feed = plays(4, 5, 6, 14);
  const tabs = getGameSummaryPeriods(feed, quarters);
  assert.deepEqual(tabs.map(tab => tab.label), ["All", "4th", "OT", "2OT", "10OT"]);
  assert.deepEqual(filterGameSummaryPeriod(feed, "2OT", tabs), [feed[2]]);
  assert.deepEqual(filterGameSummaryPeriod(feed, "10OT", tabs), [feed[3]]);
  assert.deepEqual(filterGameSummaryPeriod(feed, "All", tabs), feed);
});

test("hockey shootout gets a separate tab from overtime", () => {
  const feed = [...plays(1, 2, 3, 4), { period: { number: 5, displayValue: "Shootout" } }];
  const tabs = getGameSummaryPeriods(feed, ["1st", "2nd", "3rd"]);
  assert.deepEqual(tabs.map(tab => tab.label), ["All", "1st", "2nd", "3rd", "OT", "SO"]);
  assert.deepEqual(filterGameSummaryPeriod(feed, "SO", tabs), [feed[4]]);
});

test("ignores malformed periods and safely falls back to All for a removed tab", () => {
  const feed = [{ period: { number: null } }, ...plays(-1, 0, 1.5, "bad", 2)];
  const tabs = getGameSummaryPeriods(feed, quarters);
  assert.deepEqual(tabs.map(tab => tab.label), ["All", "2nd"]);
  assert.deepEqual(filterGameSummaryPeriod(feed, "OT", tabs), feed);
});
