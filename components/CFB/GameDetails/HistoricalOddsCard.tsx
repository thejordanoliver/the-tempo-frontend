import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsCFB";
import { HistoricalCFBGameOdds } from "hooks/CFBHooks/useCFBHistoricalOdds";
import { styles } from "styles/GameDetailStyles/Odds.styles";

import React from "react";
import { Image, Text, useColorScheme, View } from "react-native";

interface Props {
  game: HistoricalCFBGameOdds;
}

// ✅ Automatically resolve NFL team by code or full name
const getTeamFromApi = (teamIdentifier: string) => {
  if (!teamIdentifier) return undefined;

  // Try by team code (e.g., "DAL")
  const byCode = teams.find((t) => t.code === teamIdentifier);
  if (byCode) return byCode;

  // Try by full name (e.g., "Dallas Cowboys")
  const byFullName = teams.find(
    (t) =>
      t.fullName?.toLowerCase() === teamIdentifier.toLowerCase() ||
      t.name?.toLowerCase() === teamIdentifier.toLowerCase()
  );
  if (byFullName) return byFullName;

  // Try partial match (for edge API naming)
  return teams.find((t) =>
    teamIdentifier.toLowerCase().includes(t.name?.toLowerCase() || "")
  );
};

const HistoricalOddsCard: React.FC<Props> = ({ game }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ✅ Safely pick bookmaker (if exists)
  const bookmaker = game.bookmakers?.[0];
  const getMarket = (key: string) =>
    bookmaker?.markets?.find((m) => m.key === key);

  const h2h = getMarket("h2h");
  const spreads = getMarket("spreads");
  const totals = getMarket("totals");

  const oddsMap = [
    { label: "ML", market: h2h },
    { label: "Spread", market: spreads },
    { label: "Total", market: totals },
  ];

  // ✅ Lookup home/away teams dynamically
  const homeTeam = getTeamFromApi(game.home_team);
  const awayTeam = getTeamFromApi(game.away_team);

  const getLogo = (team: typeof homeTeam | undefined) => {
    if (!team) return require("../../../assets/Football/NFL_Logos/NFL.png");

    const logo = isDark ? team.logoLight || team.logo : team.logo;
    if (!logo) return require("../../../assets/Football/NFL_Logos/NFL.png");

    if (typeof logo === "string") return { uri: logo };
    return logo;
  };

  const colors = {
    textPrimary: isDark ? "#fff" : "#000",
    textSecondary: isDark ? "#eee" : "#333",
    textHeader: isDark ? "#ccc" : "#666",
    divider: isDark ? "#444" : "#ccc",
  };

  const formatOutcome = (
    market: typeof h2h | typeof spreads | typeof totals,
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

      {/* Away Team Row */}
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Image
            source={getLogo(awayTeam)}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.teamName,
              { color: colors.textPrimary, fontFamily: Fonts.OSREGULAR },
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
              { color: colors.textSecondary, marginLeft: i === 0 ? 12 : 8 },
            ]}
          >
            {formatOutcome(market, 0, label)}
          </Text>
        ))}
      </View>

      <View style={[styles.divider, { borderBottomColor: colors.divider }]} />

      {/* Home Team Row */}
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Image
            source={getLogo(homeTeam)}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.teamName,
              { color: colors.textPrimary, fontFamily: Fonts.OSREGULAR },
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
              { color: colors.textSecondary, marginLeft: i === 0 ? 12 : 8 },
            ]}
          >
            {formatOutcome(market, 1, label)}
          </Text>
        ))}
      </View>

      {/* Bookmaker Info */}
      <View style={styles.bookmaker}>
        <View style={styles.bookmakerWrapper}>
          <Text style={styles.subtext}>
            Powered By: {bookmaker?.title || "Unknown"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HistoricalOddsCard;
