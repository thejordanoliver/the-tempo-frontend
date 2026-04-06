// ---- LastFiveGamesSwitcher.tsx ----
import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { lastFiveGameStyles } from "styles/GameDetailStyles/LastFiveGames.styles";
import { LeagueType } from "types/types";

type TeamData = {
  teamId?: number; // 👈 make optional to reflect real data
  teamCode: string | undefined;
  games: any[];
};

type Props = {
  isDark: boolean;
  home: TeamData;
  away: TeamData;
  league: LeagueType;
};

export default function LastFiveGames({ isDark, home, away, league }: Props) {
  const [selected, setSelected] = useState<"home" | "away">("away");
  const team = selected === "home" ? home : away;

  const styles = lastFiveGameStyles(isDark);

  const resolveTeam = (teamId?: number) => {
    if (!teamId) return undefined;

    switch (league) {
      case "NBA":
        return getNBATeam(teamId);
      case "WNBA":
        return getWNBATeam(teamId);
      case "NFL":
        return getNFLTeam(teamId);
      case "NHL":
        return getNHLTeam(teamId);
      case "MLB":
        return getMLBTeam(teamId);
      case "CBB":
        return getCBBTeam(teamId, false);
      case "WCBB":
        return getCBBTeam(teamId, true);
      case "CFB":
        return getCFBTeam(teamId);
      default:
        return undefined;
    }
  };

  const resolveLogo = (teamId?: number) => {
    if (!teamId) return undefined;

    switch (league) {
      case "NBA":
        return getTeamLogo(teamId, isDark);
      case "WNBA":
        return getWNBATeamLogo(teamId, isDark);
      case "NFL":
        return getNFLTeamLogo(teamId, isDark);
      case "NHL":
        return getNHLTeamLogo(teamId, isDark);
      case "MLB":
        return getMLBTeamLogo(teamId, isDark);
      case "CBB":
        return getCBBTeamLogo(teamId, isDark, false);
      case "WCBB":
        return getCBBTeamLogo(teamId, isDark, true);
      case "CFB":
        return getCFBTeamLogo(teamId, isDark);
      default:
        return undefined;
    }
  };

  const renderRow = ({ item, index }: { item: any; index: number }) => {
    const matchupSymbol = item.isHome ? "vs" : "@";
    const resultSymbol = item.won ? "W" : "L";
    const resultColor = item.won ? styles.colors.win : styles.colors.loss;

    const opponent = resolveTeam(item.opponent.id);
    const opponentLogo = resolveLogo(item.opponent.id);
    const opponentCode = opponent?.code;
    return (
      <View
        style={[
          styles.row,
          {
            borderBottomWidth:
              index === team.games.length - 1 ? 0 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Text style={[styles.cell, styles.date]}>{item.date}</Text>

        <View style={[styles.cell, styles.teamWithLogo]}>
          <Text style={styles.matchupText}>
            {matchupSymbol} {opponentCode}
          </Text>

          {opponentLogo && (
            <Image
              source={opponentLogo}
              style={styles.opponentLogo}
              resizeMode="contain"
            />
          )}
        </View>

        <Text style={[styles.cell, { color: resultColor }]}>
          {resultSymbol} {item.isHome ? item.homeScore : item.awayScore} -{" "}
          {item.isHome ? item.awayScore : item.homeScore}
        </Text>
      </View>
    );
  };

  const tabs: readonly ("away" | "home")[] = ["away", "home"];

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Last Five Games</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs}
          isDark={isDark}
          selected={selected}
          onTabPress={(tab) => setSelected(tab as "home" | "away")}
          renderLabel={(tab, isSelected, tabStyles) => {
            const teamData = tab === "home" ? home : away;
            const teamLogo = resolveLogo(teamData.teamId);

            return (
              <View style={styles.tabLabel}>
                {teamLogo && (
                  <Image
                    source={teamLogo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {teamData.teamCode}
                </Text>
              </View>
            );
          }}
        />

        <FlatList
          data={team.games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRow}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No recent games.</Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              <Text style={[styles.cell, styles.date]}>Date</Text>
              <Text style={[styles.cell, styles.teamHeader]}>Matchup</Text>
              <Text style={styles.cell}>Result</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
