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
      columnGap: GRID_GAP,
      rowGap: GRID_GAP,
    },
    gridItem: {
      width: itemWidth,
      height: CARD_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 8,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      position: "relative",
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
      fontFamily: Fonts.BOLD,
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
      textAlign: "left",
      fontSize: 14,
      marginLeft: 10,
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
      color: isDark ? Colors.black : Colors.white,
      fontSize: 20,
      fontFamily: Fonts.MEDIUM,
    },
    editIcon: {
      marginLeft: 4,
      color: isDark ? Colors.black : Colors.white,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Fonts.SEMIBOLD,
      marginBottom: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamCard: {
      alignItems: "center",
      marginRight: 16,
      width: 80,
    },
  });
