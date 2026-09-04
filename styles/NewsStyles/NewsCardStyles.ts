import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const TABLET_BREAKPOINT = 768;
const MAX_CARD_WIDTH = 900;

export const NewsCardStyles = (isDark: boolean, screenWidth: number) => {
  const isTablet = screenWidth >= TABLET_BREAKPOINT;

  return StyleSheet.create({
    card: {
      flexDirection: "column",

      width: "100%",
      maxWidth: isTablet ? MAX_CARD_WIDTH : undefined,
      alignSelf: "center",

      paddingBottom: isTablet ? 18 : 12,

      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: isTablet ? 12 : 8,

      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      overflow: "hidden",
    },

    thumbnail: {
      width: "100%",
      height: isTablet ? 480 : 400,
      resizeMode: "cover",
    },

    thumbnailPlaceholder: {
      alignItems: "center",
      justifyContent: "center",

      width: "100%",
      height: isTablet ? 420 : 300,

      backgroundColor: Colors.midTone,
    },

    details: {
      marginTop: isTablet ? 14 : 8,
      paddingHorizontal: isTablet ? 20 : 12,
    },

    timeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      marginTop: isTablet ? 4 : 0,
    },

    title: {
      marginBottom: isTablet ? 8 : 4,

      fontFamily: Fonts.BOLD,
      fontSize: isTablet ? 21 : 16,
      lineHeight: isTablet ? 28 : 22,

      color: isDark ? Colors.white : Colors.black,
    },

    source: {
      fontFamily: Fonts.REGULAR,
      fontSize: isTablet ? 15 : 12,

      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
};
