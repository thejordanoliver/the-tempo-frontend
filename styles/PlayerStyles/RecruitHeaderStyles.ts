import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const recruitHeaderStyles = (isDark: boolean, accent: string) => {
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
      padding: 12,
    },

    // ── Avatar ──────────────────────────────────────────────
    avatarWrapper: {
      alignItems: "center",
      zIndex: 10,
    },
    avatarRing: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 2,
      borderColor: accent,
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
    positionBadge: {
      marginTop: 10,
      backgroundColor: surface,
      paddingHorizontal: 16,
      paddingVertical: 5,
      borderRadius: 4,
    },
    positionText: {
      fontSize: 13,
      fontFamily: Fonts.OSBOLD,
      color: text,
      letterSpacing: 2.5,
    },

    // ── Name ─────────────────────────────────────────────────
    nameContainer: {
      flexDirection: "row",
      paddingVertical: 12,
      alignItems: "center",
    },
    firstName: {
      fontSize: 22,
      fontFamily: Fonts.OSBOLD,
      color: text,
      letterSpacing: 4,
    },
    lastName: {
      fontSize: 22,
      fontFamily: Fonts.OSBOLD,
      color: accent,
      letterSpacing: 4,
      lineHeight: 26,
    },

    // ── Stats row ────────────────────────────────────────────
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: surface,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      marginHorizontal: 20,
      alignSelf: "stretch",
    },
    statChip: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: text,
    },
    statLabel: {
      fontSize: 9,
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
      fontSize: 9,
      fontFamily: Fonts.OSMEDIUM,
      color: accent,
      letterSpacing: 1.8,
      width: 80,
    },
    infoValue: {
      flex: 1,
      fontSize: 13,
      fontFamily: Fonts.OSLIGHT,
      color: text,
      textAlign: "right",
    },
  });
};
