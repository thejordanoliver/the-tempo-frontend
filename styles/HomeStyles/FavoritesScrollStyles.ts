import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const favoritesScrollStyles = (isDark: boolean) =>
  StyleSheet.create({
    favoritesWrapper: { padding: 0 },
    favorites: {
      gap: 12,
      flexDirection: "row",
      marginBottom: 20,
      paddingTop: 24,
      paddingHorizontal: 16,
    },

    teamContainer: { alignItems: "center" },
    logoWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.light.background : Colors.dark.background,
    },
    logo: { width: 50, height: 50 },
    editIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 0.5,
      backgroundColor: isDark
        ? Colors.light.background
        : Colors.dark.background,
      borderColor: isDark ? Colors.light.background : Colors.dark.background,
    },
    teamLabelContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 4,
      width: 60,
    },
    divider: {
      width: 1,
      height: 12,
      backgroundColor: Colors.lightGray,
      marginHorizontal: 4,
    },
    teamLabel: {
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.REGULAR,
      textAlignVertical: "center",
    },
  });
