import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const PlayerAwardListStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      borderRadius: 8,
      overflow: "hidden",
    },
    awardItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    awardText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },

    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },
  });
