import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const CARD_WIDTH = 176;
export const CARD_HEIGHT = 150;

export const CANVAS_HEIGHT = 840;
export const CANVAS_SIDE_PADDING = 40;

export const COL_WIDTH = 220;
export const COL_GAP = 20;

export const LOGO_WIDTH = 360;
export const LOGO_HEIGHT = 150;
export const LOGO_TOP = 112;

export const SIDE_LABEL_TOP = CANVAS_HEIGHT / 2 - 22;

export const ROUND2_WIDTH = 176;
export const ROUND3_WIDTH = 176;
export const FINALS_WIDTH = 176;

export const ROUND2_HEIGHT = 142;
export const ROUND3_HEIGHT = 142;
export const FINALS_HEIGHT = 178;

export const LABEL_WIDTH = 200;
export const LABEL_TOP = 28;

const HORIZONTAL_SNAP_OFFSET = 20;

export const COLS = {
  WEST_R1: 0,
  WEST_R2: 1,
  WEST_R3: 2,
  FINALS: 3,
  EAST_R3: 4,
  EAST_R2: 5,
  EAST_R1: 6,
} as const;

export const getX = (col: number) =>
  CANVAS_SIDE_PADDING + col * (COL_WIDTH + COL_GAP);

const BRACKET_RIGHT_EDGE = getX(COLS.EAST_R1) + CARD_WIDTH;

export const CANVAS_WIDTH = BRACKET_RIGHT_EDGE + CANVAS_SIDE_PADDING;

export const getColCenter = (col: number) => getX(col) + CARD_WIDTH / 2;

export const getCenteredX = (col: number, width: number) =>
  getColCenter(col) - width / 2;

export const snapBracketOffsets = [
  getX(COLS.WEST_R1),
  getX(COLS.WEST_R2),
  getX(COLS.WEST_R3),
  getCenteredX(COLS.FINALS, FINALS_WIDTH),
].map((x) => Math.max(0, x - HORIZONTAL_SNAP_OFFSET));

export const NBAPlayoffBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingBottom: 100,
    },

    canvas: {
      position: "relative",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },

    roundHeader: {
      position: "absolute",
      alignItems: "center",
    },

    roundTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      textAlign: "center",
    },

    sideLabel: {
      position: "absolute",
      top: SIDE_LABEL_TOP,
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    westLabel: {
      left: CANVAS_SIDE_PADDING + 300,
    },

    eastLabel: {
      right: CANVAS_SIDE_PADDING + 300,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    cardShell: {
      position: "absolute",
      justifyContent: "space-around",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderRadius: 16,
      elevation: 5,
    },

    finalsShell: {
      borderWidth: 1.5,
    },

    teamRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    seedText: {
      width: 20,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      textAlign: "center",
    },

    teamLogo: {
      width: 28,
      height: 28,
    },

    teamCode: {
      flex: 1,
      marginLeft: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
    },

    winsBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 100,
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },

    score: {
      minWidth: 22,
      marginLeft: 4,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },

    winsText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 8,
      backgroundColor: Colors.midTone,
    },

    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    statusWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    statusDivider: {
      width: 1,
      height: 10,
      marginHorizontal: 3,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    footerText: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      textAlign: "center",
    },

    broadcast: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },

    period: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },

    date: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },

    clock: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },

    connectorH: {
      position: "absolute",
      height: 1,
    },

    connectorV: {
      position: "absolute",
      width: 1,
    },
  });
