import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsNFL";
import { UpcomingNFLGameOdds } from "hooks/NFLHooks/useUpcomingNFLOdds";
import React from "react";
import { Image, Text, useColorScheme, View } from "react-native";
import { styles } from "styles/GameDetailStyles/Odds.styles";

interface Props {
  game: UpcomingNFLGameOdds;
}

const getTeamFromApi = (teamIdentifier: string) => {
  if (!teamIdentifier) return undefined;

  // Match directly by oddsID
  const byOddsId = teams.find((t) => t.oddsID === teamIdentifier);
  if (byOddsId) return byOddsId;

  // Fallback to code match (e.g. "LV")
  const byCode = teams.find((t) => t.code === teamIdentifier);
  if (byCode) return byCode;

  // Fallback to full name or short name
  return teams.find(
    (t) => t.fullName === teamIdentifier || t.name === teamIdentifier
  );
};


const UpcomingOddsCard: React.FC<Props> = ({ game }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bookmaker = game.bookmakers?.[0];

  // Lookup teams safely
  const homeTeam = getTeamFromApi(game.home_team);
  const awayTeam = getTeamFromApi(game.away_team);

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

  const getLogo = (team: typeof homeTeam | undefined) => {
    if (!team) return require("../../../assets/Football/NFL_Logos/NFL.png");

    const logo = isDark ? team.logoLight || team.logo : team.logo;

    if (!logo) return require("../../../assets/Football/NFL_Logos/NFL.png");

    if (typeof logo === "string") return { uri: logo };
    return logo;
  };

  const colors = {
    textPrimary: isDark ? "#fff" : "#1d1d1d",
    textSecondary: isDark ? "#888" : "#333",
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
    <>
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
            {awayTeam && (
              <Image
                source={getLogo(awayTeam)}
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

        {/* Home Team Row */}
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            {homeTeam && (
              <Image
                source={getLogo(homeTeam)}
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
          <View style={styles.bookmakerWrapper}>
            <Text style={styles.subtext}>
              Powered By: {bookmaker?.title || "Unknown"}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

export default UpcomingOddsCard;
