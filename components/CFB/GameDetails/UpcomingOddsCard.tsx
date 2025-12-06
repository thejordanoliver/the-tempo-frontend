import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsCFB";
import { UpcomingGameOdds } from "hooks/CFBHooks/useCFBUpcomingOdds";
import React from "react";
import { Image, Text, useColorScheme, View } from "react-native";
import { styles } from "styles/GameDetailStyles/Odds.styles";

interface Props {
  game: UpcomingGameOdds;
}

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

const UpcomingOddsCard: React.FC<Props> = ({ game }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bookmaker = game.bookmakers?.[0];

  // -----------------------------
  // TEAM LOOKUP
  // -----------------------------
  const homeTeam = getTeamFromApi(game.home_team);
  const awayTeam = getTeamFromApi(game.away_team);

  const getMarket = (key: string) =>
    bookmaker?.markets?.find((m) => m.key === key);

  const h2h = getMarket("h2h");
  const spreads = getMarket("spreads");
  const totals = getMarket("totals");

  // -----------------------------
  // NORMALIZATION FIX (🔥 IMPORTANT)
  // If outcomes are reversed, swap to: 0 = away, 1 = home
  // -----------------------------
  function normalizeTeamMarket(
    market: any,
    homeName: string,
    awayName: string
  ) {
    if (!market?.outcomes || market.outcomes.length < 2) return market;

    const [o0, o1] = market.outcomes;

    // API sometimes puts index 0 = HOME
    const isFlipped =
      o0?.name?.trim().toLowerCase() === homeName.trim().toLowerCase() &&
      o1?.name?.trim().toLowerCase() === awayName.trim().toLowerCase();

    if (isFlipped) {
      return {
        ...market,
        outcomes: [o1, o0], // swap → index 0 = away, index 1 = home
      };
    }

    return market;
  }

  const h2hNorm = normalizeTeamMarket(h2h, game.home_team, game.away_team);
  const spreadsNorm = normalizeTeamMarket(
    spreads,
    game.home_team,
    game.away_team
  );
  const totalsNorm = totals; // Totals do NOT depend on team order

  const oddsMap = [
    { label: "ML", market: h2hNorm },
    { label: "Spread", market: spreadsNorm },
    { label: "Total", market: totalsNorm },
  ];

  // -----------------------------
  // IMAGE RESOLUTION
  // -----------------------------
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

  const formatOutcome = (market: any, index: number, label: string) => {
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
        {/* HEADER */}
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

        {/* AWAY TEAM ROW */}
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
                {
                  color: colors.textPrimary,
                  marginLeft: i === 0 ? 12 : 8,
                },
              ]}
            >
              {formatOutcome(market, 0, label)}
            </Text>
          ))}
        </View>

        <View style={[styles.divider, { borderBottomColor: colors.divider }]} />

        {/* HOME TEAM ROW */}
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
                {
                  color: colors.textPrimary,
                  marginLeft: i === 0 ? 12 : 8,
                },
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
          <Text style={styles.subtext}>
            {new Date(game.commence_time).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "2-digit",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </Text>
        </View>
      </View>
    </>
  );
};

export default UpcomingOddsCard;
