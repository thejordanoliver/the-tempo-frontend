import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const MessageListStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingBottom: 100,
    },

    searchContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
    },

    emptyContentContainer: {
      flexGrow: 1,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingBottom: 20,
    },

    footerLoader: {
      paddingVertical: 18,
    },

    emptyIconContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 32,
    },

    retryButton: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryButtonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },
  });
