import {
  BRACKET_LAYOUT,
  REGIONAL_SLOT_SEED_GROUPS,
  type RegionalRoundCode,
} from "./tournamentBracket.utils";

export const CARD_WIDTH = 176;
export const CARD_HEIGHT = 142;

export const REGIONAL_ROUNDS: readonly RegionalRoundCode[] = [
  "ROUND_OF_64",
  "ROUND_OF_32",
  "SWEET_16",
  "ELITE_8",
];

export const ROUND_LABELS: Record<RegionalRoundCode, string> = {
  ROUND_OF_64: "1st Round",
  ROUND_OF_32: "2nd Round",
  SWEET_16: "Sweet 16",
  ELITE_8: "Elite Eight",
};

export const BASE_MATCHUP_GAP = 40;

export const makeFirstRoundYs = (): number[] =>
  Array.from(
    { length: REGIONAL_SLOT_SEED_GROUPS.ROUND_OF_64.length },
    (_, index) => index * (CARD_HEIGHT + BASE_MATCHUP_GAP),
  );

export const centerBetween = (firstY: number, secondY: number): number => {
  const firstCenter = firstY + CARD_HEIGHT / 2;
  const secondCenter = secondY + CARD_HEIGHT / 2;

  return (firstCenter + secondCenter) / 2 - CARD_HEIGHT / 2;
};

export const makeNextRoundYs = (sourceYs: readonly number[]): number[] => {
  const result: number[] = [];

  for (let index = 0;index < sourceYs.length;index += 2) {
    const firstY = sourceYs[index];
    const secondY = sourceYs[index + 1];

    if (firstY === undefined || secondY === undefined) {
      continue;
    }

    result.push(centerBetween(firstY, secondY));
  }

  return result;
};

export const ROUND_OF_64_Y = makeFirstRoundYs();
export const ROUND_OF_32_Y = makeNextRoundYs(ROUND_OF_64_Y);
export const SWEET_16_Y = makeNextRoundYs(ROUND_OF_32_Y);
export const ELITE_8_Y = makeNextRoundYs(SWEET_16_Y);

export const ROUND_Y: Record<RegionalRoundCode, number[]> = {
  ROUND_OF_64: ROUND_OF_64_Y,
  ROUND_OF_32: ROUND_OF_32_Y,
  SWEET_16: SWEET_16_Y,
  ELITE_8: ELITE_8_Y,
};

export const REGION_BODY_HEIGHT =
  ROUND_OF_64_Y[ROUND_OF_64_Y.length - 1] + CARD_HEIGHT;

export const REGION_ROUNDS_WIDTH =
  BRACKET_LAYOUT.roundColumnWidth * REGIONAL_ROUNDS.length +
  BRACKET_LAYOUT.horizontalRoundGap * (REGIONAL_ROUNDS.length - 1);

export const CARD_LEFT_IN_COLUMN = Math.max(
  0,
  (BRACKET_LAYOUT.roundColumnWidth - CARD_WIDTH) / 2,
);

export const REGION_BLOCK_HEIGHT =
  BRACKET_LAYOUT.regionHeaderHeight + REGION_BODY_HEIGHT;
export const QUADRANT_VERTICAL_GAP = 72;
export const CENTER_STAGE_GAP = 40;
export const FINAL_STAGE_WIDTH = 680;
export const FINAL_STAGE_HEIGHT = 360;
export const FINAL_FOUR_Y = 16;
export const QUADRANT_BOARD_WIDTH =
  REGION_ROUNDS_WIDTH * 2 + FINAL_STAGE_WIDTH + CENTER_STAGE_GAP * 2;
export const QUADRANT_BOARD_HEIGHT = REGION_BLOCK_HEIGHT * 2 + QUADRANT_VERTICAL_GAP;

export const getRoundColumnX = (columnIndex: number): number =>
  columnIndex *
  (BRACKET_LAYOUT.roundColumnWidth + BRACKET_LAYOUT.horizontalRoundGap);
