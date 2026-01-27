import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const getScoresStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 16,
    },
    contentArea: {
      flex: 1,
    },
    dateNavContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 8,
    },
    monthText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    monthTextSelected: {
      fontSize: 16,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    dateNavButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 12,
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderRadius: 6,
    },
    dateNavText: {
      color: isDark ? Colors.black : Colors.white,
      fontWeight: "normal",
      fontSize: 18,
      fontFamily: Fonts.OSMEDIUM,
    },
    emptyText: {
      textAlign: "center",
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: 20,
      fontSize: 20,
      fontFamily: Fonts.OSLIGHT,
    },
  });
