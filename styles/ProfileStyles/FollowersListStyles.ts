import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const followersListStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainerStyle: {
      paddingHorizontal: 12,
      paddingBottom: 100,
    },

    itemContainer: {
      paddingVertical: 12,
      alignItems: "flex-start",
      justifyContent: "space-between",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      flex: 1,
    },
    username: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
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
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    mutalIcon: { marginRight: 6 },
  });
