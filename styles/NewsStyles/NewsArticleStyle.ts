import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const newsArticleStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
    title: {
      marginBottom: 12,
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
    },
    image: {
      width: "100%",
      height: 240,
      marginBottom: 8,
      borderRadius: 8,
    },
    descriptionContainer: {
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.white : Colors.black,
    },
    publishContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    timeContainer: {
      flexDirection: "row",
      gap: 4,
      marginBottom: 8,
    },
    description: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    source: {
      marginTop: 8,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    date: {
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    content: {
      flex: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      lineHeight: 24,
      color: isDark ? Colors.white : Colors.black,
    },
  });
