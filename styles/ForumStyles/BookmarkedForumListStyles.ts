import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const bookmarkedForumListStyles = (isDark: boolean) =>
  StyleSheet.create({
    actionButton: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 40,
      marginTop: 14,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
    },

    loadMoreButton: {
      marginTop: 12,
    },

    disabledButton: {
      opacity: 0.6,
    },

    actionButtonText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
    },
  });
