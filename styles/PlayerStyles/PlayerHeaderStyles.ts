import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const playerHeaderStyles = (isDark: boolean) => {
  const bg = isDark ? Colors.black : Colors.white;
  const surface = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const text = isDark ? Colors.white : Colors.black;
  const muted = Colors.midTone;
  const divider = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    // ── Avatar ──────────────────────────────────────────────
    avatarWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    avatarRing: {
      zIndex: 10,
      alignItems: "center",
      width: 140,
      height: 140,
      borderWidth: 2,
      borderColor: text,
      borderRadius: "100%",
      backgroundColor: bg,
      overflow: "hidden",
    },
    avatarContainer: {
      zIndex: 10,
      alignItems: "center",
      width: 140,
      height: 140,
      borderWidth: 2,
      borderColor: text,
      borderRadius: "100%",
      backgroundColor: bg,
      overflow: "hidden",
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      backgroundColor: Colors.midTone,
    },
    initial: {
      fontFamily: Fonts.BOLD,
      fontSize: 42,
      color: text,
    },

    // ── Position badge ───────────────────────────────────────
    badgeRow: {
      flexDirection: "row",
      marginTop: 10,
    },
    positionBadge: {
      marginTop: 10,
      paddingHorizontal: 16,
      paddingVertical: 5,
      borderRadius: 4,
      backgroundColor: surface,
    },
    positionText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: text,
    },

    // ── Name ─────────────────────────────────────────────────
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    name: {
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      letterSpacing: 4,
      color: text,
      textAlign: "center",
      textTransform: "uppercase",
    },

    // ── Stats row ────────────────────────────────────────────
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
      gap: 8,
      width: "100%",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: surface,
    },
    statChip: {
      alignItems: "center",
      width: 80,
      paddingHorizontal: 12,
    },
    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: text,
    },
    statLabel: {
      marginTop: 3,
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      letterSpacing: 1.8,
      color: muted,
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: divider,
    },

    // ── Info grid ────────────────────────────────────────────
    infoGrid: {
      alignSelf: "stretch",
      marginTop: 14,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    infoLabel: {
      width: 80,
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      letterSpacing: 1.8,
      color: muted,
    },
    infoValue: {
      flex: 1,
      fontFamily: Fonts.LIGHT,
      fontSize: 14,
      color: text,
      textAlign: "right",
    },
  });
};
