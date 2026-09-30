import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const CARD_WIDTH = 176;
const CANVAS_SIDE_PADDING = 12;

const COL_WIDTH = 220;
const COL_GAP = 20;

const LOGO_WIDTH = 360;
const LOGO_HEIGHT = 92;
const LOGO_TOP = 112;

const COLS = {
  AFC_R1: 0,
  AFC_R2: 1,
  AFC_R3: 2,
  FINALS: 3,
  NFC_R3: 4,
  NFC_R2: 5,
  NFC_R1: 6,
} as const;

const getX = (col: number) =>
  CANVAS_SIDE_PADDING + col * (COL_WIDTH + COL_GAP);

const BRACKET_RIGHT_EDGE = getX(COLS.NFC_R1) + CARD_WIDTH;

const CANVAS_WIDTH = BRACKET_RIGHT_EDGE + CANVAS_SIDE_PADDING;

const CANVAS_HEIGHT = 840;

export const NFLPlayoffBracketStyles = (isDark: boolean) =>
  StyleSheet.create({

    container: {
      paddingHorizontal: 12,
    },

    canvas: {
      position: "relative",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },


    playoffsLogo: {
      position: "absolute",

      top: LOGO_TOP,
      left: CANVAS_WIDTH / 2 - LOGO_WIDTH / 2,

      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,

      resizeMode: "contain",
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


    roundHeader: {
      position: "absolute",
      top: 0,
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

      top: 300,

      fontFamily: Fonts.BOLD,
      fontSize: 28,

      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    afcLabel: {
      left: CANVAS_SIDE_PADDING + 300,
    },

    nfcLabel: {
      right: CANVAS_SIDE_PADDING + 300,

      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },


    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },


    seedText: {
      width: 20,

      fontFamily: Fonts.BOLD,
      fontSize: 18,

      color: isDark ? Colors.white : Colors.black,

      textAlign: "center",
    },


    teamLogo: {
      width: 34,
      height: 34,
    },


    teamCode: {
      flex: 1,

      marginLeft: 4,

      fontFamily: Fonts.BOLD,
      fontSize: 18,

      color: isDark ? Colors.white : Colors.black,
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

      fontFamily: Fonts.BOLD,
      fontSize: 18,

      color: isDark ? Colors.white : Colors.black,

      textAlign: "center",
    },


    divider: {
      height: StyleSheet.hairlineWidth,

      marginVertical: 8,

      backgroundColor: Colors.midTone,
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
