import {
  DATE_SELECTOR_ITEM_HEIGHT,
  DATE_SELECTOR_ITEM_SPACING,
  DATE_SELECTOR_ITEM_WIDTH,
  DATE_SELECTOR_SIDE_PADDING,
} from "@/constants/dateSelectorConstants";
import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const DateSelectorStyles = (
  isDark: boolean,
  {
    horizontalPadding = DATE_SELECTOR_SIDE_PADDING,
    itemWidth = DATE_SELECTOR_ITEM_WIDTH,
  }: { horizontalPadding?: number; itemWidth?: number } = {},
) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: "row",
      marginVertical: 8,
    },
    contentContainerStyle: {
      position: "relative",
      alignItems: "center",
      paddingHorizontal: horizontalPadding,
      gap: DATE_SELECTOR_ITEM_SPACING,
    },
    slidingSelectedContainer: {
      position: "absolute",
      top: 0,
      left: horizontalPadding,
      width: itemWidth,
      height: DATE_SELECTOR_ITEM_HEIGHT,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    item: {
      zIndex: 2,
      alignItems: "center",
      justifyContent: "center",
      width: itemWidth,
      height: DATE_SELECTOR_ITEM_HEIGHT,
      padding: 4,
      borderRadius: 12,
    },
    label: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: Colors.midTone,
      textAlign: "center",
    },
    selectedLabel: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    detail: {
      marginTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: Colors.midTone,
      textAlign: "center",
    },
    selectedDetail: {
      marginTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
  });
