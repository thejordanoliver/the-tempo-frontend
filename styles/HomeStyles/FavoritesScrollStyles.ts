import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const favoritesScrollStyles = (isDark: boolean) =>
  StyleSheet.create({
    favoritesWrapper: { padding: 0 },
    favorites: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
      paddingTop: 24,
      paddingHorizontal: 16,
    },

    teamContainer: { alignItems: "center" },
    logoWrapper: {
      alignItems: "center",
      justifyContent: "center",
      width: 80,
      height: 80,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.light.background : Colors.dark.background,
      borderRadius: 40,
      overflow: "hidden",
    },
    logo: {
      width: 50,
      height: 50,
    },
    editIcon: {
      alignItems: "center",
      justifyContent: "center",
      width: 80,
      height: 80,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.light.background : Colors.dark.background,
      borderRadius: 40,
      backgroundColor: isDark
        ? Colors.light.background
        : Colors.dark.background,
      overflow: "hidden",
    },
    teamLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: 60,
      marginTop: 4,
    },
    divider: {
      width: 1,
      height: 12,
      marginHorizontal: 4,
      backgroundColor: Colors.lightGray,
    },
    teamLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlignVertical: "center",
    },
  });
