import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";
export const exploreStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
    },
    itemContainer: {
      paddingVertical: 12,
      alignItems: "flex-start",
      justifyContent: "space-between",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontFamily: Fonts.OSLIGHT,
      color: isDark ? Colors.white : Colors.black,
    },
    tag: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    subtext: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    playerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    playerAvatarContainer: {
      width: 44,
      height: 44,
      borderRadius: 100,
      marginRight: 12,
      paddingTop: 8,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    playerAvatar: {
      width: 40,
      height: 40,
    },
    avatarContainer: {
      width: 44,
      height: 44,
      borderRadius: 24,
      marginRight: 12,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    avatar: {
      width: 44,
      height: 44,
    },
    playerTeam: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    emptyText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    centerPrompt: {
      flex: 1,
      justifyContent: "flex-start",
    },
    promptText: {
      fontSize: 24,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    teamLogo: {
      width: 40,
      height: 40,
      marginRight: 12,
    },
    userRow: {
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
      fontSize: 14,
      textAlign: "center",
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      paddingTop: 12,
    },
  });
