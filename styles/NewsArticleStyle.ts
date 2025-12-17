// app/news/NewsArticle.styles.ts
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
import { Colors } from "constants/Colors";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
    title: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      marginBottom: 12,
      color: isDark ? Colors.white: Colors.black,
    },
    image: {
      width: "100%",
      height: 240,
      borderRadius: 12,
      marginBottom: 12,
    },
    source: {
      fontStyle: "italic",
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginBottom: 8,
    },
    content: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      flex: 1,
    },
  });
