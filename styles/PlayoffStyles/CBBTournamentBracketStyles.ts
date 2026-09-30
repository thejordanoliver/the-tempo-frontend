import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

import { BRACKET_LAYOUT } from "../../utils/tournamentBracket.utils";
export const CARD_WIDTH = 176;
export const CARD_HEIGHT = 142;

export const CBBTournamentBracketStyles = (isDark: boolean) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const mutedTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const cardBackground = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const boardBackground = isDark
    ? Colors.dark.transparentBackground
    : Colors.light.transparentBackground;
  const borderColor = isDark ? Colors.darkGray : Colors.lightGray;
  const separatorColor = isDark
    ? Colors.transparentLightGray
    : Colors.transparentDarkGray;
  const liveColor = isDark ? Colors.dark.lightRed : Colors.light.red;
  const accentColor = isDark ? Colors.dark.gold : Colors.light.gold;
  const winnerColor = isDark ? Colors.white : Colors.black;

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    verticalScrollContent: {
      paddingTop: 8,
      paddingBottom: 112,
    },

    horizontalScrollContent: {
      alignItems: "center",
      paddingVertical: 4,
    },
    header: {
      gap: 3,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 2,
    },
    tournamentName: {
      fontFamily: Fonts.BOLD,
      fontSize: 22,
      color: textColor,
    },
    bracketBoard: {
      position: "relative",
      backgroundColor: boardBackground,
      overflow: "visible",
    },
    regionContainer: {
      overflow: "visible",
    },

    regionTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      color: textColor,
      textTransform: "uppercase",
    },
    regionRounds: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: BRACKET_LAYOUT.horizontalRoundGap,
      overflow: "visible",
    },
    roundColumn: {
      width: BRACKET_LAYOUT.roundColumnWidth,
      overflow: "visible",
    },
    roundLabel: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      height: BRACKET_LAYOUT.roundTitleHeight,
      paddingVertical: 7,
      textAlign: "center",
    },
    roundMatchups: {
      alignItems: "center",
      overflow: "visible",
    },
    matchupCard: {
      justifyContent: "space-between",
      paddingHorizontal: 7,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor,
      borderRadius: 16,
      backgroundColor: cardBackground,
      overflow: "hidden",
    },
    matchupCardCompact: {
      minHeight: CARD_HEIGHT,
    },
    championshipCard: {
      borderColor: accentColor,
      backgroundColor: isDark
        ? Colors.dark.transparentGold
        : Colors.light.transparentGold,
    },
    cardDisabled: {
      opacity: 0.9,
    },
    teamRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    teamInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
    },

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

    teamLogo: {
      width: 30,
      height: 30,
      marginRight: 8,
    },
    teamNameWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      minWidth: 0,
    },
    teamName: {
      flex: 1,
      marginRight: 6,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
    },
    placeholderName: {
      fontFamily: Fonts.REGULAR,
      color: mutedTextColor,
    },
    score: {
      minWidth: 22,
      marginLeft: 4,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },
    winnerText: {
      color: winnerColor,
    },
    loserText: {
      opacity: 0.5,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 2,
      backgroundColor: separatorColor,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      minHeight: 15,
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
    broadcast: {
      maxWidth: 66,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: mutedTextColor,
      textAlign: "left",
    },
    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: textColor,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: liveColor,
      textAlign: "center",
    },
    championshipLabel: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      height: BRACKET_LAYOUT.roundTitleHeight,
      paddingTop: 7,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: mutedTextColor,
      textAlign: "center",
      textTransform: "uppercase",
    },
    championPanel: {
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      width: CARD_WIDTH + 22,
      padding: 10,
      borderWidth: 1,
      borderColor: accentColor,
      borderRadius: 8,
      backgroundColor: cardBackground,
    },
    championPanelOverlay: {
      position: "absolute",
      right: 0,
      left: 0,
      alignItems: "center",
    },
    championLogo: {
      width: 42,
      height: 42,
    },
    championLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: mutedTextColor,
      textTransform: "uppercase",
    },
    championName: {
      width: "100%",
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      color: textColor,
      textAlign: "center",
    },
    championMeta: {
      width: "100%",
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: mutedTextColor,
      textAlign: "center",
    },
    openingSection: {
      gap: 12,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 24,
    },
    openingHeaderRow: {
      alignItems: "center",
      justifyContent: "center",
    },
    openingTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: textColor,
      width: "100%",
      textTransform: "uppercase",
    },
    openingGamesRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-around",
    },
    openingCardWrap: {
      gap: 6,
      width: CARD_WIDTH,
    },
    advanceText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: mutedTextColor,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: 20,
    },
    emptyTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: textColor,
      textAlign: "center",
    },
    emptyBody: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: mutedTextColor,
      textAlign: "center",
    },
    retryText: {
      marginTop: 8,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },
    skeletonRow: {
      flexDirection: "row",
      gap: 10,
    },
  });
};
