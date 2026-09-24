import { activeOpacity, Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const collegePollSettingsStyles = (isDark: boolean) =>
  StyleSheet.create({
    background: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    handle: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    handleIndicator: {
      width: 38,
      backgroundColor: Colors.midTone,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingTop: 4,
      paddingBottom: 14,
    },
    headerCopy: {
      flex: 1,
    },
    title: {
      textAlign: "center",
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      textAlign: "center",
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    sectionLabel: {
      paddingTop: 8,
      paddingBottom: 8,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 13,
      color: Colors.midTone,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    sportRow: {
      flexDirection: "row",
      gap: 10,
      paddingBottom: 12,
    },
    sportOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 54,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 17,
    },
    optionSelected: {
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    logo: {
      width: 28,
      height: 28,
    },
    sportText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },
    pollOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 52,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    pollOptionSelected: {
      borderBottomColor: isDark ? Colors.white : Colors.black,
    },
    pollText: {
      flex: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 68,
      paddingHorizontal: 4,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    settingCopy: {
      flex: 1,
      gap: 2,
    },
    settingTitle: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    settingDescription: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    pressed: {
      opacity: activeOpacity,
    },
  });
