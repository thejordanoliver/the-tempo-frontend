import {
  Colors,
  Fonts,
  globalStyles,
  gameDetailTeamLogo,
} from "constants/styles";
import { StyleSheet } from "react-native";

export const OddsStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const shared = globalStyles(isDark);
  return StyleSheet.create({
    outerContainer: { width: "100%", minWidth: 0, flexShrink: 1 },
    wrapper: {
      alignSelf: "stretch",
      minWidth: 0,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    headerRow: {
      alignSelf: "stretch",
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.transparentGray,
    },
    teamHeader: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    homeHeader: { justifyContent: "flex-end" },
    logo: {
      ...gameDetailTeamLogo,
    },
    teamCode: {
      ...shared.textMedium,
      flexShrink: 1,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
      lineHeight: 18,
      textAlign: "left",
    },
    homeCode: { textAlign: "right" },
    markets: {
      alignSelf: "stretch",
      paddingHorizontal: 12,
      minWidth: 0,
    },
    marketRow: {
      alignSelf: "stretch",
      alignItems: "stretch",
      minWidth: 0,
      paddingVertical: 10,
      gap: 4,
    },
    marketDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.transparentGray,
    },
    marketLabel: {
      ...shared.label,
      alignSelf: "center",
      width: "100%",
      fontSize: 11,
      textAlign: "center",
    },
    valuesRow: {
      flexDirection: "row",
      alignSelf: "stretch",
      minWidth: 0,
      gap: 8,
      alignItems: "flex-start",
    },
    priceCell: {
      width: 0,
      flexBasis: 0,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      alignItems: "stretch",
      gap: 2,
    },
    value: {
      ...shared.textMedium,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 15,
      textAlign: "center",
      fontVariant: ["tabular-nums"],
    },
    price: {
      ...shared.text,
      fontSize: 13,
      textAlign: "center",
    },
    opening: {
      ...shared.caption,
      fontSize: 11,
      textAlign: "center",
    },
    unavailable: { color: theme.secondaryText },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 4,
      padding: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.midTone,
    },
    provider: {
      ...shared.caption,
      flexShrink: 1,
    },
    details: {
      ...shared.caption,
      flexShrink: 1,
    },
  });
};
