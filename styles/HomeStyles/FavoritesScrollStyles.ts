import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const FavoritesScrollStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
      paddingTop: 24,
      paddingHorizontal: 16,
    },

    tabContainer: {
      alignItems: "center",
      width: 80,
    },
    activeTabContainer: {
      zIndex: 10,
    },
    pressed: {
      opacity: 0.6,
    },
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
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      height: 30,
      marginTop: 4,
    },
    tabLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    divider: {
      width: 1,
      height: 12,
      marginHorizontal: 4,
      backgroundColor: Colors.lightGray,
    },

    dragPlaceholder: {
      alignItems: "center",
      width: 80,
    },
    dragPlaceholderCircle: {
      width: 80,
      height: 80,
      borderWidth: 1.5,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      borderStyle: "dashed",
      borderRadius: 40,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
  });
