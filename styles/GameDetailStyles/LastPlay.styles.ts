import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const lastPlayStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
      flexGrow: 1,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      justifyContent: "center",
      gap: 8,
      padding: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingBottom: 8,
      marginBottom: 8,
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
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    subText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 100,
      borderWidth: 0.5,
      paddingTop: 4,
      marginRight: 8,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    athleteDetails: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    athleteName: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    athleteMeta: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      marginLeft: 4,
      color: isDark ? Colors.midTone : Colors.midTone,
    },
    playText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      flex: 1,
    },
    playTextWithAthletes: {
      marginTop: 8,
    },
    description: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: Colors.midTone,
      opacity: 0.7,
      marginTop: 4,
    },
  });
