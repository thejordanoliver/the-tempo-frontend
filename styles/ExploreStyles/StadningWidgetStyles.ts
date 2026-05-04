import { StyleSheet } from "react-native";
import { Fonts, Colors } from "constants/styles";

export const standingsWidgetStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 8,
      padding: compact ? 10 : 14,
      gap: compact ? 8 : 10,
      borderColor: Colors.midTone,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      flexShrink: 0,
    },
    titleWrap: {
      flex: 1,
      minWidth: 0,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 7 : 10,
      flexShrink: 0,
    },
    title: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: compact ? 15 : 18,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    linkText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    removeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    // League button rail
    chipScroll: {
      flexGrow: 0,
      flexShrink: 0,
      height: compact ? 30 : 34,
      maxHeight: compact ? 30 : 34,
    },
    chips: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 6 : 8,
      paddingRight: compact ? 4 : 6,
    },
    chip: {
      minHeight: compact ? 26 : 30,
      borderRadius: 8,
      paddingHorizontal: compact ? 9 : 12,
      paddingVertical: compact ? 4 : 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    selectedChip: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    chipText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: compact ? 10 : 11,
      lineHeight: compact ? 13 : 15,
      color: isDark ? Colors.white : Colors.black,
    },
    selectedChipText: {
      color: isDark ? Colors.black : Colors.white,
    },

    animatedContent: {
      flex: 1,
      minHeight: 0,
    },
    contentArea: {
      flex: 1,
      minHeight: 0,
    },
    contentScroll: {
      flex: 1,
      minHeight: 0,
    },
    flatContent: {
      flexGrow: 1,
    },
    groupedContent: {
      flexGrow: 1,
    },
    conferenceSection: {
      minHeight: 0,
    },
    conferenceTitle: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: compact ? 10 : 11,
      lineHeight: compact ? 13 : 15,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },
    table: {
      gap: 4,
      minHeight: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 5 : 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    rank: {
      width: compact ? 18 : 24,
      fontFamily: Fonts.OSBOLD,
      fontSize: compact ? 11 : 13,
      color: isDark ? Colors.white : Colors.black,
    },
    logo: {
      width: compact ? 20 : 24,
      height: compact ? 20 : 24,
      resizeMode: "contain",
    },
    logoFallback: {
      width: compact ? 20 : 24,
      height: compact ? 20 : 24,
      borderRadius: compact ? 10 : 12,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamName: {
      flex: 1,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: compact ? 11 : 13,
      color: isDark ? Colors.white : Colors.black,
    },
    record: {
      width: compact ? 40 : 52,
      textAlign: "right",
      fontFamily: Fonts.OSMEDIUM,
      fontSize: compact ? 10 : 12,
      color: isDark ? Colors.white : Colors.black,
    },
    meta: {
      width: 48,
      textAlign: "right",
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    stateCard: {
      minHeight: 76,
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    stateText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
