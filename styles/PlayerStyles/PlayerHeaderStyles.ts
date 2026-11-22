import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet } from "react-native";

export const PlayerHeaderStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);

  return StyleSheet.create({
    container: { paddingTop: 20, gap: 18 },
    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    identityContent: { flex: 1, minWidth: 0, alignItems: "flex-start", gap: 6 },

    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.gray,
      overflow: "hidden",
      flexShrink: 0,
    },
    avatar: { width: "100%", height: "100%", resizeMode: "cover" },
    avatarPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.itemBackground,
    },
    initial: {
      fontFamily: Fonts.BOLD,
      fontSize: 48,
      color: theme.secondaryText,
    },
    positionBadge: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 5,
      backgroundColor: theme.itemBackground,
    },
    positionText: { ...global.label, color: theme.text, letterSpacing: 0.6 },
    positionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    positionDivider: {
      width: StyleSheet.hairlineWidth,
      height: 12,
      backgroundColor: theme.gray,
    },
    nameContainer: { alignSelf: "stretch" },
    name: {
      fontFamily: Fonts.BOLD,
      width: "90%",
      fontSize: 32,
      lineHeight: 35,
      color: theme.text,
      textTransform: "uppercase",
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: theme.itemBackground,
    },
    statChip: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      paddingHorizontal: 4,
    },
    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      color: theme.text,
    },
    statLabel: {
      ...global.label,
      marginTop: 2,
      fontSize: 10,
      letterSpacing: 0.6,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 28,
      backgroundColor: theme.gray,
    },
    infoGrid: { alignSelf: "stretch" },
    infoRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 16,
      paddingVertical: 9,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.transparentGray,
    },
    infoLabel: { ...global.label, width: 80, fontSize: 10, letterSpacing: 0.8 },
    infoValue: { ...global.text, flex: 1, fontSize: 14, textAlign: "right" },
  });
};
