import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const teamInjuryStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {},
    contentContainerStyle: { paddingVertical: 12 },
    wrapper: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },
    injuryItem: {
      flexDirection: "row",
      alignItems: "center",
      height: 82,
      padding: 12,
      borderBottomColor: Colors.midTone,
    },
    avatar: {
      width: 50,
      height: 50,
    },
    avatarWrapper: {
      alignItems: "center",
      justifyContent: "center",
      width: 50,
      height: 50,
      paddingTop: 8,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 100,
      overflow: "hidden",
    },
    name: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    playerHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    status: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.midTone : Colors.midTone,
    },
    jersey: {
      marginLeft: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    infoSection: {
      flex: 1,
      justifyContent: "center",
      marginLeft: 10,
    },
    details: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
    },

    placeholder: {
      width: 50,
      height: 50,
      marginRight: 10,
      borderRadius: 25,
      backgroundColor: Colors.lightGray,
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    tabLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    position: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    detail: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    returnDate: {
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: Colors.midTone,
    },
    separator: { height: 10 },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: Colors.darkGray,
    },
    errorText: {
      marginVertical: 8,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "center",
    },
    bottom: {
      flexDirection: "row",
      alignItems: "center",
    },
    divder: {
      width: 1,
      height: 16,
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.midTone : Colors.lightGray,
    },
    tabLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 28,
      height: 28,
    },
    emptyItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 82,
      padding: 12,
      borderBottomColor: Colors.midTone,
    },
    emptyText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 20,
      color: Colors.midTone,
      textAlign: "center",
    },
  });
