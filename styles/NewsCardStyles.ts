// GameCard.styles.ts
import { StyleSheet } from "react-native";
import { Fonts } from "constants/fonts";
import { Colors } from "constants/Colors";
export const newsCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "column",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      paddingBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },
    thumbnail: {
      width: "100%",
      height: 300,
      resizeMode: "cover",
    },
    details: {
      paddingHorizontal: 12,
      marginTop: 8,
    },
    title: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
      marginBottom: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    source: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
