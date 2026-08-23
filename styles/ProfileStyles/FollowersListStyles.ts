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
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    username: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
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
