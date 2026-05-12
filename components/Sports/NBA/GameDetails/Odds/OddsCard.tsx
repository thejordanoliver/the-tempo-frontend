import { Colors, Fonts, globalStyles } from "constants/styles";
import { GameOdds } from "hooks/OddsHooks/useUpcomingOdds";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
  game: GameOdds;
  error?: string | null;
  isDark: boolean;
  homeLogo: any;
  awayLogo: any;
  homeCode: string | undefined;
  awayCode: string | undefined;
}

export const OddsCard: React.FC<Props> = ({
  game,
  error,
  homeCode,
  awayCode,
  homeLogo,
  awayLogo,
  isDark = false,
}) => {
  const styles = oddsCardStyles(isDark);
  const global = globalStyles(isDark);

  /* -------------------- Error State -------------------- */
  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>❌ {error}</Text>
      </View>
    );
  }

  /* -------------------- Bookmaker -------------------- */
  const bookmaker = game.bookmakers?.[0];
  const commenceTime = game.commence_time;
  const date = new Date(commenceTime);
  const localDate = date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });

  /* -------------------- Markets -------------------- */
  const getMarket = (key: string) =>
    bookmaker?.markets?.find((m) => m.key === key);

  const h2h = getMarket("h2h");
  const spreads = getMarket("spreads");
  const totals = getMarket("totals");

  const oddsMap = [
    { label: "H2H", market: h2h },
    { label: "Spread", market: spreads },
    { label: "Total", market: totals },
  ];

  /* -------------------- Odds Formatter -------------------- */
  const formatOutcome = (
    market: typeof h2h | typeof spreads | typeof totals,
    index: number,
    label: string,
  ) => {
    const outcome = market?.outcomes?.[index];
    if (!outcome) return "-";

    if (label === "Total") {
      return `${index === 0 ? "O" : "U"} ${outcome.point ?? "-"}`;
    }

    return `${outcome.price}${
      outcome.point !== undefined ? ` (${outcome.point})` : ""
    }`;
  };

  /* -------------------- Render -------------------- */
  return (
    <View>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTeamText}>Team</Text>
        {oddsMap.map(({ label }, i) => (
          <Text
            key={label}
            style={[styles.headerText, { marginLeft: i === 0 ? 12 : 8 }]}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Away Team */}
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Image
            source={awayLogo}
            style={styles.teamLogo}
            resizeMode="contain"
          />

          <Text style={styles.teamName}>{awayCode}</Text>
        </View>

        {oddsMap.map(({ market, label }, i) => (
          <Text
            key={`${label}-away`}
            style={[styles.oddsText, { marginLeft: i === 0 ? 12 : 8 }]}
          >
            {formatOutcome(market, 0, label)}
          </Text>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Home Team */}
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Image
            source={homeLogo}
            style={styles.teamLogo}
            resizeMode="contain"
          />

          <Text style={styles.teamName}>{homeCode}</Text>
        </View>

        {oddsMap.map(({ market, label }, i) => (
          <Text
            key={`${label}-home`}
            style={[styles.oddsText, { marginLeft: i === 0 ? 12 : 8 }]}
          >
            {formatOutcome(market, 1, label)}
          </Text>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Powered By: {bookmaker.title}</Text>
        <Text style={styles.footerText}>Commence Time: {localDate}</Text>
      </View>
    </View>
  );
};

/* -------------------- Styles -------------------- */
const oddsCardStyles = (isDark: boolean) =>
  StyleSheet.create({
   
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    headerTeamText: {
      flex: 2,
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    footerText: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    headerText: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    teamInfo: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    teamLogo: {
      width: 28,
      height: 28,
    },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    oddsText: {
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.midTone : Colors.lightGray,

      marginVertical: 8,
    },
    bookmaker: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
    },
    subtext: {
      fontSize: 12,
      fontFamily: Fonts.OSLIGHT,
      color: Colors.midTone,
    },
    errorContainer: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      backgroundColor: isDark
        ? Colors.dark.errorBackground
        : Colors.light.errorBackground,
    },
    errorText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
