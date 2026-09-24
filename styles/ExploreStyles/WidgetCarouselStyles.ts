import { EXPLORE_WIDGET_SLIDE_INDICATOR_BOTTOM } from "constants/exploreWidgetSizes";
import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const widgetCarouselStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    },
    track: {
      flexDirection: "row",
      height: "100%",
    },
    page: {
      height: "100%",
      overflow: "hidden",
    },
    dots: {
      position: "absolute",
      bottom: EXPLORE_WIDGET_SLIDE_INDICATOR_BOTTOM,
      zIndex: 5,
      flexDirection: "row",
      alignSelf: "center",
      alignItems: "center",
      gap: 5,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    edgeDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      opacity: 0.55,
    },
    activeDot: {
      width: 16,
      height: 6,
      borderRadius: 3,
      opacity: 1,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
  });
