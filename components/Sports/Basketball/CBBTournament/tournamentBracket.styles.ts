import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

import { BRACKET_LAYOUT } from "./tournamentBracket.utils";

export const tournamentBracketStyles = (isDark: boolean) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const mutedTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const cardBackground = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const boardBackground = isDark
    ? Colors.dark.transparentBackground
    : Colors.light.transparentBackground;
  const subtleBackground = isDark
    ? Colors.dark.transparentItemBackground
    : Colors.light.transparentItemBackground;
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
      gap: 14,
    },
    horizontalScrollContent: {
      flexGrow: 1,
      paddingHorizontal: 8,
      paddingBottom: 18,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 2,
      gap: 3,
    },
    tournamentName: {
      fontFamily: Fonts.BOLD,
      fontSize: 22,
      color: textColor,
    },
    tournamentMeta: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: mutedTextColor,
      textTransform: "uppercase",
    },
    warningBanner: {
      marginHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.gold : Colors.light.gold,
      backgroundColor: isDark
        ? Colors.dark.transparentGold
        : Colors.light.transparentGold,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    warningText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
    },
    bracketBoard: {
      position: "relative",
      backgroundColor: boardBackground,
      overflow: "visible",
    },
    bracketColumns: {
      flexDirection: "row",
      alignItems: "flex-start",
      overflow: "visible",
    },
    sideRegionStack: {
      overflow: "visible",
    },
    regionContainer: {
      overflow: "visible",
    },
    regionHeader: {
      height: BRACKET_LAYOUT.regionHeaderHeight,
      paddingHorizontal: 12,
      justifyContent: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
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
      height: BRACKET_LAYOUT.roundTitleHeight,
      paddingTop: 7,
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: mutedTextColor,
      textAlign: "center",
      textTransform: "uppercase",
    },
    roundMatchups: {
      alignItems: "center",
      overflow: "visible",
    },
    matchupCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor,
      backgroundColor: cardBackground,
      overflow: "hidden",
      justifyContent: "space-between",
      paddingHorizontal: 7,
      paddingVertical: 6,
    },
    matchupCardCompact: {
      minHeight: BRACKET_LAYOUT.gameCardHeight,
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
      flexDirection: "row",
      alignItems: "center",
      height: 21,
      gap: 5,
    },
    seedText: {
      width: 18,
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: mutedTextColor,
      textAlign: "center",
      fontVariant: ["tabular-nums"],
    },
    teamLogo: {
      width: 19,
      height: 19,
    },
    teamNameWrap: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    teamName: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: textColor,
    },
    teamRecord: {
      flexShrink: 0,
      maxWidth: 42,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: mutedTextColor,
    },
    placeholderName: {
      fontFamily: Fonts.REGULAR,
      color: mutedTextColor,
    },
    teamScore: {
      width: 32,
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: textColor,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    winnerText: {
      color: winnerColor,
    },
    loserText: {
      opacity: 0.5,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: separatorColor,
      marginVertical: 2,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      minHeight: 15,
    },
    statusText: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: mutedTextColor,
    },
    liveText: {
      color: liveColor,
      fontFamily: Fonts.BOLD,
    },
    broadcastText: {
      maxWidth: 66,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: mutedTextColor,
      textAlign: "right",
    },
    connectorLayer: {
      ...StyleSheet.absoluteFillObject,
      overflow: "visible",
    },
    connectorH: {
      position: "absolute",
      borderRadius: BRACKET_LAYOUT.connectorLineWidth,
    },
    connectorV: {
      position: "absolute",
      borderRadius: BRACKET_LAYOUT.connectorLineWidth,
    },
    championshipColumn: {
      width: BRACKET_LAYOUT.centerColumnWidth,
      alignItems: "center",
      overflow: "visible",
    },
    championshipLabel: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: BRACKET_LAYOUT.roundTitleHeight,
      paddingTop: 7,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: mutedTextColor,
      textAlign: "center",
      textTransform: "uppercase",
    },
    championPanel: {
      width: BRACKET_LAYOUT.gameCardWidth + 22,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: accentColor,
      backgroundColor: cardBackground,
      padding: 10,
    },
    championPanelOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
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
      paddingHorizontal: 16,
      gap: 10,
    },
    openingHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    openingTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: textColor,
    },
    openingCount: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: mutedTextColor,
    },
    openingScrollContent: {
      gap: 10,
      paddingRight: 16,
    },
    openingCardWrap: {
      width: BRACKET_LAYOUT.gameCardWidth,
      gap: 6,
    },
    advanceText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: mutedTextColor,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      gap: 6,
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
    skeletonCanvas: {
      position: "relative",
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 12,
    },
    skeletonRegion: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor,
      padding: 12,
      gap: 10,
      backgroundColor: subtleBackground,
    },
    skeletonRow: {
      flexDirection: "row",
      gap: 10,
    },
    skeletonBlock: {
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },
  });
};
