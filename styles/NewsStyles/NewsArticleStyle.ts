import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const TABLET_BREAKPOINT = 768;
const MAX_ARTICLE_WIDTH = 900;

export const newsArticleStyles = (isDark: boolean, screenWidth: number) => {
  const isTablet = screenWidth >= TABLET_BREAKPOINT;

  return StyleSheet.create({
    container: {
      width: "100%",
      maxWidth: isTablet ? MAX_ARTICLE_WIDTH : undefined,
      alignSelf: "center",

      paddingHorizontal: isTablet ? 32 : 12,
      paddingTop: isTablet ? 20 : 0,
      paddingBottom: 100,
    },

    title: {
      marginBottom: isTablet ? 18 : 12,

      fontFamily: Fonts.BOLD,
      fontSize: isTablet ? 34 : 24,
      lineHeight: isTablet ? 42 : 30,

      color: isDark ? Colors.white : Colors.black,
    },

    image: {
      width: "100%",
      height: isTablet ? 420 : 240,

      marginBottom: isTablet ? 16 : 8,

      borderRadius: isTablet ? 12 : 8,
    },

    descriptionContainer: {
      marginBottom: isTablet ? 20 : 12,
      paddingBottom: isTablet ? 16 : 8,

      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.white : Colors.black,
    },

    publishContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      marginTop: isTablet ? 12 : 8,
    },

    timeContainer: {
      flexDirection: "row",
      alignItems: "center",

      gap: isTablet ? 6 : 4,
      marginBottom: isTablet ? 12 : 8,
    },

    description: {
      fontFamily: Fonts.REGULAR,

      fontSize: isTablet ? 17 : 14,
      lineHeight: isTablet ? 26 : 20,

      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    source: {
      marginTop: isTablet ? 12 : 8,

      fontFamily: Fonts.REGULAR,
      fontSize: isTablet ? 15 : 14,

      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: isTablet ? 15 : 14,

      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    content: {
      flex: 1,

      fontFamily: Fonts.REGULAR,
      fontSize: isTablet ? 19 : 16,
      lineHeight: isTablet ? 30 : 24,

      color: isDark ? Colors.white : Colors.black,
    },
  });
};
