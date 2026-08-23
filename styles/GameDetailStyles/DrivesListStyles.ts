import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const DriveListStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContainer: {
      maxHeight: 400,
      marginVertical: 8,
    },
    driveCard: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    teamLogo: {
      width: 28,
      height: 28,
      marginRight: 8,
    },
    driveDescription: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    driveDetail: {
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    driveTeam: {
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },
    emptyText: {
      marginTop: 20,
      padding: 12,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: Colors.midTone,
      textAlign: "center",
    },
  });
