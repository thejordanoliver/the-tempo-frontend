import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

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
      color: isDark ? Colors.white : Colors.black,
    },
    image: {
      width: "100%",
      height: 240,
      borderRadius: 8,
      marginBottom: 8,
    },
    descriptionContainer: {
      borderBottomColor: isDark ? Colors.white : Colors.black,
      borderBottomWidth: StyleSheet.hairlineWidth,
      marginBottom: 12,
      paddingBottom: 8,
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
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    source: {
      marginTop: 8,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    date: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    content: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      flex: 1,
    },
  });
