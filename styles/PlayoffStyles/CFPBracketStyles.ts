import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

/*
|--------------------------------------------------------------------------
| Layout
|--------------------------------------------------------------------------
*/

export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 1250;

export const CARD_WIDTH = 176;
export const CARD_HEIGHT = 142;

export const BYE_CARD_WIDTH = CARD_WIDTH;
export const BYE_CARD_HEIGHT = 88;

export const CHAMPIONSHIP_CARD_WIDTH = 250;
export const CHAMPIONSHIP_CARD_HEIGHT = 260;

export const FIRST_ROUND_X = 30;
export const QUARTERFINAL_X = 430;
export const SEMIFINAL_X = 825;
export const CHAMPIONSHIP_X = 1220;

export const FIRST_ROUND_Y = [90, 350, 610, 870];

export const BYE_Y = [245, 505, 765, 1025];

export const QUARTERFINAL_Y = [165, 425, 685, 945];

export const SEMIFINAL_Y = [300, 820];

export const CHAMPIONSHIP_Y = 510;

const HORIZONTAL_SNAP_OFFSET = 20;

export const snapBracketOffsets = [
  FIRST_ROUND_X,
  QUARTERFINAL_X,
  SEMIFINAL_X,
  CHAMPIONSHIP_X,
].map((x) => Math.max(0, x - HORIZONTAL_SNAP_OFFSET));

/*
|--------------------------------------------------------------------------
| Layout Helpers
|--------------------------------------------------------------------------
*/

export function getGameCardCenterY(y: number) {
  return y + CARD_HEIGHT / 2;
}

export function getByeCardCenterY(y: number) {
  return y + BYE_CARD_HEIGHT / 2;
}

export function buildMergeConnectorPath(
  topStartX: number,
  topStartY: number,
  bottomStartX: number,
  bottomStartY: number,
  endX: number,
  endY: number,
) {
  const furthestStartX = Math.max(topStartX, bottomStartX);

  const mergeX = furthestStartX + (endX - furthestStartX) * 0.5;

  return `
    M ${topStartX} ${topStartY}
    H ${mergeX}

    M ${bottomStartX} ${bottomStartY}
    H ${mergeX}

    M ${mergeX} ${topStartY}
    V ${bottomStartY}

    M ${mergeX} ${endY}
    H ${endX}
  `;
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

export const CFPBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    /*
    |--------------------------------------------------------------------------
    | Container
    |--------------------------------------------------------------------------
    */

    wrapper: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
    },

    canvas: {
      position: "relative",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },

    /*
    |--------------------------------------------------------------------------
    | Loading / Error / Empty
    |--------------------------------------------------------------------------
    */

    stateContainer: {
      minHeight: 300,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },

    stateText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      textAlign: "center",
    },

    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 14,
    },

    retryButton: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.midTone,
    },

    retryText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
    },

    refreshingBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    refreshingText: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | Round Header
    |--------------------------------------------------------------------------
    */

    roundHeader: {
      position: "absolute",
      top: 20,
      alignItems: "center",
    },

    roundTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
    },

    championshipRoundTitle: {
      color: isDark ? Colors.dark.gold : Colors.light.gold,
    },

    roundDate: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      marginTop: 7,
    },

    /*
    |--------------------------------------------------------------------------
    | Game Card
    |--------------------------------------------------------------------------
    */

    gameCard: {
      position: "absolute",
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      justifyContent: "space-around",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      elevation: 5,
      overflow: "hidden",
    },

    pressedCard: {
      opacity: 0.72,
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

    footerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    statusText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      textTransform: "uppercase",
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    headline: {
      fontFamily: Fonts.REGULAR,
      fontSize: 8,
      color: Colors.midTone,
      textAlign: "center",
    },

    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    downDistance: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: Colors.midTone,
      textAlign: "center",
    },

    statusDivider: {
      width: 1,
      height: 10,
      marginHorizontal: 3,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    finalStatusDivider: {
      width: 1,
      height: 10,
      marginHorizontal: 3,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    period: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    finalText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    clock: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    broadcast: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    /*
    |--------------------------------------------------------------------------
    | Team Row
    |--------------------------------------------------------------------------
    */

    teamRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    teamPressed: {
      opacity: 0.65,
    },

    teamInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
    },

    /*
    |--------------------------------------------------------------------------
    | Seed
    |--------------------------------------------------------------------------
    */

    seedContainer: {
      width: 22,
      alignItems: "center",
    },

    seedPlaceholder: {
      width: 22,
    },

    seedText: {
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },

    /*
    |--------------------------------------------------------------------------
    | Logo
    |--------------------------------------------------------------------------
    */

    teamLogo: {
      width: 30,
      height: 30,
      marginRight: 8,
    },

    logoPlaceholder: {
      width: 30,
      height: 30,
      marginRight: 8,
      borderRadius: 15,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    /*
    |--------------------------------------------------------------------------
    | Team Name
    |--------------------------------------------------------------------------
    */

    teamName: {
      flex: 1,
      marginRight: 6,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
    },

    tbdText: {
      flex: 1,
      marginRight: 6,
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
    },

    /*
    |--------------------------------------------------------------------------
    | Score
    |--------------------------------------------------------------------------
    */

    score: {
      minWidth: 22,
      marginLeft: 4,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },

    scorePlaceholder: {
      minWidth: 22,
      marginLeft: 4,
      color: Colors.midTone,
      fontSize: 18,
      fontFamily: Fonts.REGULAR,
      textAlign: "center",
    },

    winnerText: {
      color: isDark ? Colors.light.gold : Colors.dark.gold,
      fontFamily: Fonts.BOLD,
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
    | Bye Card
    |--------------------------------------------------------------------------
    */

    byeCard: {
      position: "absolute",
      width: BYE_CARD_WIDTH,
      height: BYE_CARD_HEIGHT,
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      elevation: 5,
    },

    byeTeamContent: {
      flexDirection: "row",
      alignItems: "center",
    },

    byeSeedContainer: {
      width: 22,

      alignItems: "center",
    },

    byeSeed: {
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },

    byeLogo: {
      width: 30,
      height: 30,
      marginRight: 8,
    },

    byeLogoPlaceholder: {
      width: 30,
      height: 30,
      marginRight: 8,
      borderRadius: 15,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    byeTeamName: {
      flex: 1,
      marginRight: 8,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
    },

    byeLabel: {
      marginLeft: 4,
      color: Colors.midTone,
      fontSize: 14,
      fontFamily: Fonts.BOLD,
    },

    /*
    |--------------------------------------------------------------------------
    | Championship
    |--------------------------------------------------------------------------
    */

    championshipCard: {
      position: "absolute",
      width: CHAMPIONSHIP_CARD_WIDTH,
      height: CHAMPIONSHIP_CARD_HEIGHT,
      borderWidth: 1.5,
      borderColor: isDark ? Colors.dark.gold : Colors.light.gold,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      alignItems: "center",
      justifyContent: "center",

      elevation: 5,
    },

    /*
    |--------------------------------------------------------------------------
    | CFP Logo
    |--------------------------------------------------------------------------
    */

    cfpLogo: {
      width: 62,
      height: 70,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },

    championshipLabel: {
      color: isDark ? Colors.dark.gold : Colors.light.gold,
      fontSize: 13,
      fontFamily: Fonts.BOLD,
      letterSpacing: 0.8,
    },

    championshipDivider: {
      width: 115,
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.dark.gold : Colors.light.gold,
      marginVertical: 16,
    },

    championshipTeams: {
      width: "100%",
      height: 90,
    },

    /*
    |--------------------------------------------------------------------------
    | Champion
    |--------------------------------------------------------------------------
    */

    championTeam: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    championLogo: {
      width: 42,
      height: 42,
    },

    championTextContainer: {},

    championName: {
      color: isDark ? Colors.dark.gold : Colors.light.gold,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
    },

    championSubtext: {
      color: isDark ? Colors.light.gold : Colors.dark.gold,
      fontSize: 8,
      fontFamily: Fonts.BOLD,
      letterSpacing: 0.7,
      marginTop: 3,
    },

    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    infoBadge: {
      position: "absolute",

      bottom: 90,
      left: CANVAS_WIDTH / 2 - 140,

      minWidth: 280,
      height: 38,

      paddingHorizontal: 16,

      borderRadius: 19,

      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,

      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    infoIcon: {
      color: Colors.midTone,
      fontSize: 14,
      marginRight: 7,
    },

    infoText: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
    },

    infoDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: Colors.midTone,
      marginHorizontal: 9,
    },
  });
