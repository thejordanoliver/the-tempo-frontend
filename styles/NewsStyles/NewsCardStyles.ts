// GameCard.styles.ts
import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const newsCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "column",
      paddingBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    thumbnail: {
      width: "100%",
      height: 300,
      resizeMode: "cover",
    },
    thumbnailPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: 300,
      backgroundColor: Colors.midTone,
    },
    details: {
      marginTop: 8,
      paddingHorizontal: 12,
    },
    timeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    title: {
      marginBottom: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    source: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
