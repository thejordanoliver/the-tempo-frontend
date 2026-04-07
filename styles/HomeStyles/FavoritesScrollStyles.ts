import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const favoritesScrollStyles = (isDark: boolean) =>
  StyleSheet.create({
    favoritesWrapper: { padding: 0 },
    favorites: {
      flexDirection: "row",
      marginBottom: 20,
      paddingTop: 24,
      paddingHorizontal: 16,
    },
    editButton: {
      marginRight: 0,
    },
    teamIcon: { alignItems: "center", marginRight: 16 },
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
    logo: { width: 50, height: 50, resizeMode: "contain" },
    editIcon: {
      backgroundColor: isDark
        ? Colors.light.background
        : Colors.dark.background,
      width: 80,
      height: 80,
      borderRadius: 100,
      justifyContent: "center",
      alignItems: "center",
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
      fontFamily: Fonts.OSREGULAR,
      textAlignVertical: "center",
    },
  });
