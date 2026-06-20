// GameCard.styles.ts
import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
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
    thumbnailPlaceholder: {
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: 300,
      backgroundColor: Colors.midTone,
    },
    details: {
      paddingHorizontal: 12,
      marginTop: 8,
    },
    timeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
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
