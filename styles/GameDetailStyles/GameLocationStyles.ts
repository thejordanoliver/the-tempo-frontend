import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const GameLocationStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    venueImage: {
      width: "100%",
      height: 220,
    },
    content: {
      padding: 14,
    },
    venueHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    venueIconCircle: {
      alignItems: "center",
      justifyContent: "center",
      width: 42,
      height: 42,
      marginRight: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 21,
    },
    venueTextWrap: {
      flex: 1,
    },
    eyebrow: {
      marginBottom: 2,
      opacity: 0.5,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
    },
    venueTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      lineHeight: 30,
      color: isDark ? Colors.white : Colors.black,
    },
    locationText: {
      marginTop: 4,
      opacity: 0.55,
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },
    mapCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    mapIconWrap: {
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      marginRight: 10,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 18,
    },
    mapCopy: {
      flex: 1,
      paddingRight: 10,
    },
    mapLabel: {
      marginBottom: 2,
      opacity: 0.5,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
    },
    addressText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    mapAction: {
      flexDirection: "row",
      alignItems: "center",
    },
    mapActionText: {
      marginRight: 2,
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
    },
    detailsCard: {
      overflow: "hidden",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    lastDetailRow: {
      borderBottomWidth: 0,
    },
    detailIconCircle: {
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      marginRight: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 18,
    },
    detailCopy: {
      flex: 1,
    },
    detailLabel: {
      marginBottom: 2,
      opacity: 0.5,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
    },
    detailValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    icon: {
      color: isDark ? Colors.white : Colors.black,
    },
  });
