import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export function ForumStyles(
  isDark: boolean,
  bottomInset: number,
  showCreateButton: boolean,
) {
  
  const bottomSpacing = showCreateButton
    ? Math.max(120, bottomInset + 16) + 88
    : bottomInset + 24;
  const foregroundColor = isDark ? Colors.white : Colors.black;

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
      borderColor: foregroundColor,
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
      color: foregroundColor,
    },
  });
}
