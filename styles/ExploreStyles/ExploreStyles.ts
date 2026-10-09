import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const exploreStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 12,
    },
    wrapper: {
      flex: 1,
    },
    resultListContainer: {
      paddingBottom: 100,
    },
    itemContainer: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    resultText: {
      flex: 1,
      minWidth: 0,
    },
    deleteButton: {
      width: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },

    subtext: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },
    playerRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },
    playerAvatarContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
      marginRight: 12,
      paddingTop: 8,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 100,
      overflow: "hidden",
    },

    avatarContainer: {
      width: 44,
      height: 44,
      marginRight: 12,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 24,
      overflow: "hidden",
    },
    avatar: {
      width: 48,
      height: 48,
      resizeMode: "contain",
    },

    centerPrompt: {
      flex: 1,
      justifyContent: "flex-start",
    },

    teamLogo: {
      width: 40,
      height: 40,
      marginRight: 12,
    },
    userRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    seeAllRow: {
      flexDirection: "row",
      justifyContent: "center",
    },
    seeAllText: {
      paddingTop: 12,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });
