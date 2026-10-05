import type { CardLayout } from "../types/football/nflBracketTypes";

export const CARD_WIDTH = 176;
export const CARD_HEIGHT = 142;

export const FINALS_WIDTH = 176;
export const FINALS_HEIGHT = 178;

const COL_WIDTH = 220;
const COL_GAP = 20;

export const COLS = {
  AFC_R1: 0,
  AFC_R2: 1,
  AFC_R3: 2,
  FINALS: 3,
  NFC_R3: 4,
  NFC_R2: 5,
  NFC_R1: 6,
} as const;

/*
 * Fallback connection layout for games whose teams
 * have not been determined yet.
 */
export const WILD_CARD_TO_DIVISIONAL: Record<number, number> = {
  0: 0,
  1: 1,
  2: 1,
};

export const getX = (column: number) => column * (COL_WIDTH + COL_GAP);

export const CANVAS_WIDTH = getX(COLS.NFC_R1) + CARD_WIDTH;

export const CANVAS_HEIGHT = 840;

export const SIDE_LABEL_TOP = CANVAS_HEIGHT / 2 - 22;

export const getColCenter = (column: number) => getX(column) + CARD_WIDTH / 2;

export const getCenteredX = (column: number, width: number) =>
  getColCenter(column) - width / 2;

export const centerY = (layout?: CardLayout) =>
  layout ? layout.y + layout.height / 2 : 0;
