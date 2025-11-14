import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const lastPlayStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
      flexGrow: 1,
    },
    simpleContainer: {
      marginVertical: 12,
    },
    simpleText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
    },
    athleteContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 4,
    },
    athleteItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 100,
      marginRight: 6,
      borderWidth: 0.5,
      paddingTop: 4,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    athleteDetails: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginRight: 12,
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
