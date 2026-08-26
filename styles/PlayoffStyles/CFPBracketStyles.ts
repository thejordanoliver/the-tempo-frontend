import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

import {
  BYE_CARD_HEIGHT,
  BYE_CARD_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARD_HEIGHT,
  CARD_WIDTH,
  CHAMPIONSHIP_CARD_HEIGHT,
  CHAMPIONSHIP_CARD_WIDTH,
} from "../../utils/cfpBracketLayout";

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

      fontSize: 13,

      fontFamily: Fonts.BOLD,

      letterSpacing: 1.2,
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

      borderWidth: 1,

      borderColor: isDark ? Colors.darkGray : Colors.lightGray,

      borderRadius: 10,

      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.06,

      shadowRadius: 10,

      elevation: 2,

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
      paddingTop: 6,
      paddingHorizontal: 12,
    },
    footerContainer: {
      alignItems: "center",
      justifyContent: "space-between",
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: 12,
    },

    statusText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: 10,
      fontFamily: Fonts.BOLD,
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    headline: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
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
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    finalStatusDivider: {
      width: 1,
      height: 10,
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    period: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
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
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    /*
    |--------------------------------------------------------------------------
    | Team Row
    |--------------------------------------------------------------------------
    */

    teamRow: {
      flex: 1,
      paddingHorizontal: 12,
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

      marginRight: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | Seed
    |--------------------------------------------------------------------------
    */

    seedContainer: {
      width: 25,

      alignItems: "flex-start",
    },

    seedPlaceholder: {
      width: 25,
    },

    seedText: {
      color: Colors.midTone,

      fontSize: 14,

      fontFamily: Fonts.BOLD,
    },

    /*
    |--------------------------------------------------------------------------
    | Logo
    |--------------------------------------------------------------------------
    */

    teamLogo: {
      width: 20,
      height: 20,
      marginRight: 10,
    },

    logoPlaceholder: {
      width: 31,

      height: 31,

      borderRadius: 16,

      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,

      marginRight: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | Team Name
    |--------------------------------------------------------------------------
    */

    teamName: {
      flex: 1,

      color: isDark ? Colors.white : Colors.black,

      fontSize: 14,

      fontFamily: Fonts.BOLD,
    },

    tbdText: {
      color: Colors.midTone,

      fontSize: 14,

      fontFamily: Fonts.MEDIUM,
    },

    /*
    |--------------------------------------------------------------------------
    | Score
    |--------------------------------------------------------------------------
    */

    score: {
      minWidth: 24,

      color: isDark ? Colors.white : Colors.black,

      fontSize: 15,

      fontFamily: Fonts.BOLD,

      textAlign: "right",
    },

    scorePlaceholder: {
      color: Colors.midTone,

      fontSize: 15,

      fontFamily: Fonts.REGULAR,
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

      marginHorizontal: 12,

      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
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

      borderWidth: 1,

      borderColor: isDark ? Colors.darkGray : Colors.lightGray,

      borderRadius: 10,

      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      justifyContent: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.05,

      shadowRadius: 8,

      elevation: 2,
    },

    byeTeamContent: {
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 12,
    },

    byeSeedContainer: {
      width: 27,

      alignItems: "flex-start",
    },

    byeSeed: {
      color: Colors.midTone,

      fontSize: 14,

      fontFamily: Fonts.BOLD,
    },

    byeLogo: {
      width: 38,

      height: 38,

      marginRight: 10,
    },

    byeLogoPlaceholder: {
      width: 38,

      height: 38,

      borderRadius: 19,

      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,

      marginRight: 10,
    },

    byeTeamName: {
      flex: 1,

      color: isDark ? Colors.white : Colors.black,

      fontSize: 14,

      fontFamily: Fonts.BOLD,
    },

    byeLabel: {
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

      borderRadius: 14,

      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      alignItems: "center",

      justifyContent: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.07,

      shadowRadius: 12,

      elevation: 3,
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

      height: 1,

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
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 18,

      width: "100%",
    },

    championLogo: {
      width: 42,

      height: 42,

      marginRight: 10,
    },

    championTextContainer: {
      flex: 1,
    },

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

      bottom: 12,

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
