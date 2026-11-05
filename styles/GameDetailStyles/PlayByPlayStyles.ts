import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const PlayByPlayStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {},
    wrapper: {
      gap: 6,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
      borderRadius: 8,
    },
    basketballWrapper: {
      gap: 4,
      padding: 10,
    },
    fieldFrame: {
      alignItems: "center",
      alignSelf: "stretch",
      marginTop: 2,
      overflow: "hidden",
    },
    headerContainer: {
      gap: 10,
    },
    headerRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 10,
    },
    headerIdentity: {
      flex: 1,
      flexBasis: 160,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minWidth: 120,
    },
    headerMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      columnGap: 12,
      rowGap: 4,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.gray : Colors.light.gray,
    },
    headerBadge: {
      flexShrink: 0,
    },
    headerLogoFrame: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    liveRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 22,
    },
    participantsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 8,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.dark.gray : Colors.light.gray,
    },
    participantItem: {
      flexGrow: 1,
      flexBasis: 120,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      minWidth: 120,
      maxWidth: "100%",
    },
    participantAvatar: {
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    participantHeadshot: {
      width: "100%",
      height: "100%",
    },
    participantInitials: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      lineHeight: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    participantTextGroup: {
      flexShrink: 1,
      minWidth: 0,
    },
    participantRole: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 0.5,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },
    participantName: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 13,
      lineHeight: 18,
      color: isDark ? Colors.white : Colors.black,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },

    divider: {
      width: 1,
      height: 18,
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.dark.gray : Colors.light.gray,
    },
    eyebrow: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },
    gameTime: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 18,
      lineHeight: 22,
      color: isDark ? Colors.white : Colors.black,
    },
    titleText: {
      flex: 1,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 22,
      lineHeight: 26,
      color: isDark ? Colors.white : Colors.black,
    },
    periodText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 18,
      lineHeight: 22,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    situationRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginTop: 4,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    situationItem: {
      flex: 1,
      minWidth: 90,
      gap: 2,
    },
    situationValue: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 18,
      lineHeight: 22,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    recentPlay: {
      gap: 6,
      paddingVertical: 10,
    },
    recentPlayDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.gray : Colors.light.gray,
    },
    recentPlayMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    recentPlayText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    fourthDown: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    scoringPlay: {
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    turnover: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.gray : Colors.light.gray,
    },

    detailText: {
      flex: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    headerLogo: {
      width: 30,
      height: 30,
      resizeMode: "contain",
    },
    playStatusBadge: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 24,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderRadius: 4,
      overflow: "hidden",
    },
    redZoneBadge: {
      borderColor: isDark ? Colors.dark.lightRed : Colors.light.red,
      backgroundColor: isDark ? Colors.light.red : Colors.dark.lightRed,
    },
    scoreBadge: {
      borderColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
      backgroundColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    baseballBadge: {
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    playStatusGlow: {
      ...StyleSheet.absoluteFill,
    },
    redZoneGlow: {
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    scoreGlow: {
      backgroundColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    baseballGlow: {
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    playStatusText: {
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 0.5,
      color: isDark ? Colors.dark.background : Colors.white,
    },
    redZoneStatusText: {
      color: Colors.white,
    },
  });
