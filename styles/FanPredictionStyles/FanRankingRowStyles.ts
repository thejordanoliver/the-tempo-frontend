import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet } from "react-native";

export const fanRankingRowStyles = (isDark: boolean) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: colors.transparentItemBackground,
    },
    currentUser: {
      borderColor: colors.green,
    },
    rankBadge: {
      minWidth: 32,
      height: 32,
      paddingHorizontal: 4,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    goldBadge: { borderWidth: 2, borderColor: Colors.gold },
    silverBadge: { backgroundColor: Colors.silver },
    bronzeBadge: { backgroundColor: Colors.bronze },
    rank: {
      color: colors.text,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
    },
    content: { flex: 1, minWidth: 0, gap: 10 },
    identity: { flexDirection: "row", alignItems: "center", gap: 8 },
    avatar: { width: 32, height: 32, borderRadius: 16 },
    name: { ...global.subtitle, flex: 1, minWidth: 0 },
    youBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: colors.transparentGreen,
    },
    youLabel: {
      ...global.caption,
      fontFamily: Fonts.MEDIUM,
      color: colors.green,
    },
    stats: { flexDirection: "row" },
    stat: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      lineHeight: 26,
      color: colors.text,
    },
    statLabel: { ...global.caption },
    pending: { ...global.caption },
    skeletonIdentity: { flex: 1, minWidth: 0 },
  });
};
