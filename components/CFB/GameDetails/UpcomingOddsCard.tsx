import { Fonts } from "constants/fonts";
import { getTeamLogo, teams } from "constants/teamsCFB";
import { Market, UpcomingCFBGameOdds } from "hooks/CFBHooks/useUpcomingCFBOdds";
import React from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { styles } from "styles/GameDetailStyles/Odds.styles";
// ✅ Props
interface Props {
  game: UpcomingCFBGameOdds;
}

// ✅ Resolve team from API identifiers (code, name, or full name)
const getTeamFromApi = (teamIdentifier: string) => {
  if (!teamIdentifier) return undefined;

  const normalized = teamIdentifier.trim().toLowerCase();

  return (
    teams.find(
      (t) =>
        t.code?.toLowerCase() === normalized ||
        t.name?.toLowerCase() === normalized ||
        t.fullName?.toLowerCase() === normalized
    ) ||
    teams.find(
      (t) =>
        t.fullName?.toLowerCase().includes(normalized) ||
        t.name?.toLowerCase().includes(normalized)
    )
  );
};

const UpcomingCFBOddsCard: React.FC<Props> = ({ game }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bookmaker = game.bookmakers?.[0];
  const homeTeam = getTeamFromApi(game.home_team);
  const awayTeam = getTeamFromApi(game.away_team);

  // ✅ Get market, prioritizing moneyline (ML) from game.moneyline
  const getMarket = (key: string): Market | undefined => {
    if (key === "h2h") {
      if (game.moneyline && game.moneyline.outcomes.length > 0) {
        return {
          key: game.moneyline.key,
          outcomes: game.moneyline.outcomes,
        };
      }
      return undefined; // no moneyline available yet
    }
    return bookmaker?.markets?.find((m) => m.key === key);
  };

  const h2h = getMarket("h2h");
  const spreads = getMarket("spreads");
  const totals = getMarket("totals");

  const oddsMap = [
    { label: "ML", market: h2h },
    { label: "Spread", market: spreads },
    { label: "Total", market: totals },
  ];

  const getLogo = (team: typeof homeTeam | undefined) => {
    if (!team) return require("../../../assets/Football/CFB_Logos/CFB.png");

    const logo = isDark ? team.logoLight || team.logo : team.logo;
    if (!logo) return require("../../../assets/Football/CFB_Logos/CFB.png");

    if (typeof logo === "string") return { uri: logo };
    return logo;
  };

  const colors = {
    textPrimary: isDark ? "#fff" : "#1d1d1d",
    textHeader: isDark ? "#ccc" : "#666",
    divider: isDark ? "#444" : "#ccc",
  };

  const formatOutcome = (
    market: Market | undefined,
    index: number,
    label: string
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

  return (
    <View>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.headerTeamText,
            { color: colors.textHeader, flex: 2, fontFamily: Fonts.OSBOLD },
          ]}
        >
          Team
        </Text>
        {oddsMap.map(({ label }, i) => (
          <Text
            key={label}
            style={[
              styles.headerText,
              {
                color: colors.textHeader,
                flex: 1,
                marginLeft: i === 0 ? 12 : 8,
                fontFamily: Fonts.OSBOLD,
              },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Away Team */}
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          {awayTeam && (
            <Image
              source={getTeamLogo(awayTeam.code ?? "", isDark)}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.teamName,
              { color: colors.textPrimary, fontFamily: Fonts.OSMEDIUM },
            ]}
          >
            {awayTeam?.code || game.away_team || "Unknown"}
          </Text>
        </View>
        {oddsMap.map(({ market, label }, i) => (
          <Text
            key={`${label}-away`}
            style={[
              styles.oddsText,
              { color: colors.textPrimary, marginLeft: i === 0 ? 12 : 8 },
            ]}
          >
            {formatOutcome(market, 0, label)}
          </Text>
        ))}
      </View>

      <View style={[styles.divider, { borderBottomColor: colors.divider }]} />

      {/* Home Team */}
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          {homeTeam && (
            <Image
              source={getTeamLogo(homeTeam.code ?? "", isDark)}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.teamName,
              { color: colors.textPrimary, fontFamily: Fonts.OSMEDIUM },
            ]}
          >
            {homeTeam?.code || game.home_team || "Unknown"}
          </Text>
        </View>
        {oddsMap.map(({ market, label }, i) => (
          <Text
            key={`${label}-home`}
            style={[
              styles.oddsText,
              { color: colors.textPrimary, marginLeft: i === 0 ? 12 : 8 },
            ]}
          >
            {formatOutcome(market, 1, label)}
          </Text>
        ))}
      </View>

      {/* Bookmaker Info */}
      <View style={styles.bookmaker}>
        <Text style={styles.subtext}>
          Powered By: {bookmaker?.title || "Unknown"}
        </Text>
      </View>
    </View>
  );
};


export default UpcomingCFBOddsCard;
