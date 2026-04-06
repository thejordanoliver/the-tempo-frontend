import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContainer: {
      marginVertical: 8,
    },
    driveCard: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: StyleSheet.hairlineWidth,
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
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    driveDetail: {
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: 2,
      fontFamily: Fonts.OSREGULAR,
    },
    driveTeam: {
      fontSize: 15,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    emptyText: {
      fontSize: 16,
      color: Colors.midTone,
      textAlign: "center",
      marginTop: 20,
      fontFamily: Fonts.OSREGULAR,
      padding: 12,
    },
  });
