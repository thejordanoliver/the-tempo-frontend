import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const CARD_WIDTH = 176;
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
};

export const getX = (col: number) => col * (COL_WIDTH + COL_GAP);

export const CANVAS_WIDTH = getX(COLS.NFC_R1) + CARD_WIDTH;
export const CANVAS_HEIGHT = 840;

export const nflPlayoffBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 14,
    },
    canvas: {
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
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
    },
    finalsShell: {
      borderWidth: 1.5,
    },
    roundLabel: {
      position: "absolute",
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: Colors.midTone,
    },
    sideLabel: {
      position: "absolute",
      top: 300,
      fontFamily: Fonts.OSBOLD,
      fontSize: 28,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    afcLabel: {
      left: 300,
    },
    nfcLabel: {
      right: 300,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
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
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 8,
      backgroundColor: Colors.midTone,
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
