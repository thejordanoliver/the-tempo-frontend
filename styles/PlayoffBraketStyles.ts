import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const CARD_WIDTH = 176;
const CANVAS_HEIGHT = 840;
const COL_WIDTH = 220;
const COL_GAP = 20;
const LOGO_WIDTH = 360;
const LOGO_HEIGHT = 92;
const LOGO_TOP = 112;
const SIDE_LABEL_TOP = CANVAS_HEIGHT / 2 - 22;

const COLS = {
  WEST_R1: 0,
  WEST_R2: 1,
  WEST_R3: 2,
  FINALS: 3,
  EAST_R3: 4,
  EAST_R2: 5,
  EAST_R1: 6,
};

export const getX = (col: number) => col * (COL_WIDTH + COL_GAP);
const BRACKET_RIGHT_EDGE = getX(COLS.EAST_R1) + CARD_WIDTH;
const CANVAS_WIDTH = BRACKET_RIGHT_EDGE;
export const getColCenter = (col: number) => getX(col) + CARD_WIDTH / 2;
export const getCenteredX = (col: number, width: number) =>
  getColCenter(col) - width / 2;

export const playoffBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 14,
    },
    canvas: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },
    loadingState: {
      minHeight: 360,
      justifyContent: "center",
      alignItems: "center",
    },
    playoffsLogo: {
      position: "absolute",
      top: LOGO_TOP,
      left: CANVAS_WIDTH / 2 - LOGO_WIDTH / 2,
      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,
    },
    roundLabel: {
      position: "absolute",
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: Colors.midTone,
    },
    sideLabel: {
      position: "absolute",
      top: SIDE_LABEL_TOP,
      fontFamily: Fonts.OSBOLD,
      fontSize: 28,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    westLabel: {
      left: 300,
    },
    eastLabel: {
      right: 300,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },
    cardShell: {
      position: "absolute",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
      justifyContent: "space-around",
      elevation: 5,
    },
    finalsShell: {
      borderWidth: 1.5,
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    seedText: {
      width: 20,
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      textAlign: "center",
    },
    teamLogo: {
      width: 34,
      height: 34,
    },
    teamCode: {
      flex: 1,
      marginLeft: 4,
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
    },
    winsBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },
    score: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    winsText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 8,
      backgroundColor: Colors.midTone,
    },
    statusContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusWrapper: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    statusDivder: {
      height: 12,
      width: 1,
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    footerText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      textAlign: "center",
      color: Colors.midTone,
    },
    broadcast: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    period: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    clock: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      textAlign: "center",
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    liveContainer: {
      alignItems: "center",
    },
    liveStatusText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      textTransform: "uppercase",
    },
    liveScoreText: {
      marginTop: 2,
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
    },
    connectorH: {
      position: "absolute",
      height: 2,
    },
    connectorV: {
      position: "absolute",
      width: 2,
    },
  });
