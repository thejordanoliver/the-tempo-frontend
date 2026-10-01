import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export function ForumStyles(isDark: boolean, bottomInset: number, showCreateButton: boolean) {
  const bottomSpacing = showCreateButton
    ? Math.max(120, bottomInset + 16) + 64 + 24
    : bottomInset + 24;

  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: bottomSpacing,
    },

    embeddedContent: {
      paddingBottom: showCreateButton ? bottomSpacing : 24,
    },

    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 40,
      marginTop: 14,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 8,
    },
    loadMoreButton: {
      marginTop: 12,
    },
    disabledButton: {
      opacity: 0.6,
    },
    actionButtonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
  });
}
