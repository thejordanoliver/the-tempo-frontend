import { StyleSheet } from "react-native";
import { Colors, Fonts } from "constants/Styles";
export const highlightCardStyles = (isDark: boolean, thumbnailHeight: number) =>
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
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3,
    },
    thumbnail: {
      width: "100%",
      height: thumbnailHeight,
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
    date: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },
    timeContainer: {
      position: "absolute",
      top: 20,
      right: 12,
      borderRadius: 4,
      overflow: "hidden",
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    time: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: "#fff",
    },
    subtitle: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-between",
    },
  });
