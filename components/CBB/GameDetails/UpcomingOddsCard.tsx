import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsCBB";
import { UpcomingGameOdds } from "hooks/useUpcomingOdds";
import React from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import HeadingTwo from "../../Headings/HeadingTwo";

interface Props {
  game: UpcomingGameOdds;
}

const UpcomingOddsCard: React.FC<Props> = ({ game }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ------------------------------------------------------
  // TEAM LOOKUP
  // ------------------------------------------------------
  const bookmaker = game.bookmakers?.[0];

  const homeTeam = teams.find((t) => t.fullName === game.home_team);
  const awayTeam = teams.find((t) => t.fullName === game.away_team);

  const getMarket = (key: string) =>
    bookmaker?.markets?.find((m) => m.key === key);

  const h2h = getMarket("h2h");
  const spreads = getMarket("spreads");
  const totals = getMarket("totals");

  // ------------------------------------------------------
  // NORMALIZATION (Fixes flipped outcomes)
  // ------------------------------------------------------
  function normalizeTeamMarket(market: any, homeName: string, awayName: string) {
    if (!market?.outcomes || market.outcomes.length < 2) return market;

    const [o0, o1] = market.outcomes;

    // API gave reversed: index 0 = home, index 1 = away
    const isFlipped =
      o0?.name === homeName && o1?.name === awayName;

    if (isFlipped) {
      return {
        ...market,
        outcomes: [o1, o0], // swap to: 0 = away, 1 = home
      };
    }

    return market;
  }

  const h2hNorm = normalizeTeamMarket(h2h, game.home_team, game.away_team);
  const spreadsNorm = normalizeTeamMarket(spreads, game.home_team, game.away_team);
  const totalsNorm = totals; // totals are always Over/Under → not team based

  const oddsMap = [
    { label: "ML", market: h2hNorm },
    { label: "Spread", market: spreadsNorm },
    { label: "Total", market: totalsNorm },
  ];

  const getLogo = (team: typeof homeTeam | undefined) => {
    if (!team) return undefined;
    return isDark ? team.logoLight || team.logo : team.logo;
  };

  const colors = {
    textPrimary: isDark ? Colors.white : Colors.black,
    textSecondary: isDark ? Colors.lightGray : Colors.darkGray,
    textHeader: isDark ? Colors.lightGray : Colors.darkGray,
    divider: isDark ? Colors.darkGray : Colors.lightGray,
    background: isDark ? Colors.black : Colors.white,
  };

  const formatOutcome = (
    market: any,
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
      <HeadingTwo>Betting Odds</HeadingTwo>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              {awayTeam?.code || "Unknown"}
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
              {homeTeam?.code || "Unknown"}
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 12,
    textAlign: "center",
  },
  headerTeamText: {
    fontSize: 12,
    textAlign: "left",
    paddingLeft: 4,
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
    paddingLeft: 4,
  },
  teamLogo: {
    width: 28,
    height: 28,
  },
  teamName: {
    fontSize: 14,
  },
  oddsText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  bookmaker: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  subtext: {
    color: Colors.midTone,
    fontSize: 12,
    fontFamily: Fonts.OSLIGHT,
  },
});

export default UpcomingOddsCard;
