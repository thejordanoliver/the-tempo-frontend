import assert from "node:assert/strict";
import test from "node:test";
import type { PlayoffLeague } from "../types/playoffs";
import {
  BRACKET_CARD_HEIGHT,
  BRACKET_CARD_WIDTH,
  BRACKET_HEADER_HEIGHT,
} from "../utils/playoffs/bracketLayout";
import { getBracketSkeletonLayout } from "../utils/playoffs/bracketSkeletonLayout";

for (const league of ["mlb", "nba", "wnba", "nfl", "nhl"] as PlayoffLeague[]) {
  test(`${league} skeleton has connected rounds, correct bye cards, and no overlapping placeholders`, () => {
    const layout = getBracketSkeletonLayout(league);
    const expected = league === "wnba" ? [4, 2, 1] : [8, 4, 2, 1];
    const nodesByKey = new Map(layout.nodes.map((node) => [node.key, node]));
    assert.equal(layout.roundCount, expected.length);
    assert.equal(
      layout.nodes.filter((node) => node.isBye).length,
      league === "mlb" ? 4 : league === "nfl" ? 2 : 0,
    );
    expected.forEach((count, roundIndex) => {
      const column = layout.nodes
        .filter((node) => node.roundIndex === roundIndex)
        .sort((a, b) => a.x - b.x || a.y - b.y);
      assert.equal(column.length, count);
      column.forEach((node, index) => {
        assert.ok(node.y >= 0);
        assert.ok(node.x + BRACKET_CARD_WIDTH <= layout.width);
        assert.ok(
          node.y + BRACKET_HEADER_HEIGHT + BRACKET_CARD_HEIGHT <= layout.height,
        );
        const previous = column
          .slice(0, index)
          .filter((other) => other.x === node.x)
          .at(-1);
        if (previous) assert.ok(node.y >= previous.y + BRACKET_CARD_HEIGHT);
        if (roundIndex < expected.length - 1) {
          assert.equal(
            nodesByKey.get(node.nextKey!)?.roundIndex,
            roundIndex + 1,
          );
        } else assert.equal(node.nextKey, null);
      });
    });
  });
}
