import { CardLayout } from "@/types/basketball/basketball";
import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

/*
|--------------------------------------------------------------------------
| Layout
|--------------------------------------------------------------------------
*/

export const CARD_WIDTH = 176;
export const CARD_HEIGHT = 142;

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

export const LABEL_WIDTH = 180;
export const LABEL_TOP = 28;

const HORIZONTAL_SNAP_OFFSET = 20;

/*
|--------------------------------------------------------------------------
| Columns
|--------------------------------------------------------------------------
*/

export const COLS = {
  WEST_R1: 0,
  WEST_R2: 1,
  WEST_R3: 2,
  FINALS: 3,
  EAST_R3: 4,
  EAST_R2: 5,
  EAST_R1: 6,
} as const;

/*
|--------------------------------------------------------------------------
| Layout Helpers
|--------------------------------------------------------------------------
*/

export const getX = (col: number) =>
  CANVAS_SIDE_PADDING + col * (COL_WIDTH + COL_GAP);

const BRACKET_RIGHT_EDGE = getX(COLS.EAST_R1) + CARD_WIDTH;

export const CANVAS_WIDTH = BRACKET_RIGHT_EDGE + CANVAS_SIDE_PADDING;

export const getColCenter = (col: number) => getX(col) + CARD_WIDTH / 2;

export const getCenteredX = (col: number, width: number) =>
  getColCenter(col) - width / 2;

export const centerY = (layout?: CardLayout) =>
  layout ? layout.y + layout.height / 2 : 0;

export const rightX = (layout: CardLayout) => layout.x + layout.width;

/*
|--------------------------------------------------------------------------
| Snap Offsets
|--------------------------------------------------------------------------
*/

export const snapBracketOffsets = [
  getX(COLS.WEST_R1),
  getX(COLS.WEST_R2),
  getX(COLS.WEST_R3),
  getCenteredX(COLS.FINALS, FINALS_WIDTH),
].map((x) => Math.max(0, x - HORIZONTAL_SNAP_OFFSET));

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

export const NBAPlayoffBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    /*
    |--------------------------------------------------------------------------
    | Container
    |--------------------------------------------------------------------------
    */

    container: {
      paddingHorizontal: 12,
    },

    canvas: {
      position: "relative",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    loadingState: {
      minHeight: 360,
      alignItems: "center",
      justifyContent: "center",
    },

    /*
    |--------------------------------------------------------------------------
    | Playoffs Logo
    |--------------------------------------------------------------------------
    */

    playoffsLogo: {
      position: "absolute",

      top: LOGO_TOP,
      left: CANVAS_WIDTH / 2 - LOGO_WIDTH / 2,

      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,
    },

    /*
    |--------------------------------------------------------------------------
    | Round Header
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Conference Labels
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Card
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Team Row
    |--------------------------------------------------------------------------
    */

    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    /*
    |--------------------------------------------------------------------------
    | Seed
    |--------------------------------------------------------------------------
    */

    seedText: {
      width: 20,

      fontFamily: Fonts.BOLD,
      fontSize: 18,

      textAlign: "center",
    },

    /*
    |--------------------------------------------------------------------------
    | Team Logo
    |--------------------------------------------------------------------------
    */

    teamLogo: {
      width: 34,
      height: 34,
    },

    /*
    |--------------------------------------------------------------------------
    | Team Code
    |--------------------------------------------------------------------------
    */

    teamCode: {
      flex: 1,
      marginLeft: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
    },

    /*
    |--------------------------------------------------------------------------
    | Wins / Score
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Divider
    |--------------------------------------------------------------------------
    */

    divider: {
      height: StyleSheet.hairlineWidth,

      marginVertical: 8,

      backgroundColor: Colors.midTone,
    },

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Live
    |--------------------------------------------------------------------------
    */

    liveContainer: {
      alignItems: "center",
    },

    liveStatusText: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      textTransform: "uppercase",
    },

    liveScoreText: {
      marginTop: 2,

      fontFamily: Fonts.BOLD,
      fontSize: 16,
    },

    /*
    |--------------------------------------------------------------------------
    | Connectors
    |--------------------------------------------------------------------------
    */

    connectorH: {
      position: "absolute",
      height: 1,
    },

    connectorV: {
      position: "absolute",
      width: 1,
    },
  });
