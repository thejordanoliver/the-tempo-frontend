import {
  activeOpacity,
  Colors,
  Fonts,
  MIN_TOUCH_TARGET,
} from "constants/styles";
import { StyleSheet } from "react-native";

export const settingsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      position: "relative",
      flex: 1,
    },

    wrapper: {
      paddingHorizontal: 12,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 20,
      paddingBottom: 40,
    },
    heading: {
      marginBottom: 12,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
      fontFamily: Fonts.MEDIUM,
      fontSize: 24,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    seperator: {
      height: 20,
    },
    optionButtonContainer: {
      flex: 1,
      paddingVertical: 4,
      marginBottom: 12,
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? Colors.transparentLightGray
        : Colors.transparentDarkGray,
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    optionText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },

    dangerText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 18,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });

export const settingsOverviewStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const divider = Colors.midTone;

  return StyleSheet.create({
    overview: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      alignSelf: "stretch",
      paddingHorizontal: 12,
      paddingTop: 12,
      gap: 20,
    },
    accountCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 84,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? divider : Colors.black,
      borderRadius: 12,
      backgroundColor: isDark ? theme.itemBackground : theme.itemBackground,
    },
    accountPressed: {
      opacity: activeOpacity,
    },
    avatar: {
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: Colors.dark.gray,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    accountTitle: {
      color: theme.text,
    },
    accountCaption: {
      color: Colors.midTone,
    },
    section: {
      gap: 8,
    },
    sectionLabel: {
      marginHorizontal: 4,
      color: theme.secondaryText,
    },
    group: {
      gap: StyleSheet.hairlineWidth,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: divider,
      borderRadius: 8,
      backgroundColor: divider,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: MIN_TOUCH_TARGET,
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      backgroundColor: theme.background,
    },
    rowPressed: {
      opacity: activeOpacity,
    },
    rowIcon: {
      alignItems: "center",
      justifyContent: "center",
      width: 34,
      height: 34,
      borderRadius: 999,
      backgroundColor: theme.itemBackground,
    },
    copy: {
      flex: 1,
      minWidth: 0,
    },
    secondary: {
      color: theme.secondaryText,
    },
    destructiveIcon: {
      backgroundColor: theme.errorBackground,
    },
    destructiveText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
};

export const settingsDetailStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;

  return StyleSheet.create({
    panel: {
      padding: 12,
      gap: 12,
      backgroundColor: theme.background,
    },
    identity: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      backgroundColor: theme.itemBackground,
    },
    field: {
      gap: 6,
    },
    choices: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    choice: {
      flexGrow: 1,
      flexBasis: 0,
      minWidth: 82,
      minHeight: 76,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.gray,
    },
    choiceSelected: {
      borderColor: theme.text,
      backgroundColor: theme.itemBackground,
    },
    choiceDisabled: {
      opacity: 0.6,
    },
    choiceLabel: {
      textAlign: "center",
    },
    choiceMark: {
      position: "absolute",
      top: 6,
      right: 6,
    },
    errorPanel: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.errorBackground,
    },
    success: {
      color: theme.green,
    },
    blockedRow: {
      flexWrap: "wrap",
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },
    blockedIdentity: {
      flexDirection: "row",
      flexGrow: 1,
      flexBasis: 140,
      alignItems: "center",
      gap: 12,
    },
    unblockButton: {
      marginStart: "auto",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    emptyContent: {
      flexGrow: 1,
    },
    statusCopy: {
      alignItems: "center",
      gap: 8,
      paddingVertical: 12,
    },
    statusIcon: {
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.itemBackground,
    },
  });
};
