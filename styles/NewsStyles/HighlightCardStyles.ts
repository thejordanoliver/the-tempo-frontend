import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const highlightCardStyles = (isDark: boolean, thumbnailHeight: number) =>
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    thumbnail: {
      width: "100%",
      height: thumbnailHeight,
      resizeMode: "cover",
    },
    details: {
      marginTop: 8,
      paddingHorizontal: 12,
    },
    title: {
      marginBottom: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },
    timeContainer: {
      position: "absolute",
      top: 20,
      right: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: "hidden",
    },
    time: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: "#fff",
    },
    subtitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
  });
