import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  FINALS_HEIGHT,
} from "./NBAPlayoffBraketStyles";

const ROUND_COUNT = 3;
const FINALS_ROUND_INDEX = ROUND_COUNT - 1;
const HORIZONTAL_PADDING = 16;
const ROUND_GAP = 50;
const FIRST_ROUND_TOP = 64;
const FIRST_ROUND_SPACING = 176;
const FIRST_ROUND_SERIES_COUNT = 4;

export const getWNBARoundX = (roundIndex: number) =>
  HORIZONTAL_PADDING + roundIndex * (CARD_WIDTH + ROUND_GAP);

const getSeriesCenterY = (roundIndex: number, seriesIndex: number) => {
  const roundSpacing = FIRST_ROUND_SPACING * 2 ** roundIndex;
  const roundOffset = ((2 ** roundIndex - 1) * FIRST_ROUND_SPACING) / 2;

  return (
    FIRST_ROUND_TOP + roundOffset + seriesIndex * roundSpacing + CARD_HEIGHT / 2
  );
};

export function getWNBASeriesLayout(roundIndex: number, seriesIndex: number) {
  const height =
    roundIndex === FINALS_ROUND_INDEX ? FINALS_HEIGHT : CARD_HEIGHT;

  return {
    x: getWNBARoundX(roundIndex),
    y: getSeriesCenterY(roundIndex, seriesIndex) - height / 2,
    width: CARD_WIDTH,
    height,
  };
}

export const WNBA_BRACKET_CONNECTORS = Array.from(
  { length: ROUND_COUNT - 1 },
  (_, roundIndex) => {
    const nextRoundSeriesCount =
      FIRST_ROUND_SERIES_COUNT / 2 ** (roundIndex + 1);

    return Array.from({ length: nextRoundSeriesCount }, (_, seriesIndex) => {
      const top = getSeriesCenterY(roundIndex, seriesIndex * 2);
      const bottom = getSeriesCenterY(roundIndex, seriesIndex * 2 + 1);
      const left = getWNBARoundX(roundIndex) + CARD_WIDTH;
      const halfGap = ROUND_GAP / 2;

      return {
        id: `${roundIndex}-${seriesIndex}`,
        fork: { left, top, width: halfGap, height: bottom - top },
        stem: { left: left + halfGap, top: (top + bottom) / 2, width: halfGap },
      };
    });
  },
).flat();

export const WNBAPlayoffBracketStyles = (isDark?: boolean) =>
  StyleSheet.create({
    container: {
      paddingBottom: 100,
    },

    heading: { marginHorizontal: 16, marginBottom: 12 },
    skeletons: { gap: 12, marginHorizontal: 12 },
    canvas: {
      width:
        ROUND_COUNT * CARD_WIDTH +
        (ROUND_COUNT - 1) * ROUND_GAP +
        2 * HORIZONTAL_PADDING,
      height: 780,
    },
    roundTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      textAlign: "center",
      position: "absolute",
      top: 20,
      width: CARD_WIDTH,
    },

    seriesCard: { position: "absolute" },
    connectorFork: {
      position: "absolute",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    connectorStem: {
      position: "absolute",
      height: 1,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
