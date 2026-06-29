import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

/* ---------------- STYLES ---------------- */

export const favoriteTeamsListStyles = (isDark: boolean) =>
  StyleSheet.create({
    gridContainer: {
      columnGap: 8,
      rowGap: 8,
      justifyContent: "flex-start",
    },
    gridItem: {
      width: "32%",
    },
    listItem: {
      width: "100%",
    },
    pressed: {
      opacity: 0.6,
    },
    teamItemBase: {
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    },
    leagueBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      paddingLeft: 12,
      paddingRight: 6,
      paddingVertical: 4,
      borderTopLeftRadius: 6,
      borderBottomLeftRadius: 100,
      zIndex: 2,
    },
    leagueBadgeText: {
      color: Colors.white,
      fontSize: 10,
      fontFamily: Fonts.OSBOLD,
    },
    logoGridMargin: {
      marginBottom: 8,
    },
    logoListMargin: {
      marginRight: 10,
    },
    gridNameContainer: {
      alignItems: "center",
    },
    gridNameText: {
      fontSize: 12,
      textAlign: "center",
    },
    gridNicknameText: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 2,
    },
    listNameText: {
      textAlign: "left",
      fontSize: 14,
      marginLeft: 10,
    },
    buttonContainer: {
      width: "100%",
      marginVertical: 12,
    },

    favoritesContainer: {
      marginTop: 20,
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
    favoritesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      color: isDark ? Colors.white : Colors.black,
    },
    toggleIcon: {
      paddingHorizontal: 4,
    },

    heading: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? "white" : Colors.black,
    },
    noFavoritesText: {
      fontStyle: "italic",
      color: isDark ? Colors.midTone : Colors.midTone,
      textAlign: "center",
    },
    teamGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
    },

    teamItem: {
      flex: 1,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
    },

    teamLogo: {
      width: 50,
      height: 50,
      resizeMode: "contain",
    },
    teamName: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.white,
      width: "auto",
    },

    editText: {
      color: isDark ? Colors.black : Colors.white,
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
    },
    editIcon: {
      marginLeft: 4,
      color: isDark ? Colors.black : Colors.white,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Fonts.OSSEMIBOLD,
      marginBottom: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamCard: {
      alignItems: "center",
      marginRight: 16,
      width: 80,
    },
  });
