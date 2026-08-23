import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const lastPlayStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      marginVertical: 12,
    },
    wrapper: {
      justifyContent: "center",
      gap: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    statusContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    simpleContainer: {
      marginVertical: 12,
    },
    simpleText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    subText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    headhshot: {
      width: 40,
      height: 40,
      marginRight: 8,
      paddingTop: 4,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 100,
    },
    athleteDetails: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    athleteName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    athleteMeta: {
      marginLeft: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.midTone : Colors.midTone,
    },
    playText: {
      flex: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
    },
    playTextWithAthletes: {
      marginTop: 8,
    },
    description: {
      marginTop: 4,
      opacity: 0.7,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },
  });
