import { Colors, Fonts } from "constants/Styles";
import { getTeamInfo } from "constants/teamsNFL";
import { NFLEventOdds, PlayerOutcome } from "hooks/NFLHooks/useNFLEventOdds";
import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

interface Props {
  game: NFLEventOdds;
}

export const PlayerOddsCard: React.FC<Props> = ({ game }) => {
  const isDark = useColorScheme() === "dark";
  const styles = playerCardStyles(isDark);

  const bookmaker = game.bookmakers?.[0];
  const market = bookmaker?.markets?.find((m) => m.key === "player_pass_tds");
  const home = getTeamInfo(game.home_team_id ?? "");
  const away = getTeamInfo(game.away_team_id ?? "");

  const homeLogo = isDark ? home?.logoLight : home?.logo;
  const awayLogo = isDark ? away?.logoLight : away?.logo;
  const homeCode = home?.code;
  const awayCode = away?.code;

  const neutralSite = game.neutral ? "vs" : "@";

  const NFL_MARKET_HEADERS: Record<string, string> = {
    player_assists: "Assists",
    player_defensive_interceptions: "Defensive Interceptions",
    player_field_goals: "Field Goals",
    player_kicking_points: "Kicking Points",
    player_pass_attempts: "Pass Attempts",
    player_pass_completions: "Pass Completions",
    player_pass_interceptions: "Pass Interceptions",
    player_pass_longest_completion: "Longest Completion",
    player_pass_rush_yds: "Pass + Rush Yards",
    player_pass_rush_reception_tds: "Pass + Rush + Reception TDs",
    player_pass_tds: "Passing Touchdowns",
    player_pass_yds: "Passing Yards",
    player_pass_yds_q1: "Passing Yards Q1",
    player_pats: "PATs",
    player_receptions: "Receptions",
    player_reception_longest: "Longest Reception",
    player_reception_tds: "Reception TDs",
    player_reception_yds: "Reception Yards",
    player_rush_attempts: "Rush Attempts",
    player_rush_longest: "Longest Rush",
    player_rush_reception_tds: "Rush + Reception TDs",
    player_rush_reception_yds: "Rush + Reception Yards",
    player_rush_tds: "Rush TDs",
    player_rush_yds: "Rush Yards",
    player_sacks: "Sacks",
    player_solo_tackles: "Solo Tackles",
    player_tackles_assists: "Tackles + Assists",
    player_tds_over: "Total TDs Over",
    player_1st_td: "1st TD",
    player_anytime_td: "Anytime TD",
    player_last_td: "Last TD",
  };

  const marketHeader =
    market && NFL_MARKET_HEADERS[market.key]
      ? NFL_MARKET_HEADERS[market.key]
      : market?.key.replace(/_/g, " ").toUpperCase();

  if (!market || !market.outcomes?.length) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.errorText}>No player odds available</Text>
      </View>
    );
  }

  // Group outcomes by player
  const players: Record<string, PlayerOutcome[]> = {};
  market.outcomes.forEach((o) => {
    if (!players[o.description]) players[o.description] = [];
    players[o.description].push(o);
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{marketHeader}</Text>
      </View>

      {Object.entries(players).map(([player, outcomes], index, array) => {
        const isLast = index === array.length - 1;

        return (
          <View
            key={player}
            style={[styles.playerRow, isLast && styles.lastPlayerRow]}
          >
            <Text style={styles.playerName}>{player}</Text>

            <View style={styles.outcomesRow}>
              {outcomes.map((o) => (
                <View key={o.name} style={styles.outcomeBox}>
                  <Text style={styles.outcomeLabel}>{o.name}</Text>
                  <Text style={styles.outcomePoint}>
                    {o.price} {`(${o.point})`}{" "}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.subtext}>
          Powered by: {bookmaker?.title ?? "Unknown"}
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
  );
};

const playerCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderColor: Colors.midTone,
      borderRadius: 8,
      padding: 4,
    },
    header: {
      flexDirection: "row",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.white : Colors.black,
      marginTop: 12,
      paddingBottom: 8,
    },
    footer: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      marginBottom: 4,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    headerText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    logo: {
      height: 40,
      width: 40,
      resizeMode: "contain",
    },
    subtext: {
      fontSize: 12,
      fontFamily: Fonts.OSLIGHT,
      color: Colors.midTone,
    },

    playerRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingVertical: 12,
    },
    lastPlayerRow: {
      borderBottomWidth: 0,
    },
    playerName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
      flex: 1,
    },
    outcomesRow: {
      flexDirection: "row",
      gap: 12,
    },
    outcomeBox: {
      alignItems: "center",
      minWidth: 70,
      //   backgroundColor: "red"
    },
    outcomeLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    outcomePoint: {
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    outcomePrice: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },
    bookmaker: {
      marginTop: 8,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      color: Colors.midTone,
    },
    errorText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
