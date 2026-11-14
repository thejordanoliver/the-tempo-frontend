import assert from "node:assert/strict";
import test from "node:test";
import type { ScoreboardOdds } from "../types/odds";
import { getOddsDisplay } from "../utils/games/odds";

function emptyOdds(): ScoreboardOdds {
  const participant = {
    team: null,
    favorite: null,
    underdog: null,
    moneyLine: null,
    spreadOdds: null,
    favoriteAtOpen: null,
  };
  const history = { close: null, open: null };
  const spread = { ...history, line: null, openLine: null };
  const total = {
    close: { line: null, odds: null },
    open: { line: null, odds: null },
  };
  return {
    provider: null,
    details: null,
    spread: null,
    overUnder: null,
    homeMoneyline: null,
    awayMoneyline: null,
    drawMoneyline: null,
    homeOdds: { ...participant },
    awayOdds: { ...participant },
    moneyLine: {
      name: null,
      shortName: null,
      home: { ...history },
      away: { ...history },
      draw: { ...history },
    },
    pointSpread: {
      name: null,
      shortName: null,
      home: { ...spread },
      away: { ...spread },
    },
    total: {
      name: null,
      shortName: null,
      over: structuredClone(total),
      under: structuredClone(total),
    },
  };
}

test("shows current prices, each side's spread, totals and changed opening lines", () => {
  const odds = emptyOdds();
  odds.moneyLine.home = { close: "-170", open: "-150" };
  odds.moneyLine.away = { close: "+142", open: "+130" };
  odds.pointSpread.home = {
    line: "-3.5",
    close: "-102",
    openLine: "-2.5",
    open: "-110",
  };
  odds.pointSpread.away = {
    line: "+3.5",
    close: "-118",
    openLine: "+2.5",
    open: "-110",
  };
  odds.total.over.close = { line: "o47.5", odds: "-110" };
  odds.total.under.close = { line: "u47.5", odds: "-110" };
  const { rows } = getOddsDisplay(odds);
  assert.deepEqual(
    rows.map((row) => row.key),
    ["moneyline", "spread", "total"],
  );
  assert.equal(rows[0].home?.value, "-170");
  assert.equal(rows[0].away?.value, "+142");
  assert.equal(rows[1].away?.value, "+3.5");
  assert.equal(rows[1].home?.price, "-102");
  assert.equal(rows[1].home?.opening, "Open -2.5 (-110)");
  assert.equal(rows[2].away?.value, "O 47.5");
  assert.equal(rows[2].home?.value, "U 47.5");
});

test("labels opening-only odds and leaves unavailable opposing prices empty", () => {
  const odds = emptyOdds();
  odds.moneyLine.home.open = "+150";
  odds.homeMoneyline = 150;
  const { rows } = getOddsDisplay(odds);
  assert.equal(rows[0].home?.value, "+150");
  assert.equal(rows[0].home?.isOpening, true);
  assert.equal(rows[0].away, null);
});

test("retains pick'em spreads and total-only markets without requiring a provider", () => {
  const odds = emptyOdds();
  odds.spread = 0;
  assert.equal(getOddsDisplay(odds).rows[0].away?.value, "PK");
  assert.equal(getOddsDisplay(odds).rows[0].home?.value, "PK");
  odds.spread = null;
  odds.overUnder = 47.5;
  assert.deepEqual(
    getOddsDisplay(odds).rows.map((row) => row.key),
    ["total"],
  );
});

test("uses favorite flags for legacy spreads without assuming the home team is favored", () => {
  const odds = emptyOdds();
  odds.spread = -3.5;
  odds.awayOdds.favorite = true;
  odds.homeOdds.underdog = true;
  odds.pointSpread.away.close = "-110";
  const { rows } = getOddsDisplay(odds);
  assert.equal(rows[0].away?.value, "-3.5");
  assert.equal(rows[0].home?.value, "+3.5");
  odds.awayOdds.favorite = null;
  assert.equal(getOddsDisplay(odds).rows[0].away?.value, "—");
});

test("keeps draws independent of team prices and omits empty markets", () => {
  const odds = emptyOdds();
  assert.deepEqual(getOddsDisplay(odds), { rows: [], draw: null });
  odds.moneyLine.draw.close = "+250";
  const display = getOddsDisplay(odds);
  assert.equal(display.draw?.value, "+250");
  assert.equal(display.rows.length, 0);
});
