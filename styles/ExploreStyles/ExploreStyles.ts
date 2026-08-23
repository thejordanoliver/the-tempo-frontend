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
    name: {
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    tag: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    subtext: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    playerRow: {
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
    playerAvatar: {
      width: 40,
      height: 40,
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
      width: 44,
      height: 44,
    },
    playerTeam: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    emptyText: {
      marginTop: 20,
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    errorText: {
      marginTop: 20,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    centerPrompt: {
      flex: 1,
      justifyContent: "flex-start",
    },
    promptText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 24,
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
      paddingTop: 12,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });
