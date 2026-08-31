import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const GRID_GAP = 8;
const CARD_HEIGHT = 130;

/* ---------------- STYLES ---------------- */

export const favoriteTeamsListStyles = (
  isDark: boolean,
  itemWidth: number,
  isGridView: boolean,
) =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      rowGap: GRID_GAP,
      columnGap: GRID_GAP,
    },
    gridItem: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      width: itemWidth,
      height: CARD_HEIGHT,
      paddingHorizontal: 8,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    list: {
      flex: 1,
    },

    listItem: {
      flex: 1,
      justifyContent: "center",
      width: "100%",
      marginBottom: 8,
      borderRadius: 8,
      overflow: "hidden",
    },
    pressed: {
      opacity: 0.6,
    },

    sportTag: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 2,
      paddingLeft: 14,
      paddingRight: 6,
      paddingVertical: 4,
      borderTopLeftRadius: 6,
      borderBottomLeftRadius: 100,
    },
    sportTagText: {
      textTransform: "uppercase",
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: Colors.white,
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

    listNameText: {
      marginLeft: 10,
      fontSize: 14,
      textAlign: "left",
    },
    buttonContainer: {
      width: "100%",
      marginVertical: 12,
    },

    toggleIcon: {
      paddingHorizontal: 4,
    },

    teamItem: {
      flexDirection: isGridView ? "column" : "row",
      alignItems: isGridView ? "center" : "center",
    },

    teamLogo: {
      width: 50,
      height: 50,
      resizeMode: "contain",
    },
    teamName: {
      flex: isGridView ? 0 : 1,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.white,
    },

    editText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 20,
      color: isDark ? Colors.black : Colors.white,
    },
    editIcon: {
      marginLeft: 4,
      color: isDark ? Colors.black : Colors.white,
    },
    sectionTitle: {
      marginBottom: 8,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    nextSectionTitle: {
      marginTop: 20,
    },
    emptyText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    loadingIndicator: {
      alignSelf: "flex-start",
      paddingVertical: 12,
    },
    teamCard: {
      alignItems: "center",
      width: 80,
      marginRight: 16,
    },
  });
