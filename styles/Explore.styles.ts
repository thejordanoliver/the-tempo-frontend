import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
export const exploreStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
    },

    itemContainer: {
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
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
      borderRadius: 24,
      marginRight: 12,
      paddingTop: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },
    playerAvatar: {
      width: 44,
      height: 44,
    },
    avatarContainer: {
      width: 44,
      height: 44,
      borderRadius: 24,
      marginRight: 12,
      overflow: "hidden",
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
      textAlign: "center",
      marginTop: 20,
      fontSize: 16,
      color: Colors.midTone,
    },
    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    centerPrompt: {
      flex: 1,
      marginTop: 80,
      justifyContent: "flex-start",
      alignItems: "center",
    },

    promptText: {
      fontSize: 24,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.darkGray,
    },
    teamLogo: {
      width: 44,
      height: 44,
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
      marginBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
  });
