import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const favoriteTeamsWidgetStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    card: {
      position: "relative",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },

    settingsButton: {
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 20,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    body: {
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    },

    stateCard: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: compact ? 6 : 8,
      padding: compact ? 8 : 12,
    },

    stateTitle: {
      fontFamily: Fonts.MEDIUM,
      fontSize: compact ? 14 : 16,
      color: isDark ? Colors.white : Colors.black,
    },

    stateText: {
      fontFamily: Fonts.REGULAR,
      fontSize: compact ? 11 : 13,
      lineHeight: compact ? 15 : 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });
