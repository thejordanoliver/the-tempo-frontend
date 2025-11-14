import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContainer: {
      gap: 8,
      marginTop: 8,
    },
    driveCard: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomColor: isDark ? "#444" : "#ccc",
      borderBottomWidth: 1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    teamLogo: {
      width: 28,
      height: 28,
      marginRight: 8,
    },
    driveDescription: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? "#fff" : "#1d1d1d",
    },
    driveDetail: {
      fontSize: 12,
      color: isDark ? "#aaa" : "#444",
      marginTop: 2,
      fontFamily: Fonts.OSREGULAR,
    },
    driveTeam: {
      fontSize: 15,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? "#fff" : "#1d1d1d",
    },
    emptyText: {
      fontSize: 16,
      color: "#888",
      textAlign: "center",
      marginTop: 20,
      fontFamily: Fonts.OSBOLD,
    },
  });
