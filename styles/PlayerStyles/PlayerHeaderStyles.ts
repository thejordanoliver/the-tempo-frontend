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
      zIndex: 10,
    },
    avatarRing: {
      width: 140,
      height: 140,
      borderRadius: "100%",
      borderWidth: 2,
      borderColor: text,
      backgroundColor: bg,
      overflow: "hidden",
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      width: "100%",
      height: "100%",
      backgroundColor: Colors.midTone,
      justifyContent: "center",
      alignItems: "center",
    },
    initial: {
      fontSize: 42,
      fontFamily: Fonts.OSBOLD,
      color: text,
    },

    // ── Position badge ───────────────────────────────────────
    badgeRow: {
      marginTop: 10,
      flexDirection: "row",
    },
    positionBadge: {
      marginTop: 10,
      backgroundColor: surface,
      paddingHorizontal: 16,
      paddingVertical: 5,
      borderRadius: 4,
    },
    positionText: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      color: text,
    },

    // ── Name ─────────────────────────────────────────────────
    nameContainer: {
      flexDirection: "row",
      paddingVertical: 12,
      alignItems: "center",
    },
    name: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      color: text,
      letterSpacing: 4,
      textTransform: "uppercase",
      textAlign: "center",
    },

    // ── Stats row ────────────────────────────────────────────
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      backgroundColor: surface,
      borderRadius: 8,
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 12,
      width: "100%",
    },
    statChip: {
      width: 80,
      paddingHorizontal: 12,
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: text,
    },
    statLabel: {
      fontSize: 10,
      fontFamily: Fonts.OSMEDIUM,
      color: muted,
      letterSpacing: 1.8,
      marginTop: 3,
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    infoLabel: {
      fontSize: 10,
      fontFamily: Fonts.OSMEDIUM,
      color: muted,
      letterSpacing: 1.8,
      width: 80,
    },
    infoValue: {
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.OSLIGHT,
      color: text,
      textAlign: "right",
    },
  });
};
