import { Colors, Fonts } from "constants/styles";
import { teams as nbaTeams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { nflTeams } from "constants/teamsNFL";
import { GameOdds } from "hooks/useUpcomingOdds";
import React from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";

interface Props {
  game: GameOdds;
  league: "nba" | "cbb" | "nfl" | "cfb";
  error?: string | null;
  lighter?: boolean;
}

export const OddsCard: React.FC<Props> = ({
  game,
  league,
  error,
  lighter = false,
}) => {
  const isDark = useColorScheme() === "dark";
  const styles = oddsCardStyles(isDark, lighter);

  /* -------------------- Error State -------------------- */
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  /* -------------------- Team Sources -------------------- */
  const teamsSource =
    league === "cbb"
      ? cbbTeams
      : league === "nfl"
        ? nflTeams
        : league === "cfb"
          ? cfbTeams
          : nbaTeams;

  /* -------------------- Bookmaker -------------------- */
  const bookmaker = game.bookmakers?.[0];

  /* -------------------- Team Matching -------------------- */
  const normalize = (str?: string) => str?.toLowerCase().replace(/[^a-z]/g, "");

  const homeTeam = teamsSource.find(
    (t) => normalize(t.fullName) === normalize(game.home_team),
  );

  const awayTeam = teamsSource.find(
    (t) => normalize(t.fullName) === normalize(game.away_team),
  );

  /* -------------------- Markets -------------------- */
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

  /* -------------------- Logo Resolver -------------------- */
  const getLogo = (team: any) => {
    if (!team) return undefined;

    // CBB women support
    if (league === "cbb" && team.wLogo) {
      return isDark ? team.logoLight || team.wLogo : team.wLogo;
    }

    return isDark ? team.logoLight || team.logo : team.logo;
  };

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
    <View style={styles.wrapper}>
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
          {awayTeam && (
            <Image
              source={getLogo(awayTeam)}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.teamName}>{awayTeam?.code ?? "UNK"}</Text>
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
          {homeTeam && (
            <Image
              source={getLogo(homeTeam)}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.teamName}>{homeTeam?.code ?? "UNK"}</Text>
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
    </View>
  );
};

/* -------------------- Styles -------------------- */
const oddsCardStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    wrapper: {
      padding: 4,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    headerTeamText: {
      flex: 2,
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
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
      borderBottomColor: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.midTone
          : Colors.lightGray,

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
