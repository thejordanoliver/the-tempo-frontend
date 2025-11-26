// ---- LastFiveGamesSwitcher.tsx ----
import FixedWidthTabBar from "components/FixedWidthTabBar";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";

import { getStyles } from "styles/GameDetailStyles/LastFiveGames.styles";
// League constants
import { teams as nbaTeams } from "constants/teams";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as nflTeams } from "constants/teamsNFL";
import {teams as cbbTeams} from "constants/teamsCBB";
import { LeagueType } from "types/types";

type Props = {
  isDark: boolean;
  lighter?: boolean;
  home: {
    teamCode: string;
    teamLogoLight: any;
    teamLogo: any;
    games: any[];
  };
  away: {
    teamCode: string;
    teamLogoLight: any;
    teamLogo: any;
    games: any[];
  };
  league: LeagueType;
};

// Helper: pick correct team list for the league
function getLeagueTeams(league: LeagueType) {
  switch (league) {
    case "NFL":
      return nflTeams;
    case "CFB":
      return cfbTeams;
    case "CBB":
      return cbbTeams;
    default:
      return nbaTeams;
  }
}

// Helper: resolve opponent code dynamically
function getOpponentCodeFromName(
  opponentName: string,
  league: LeagueType
): string | undefined {
  const teams = getLeagueTeams(league);
  const team = teams.find(
    (t) =>
      t.name === opponentName ||
      t.code === opponentName ||
      t.fullName === opponentName
  );
  return team?.code;
}

export default function LastFiveGamesSwitcher({
  isDark,
  lighter,
  home,
  away,
  league,
}: Props) {
const [selected, setSelected] = useState<"home" | "away">("away");
  const team = selected === "home" ? home : away;
  const styles = getStyles(isDark, lighter ?? false);



  const renderRow = ({ item, index }: { item: any; index: number }) => {
    const matchupSymbol = item.isHome ? "vs" : "@";
    const resultSymbol = item.won ? "W" : "L";
    const resultColor = item.won ? styles.colors.win : styles.colors.loss;

   
    const useLightLogo = isDark || lighter;
    const opponentLogoSource =
      useLightLogo && item.opponentLogoLight
        ? item.opponentLogoLight
        : item.opponentLogo;

    return (
      <View
        style={[
          styles.row,
          {
            borderBottomColor: lighter ? "#ccc" : isDark ? "#444" : "#ccc",
            borderBottomWidth: index === team.games.length - 1 ? 0 : 1,
          },
        ]}
      >
        <Text style={[styles.cell, styles.date]}>{item.date}</Text>

        <View style={[styles.cell, styles.teamWithLogo]}>
          <Text style={styles.matchupText}>
            {matchupSymbol} {item.opponent}
          </Text>
          {opponentLogoSource && (
            <Image source={opponentLogoSource} style={styles.opponentLogo} />
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
      <HeadingTwo lighter={lighter}>Last Five Games</HeadingTwo>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <FixedWidthTabBar
          tabs={tabs}
          lighter={lighter}
          selected={selected}
          onTabPress={setSelected}
          renderLabel={(tab, isSelected) => {
            const teamData = tab === "home" ? home : away;

            const useLightLogo = isDark || lighter;
            const logoSource =
              useLightLogo && teamData.teamLogoLight
                ? teamData.teamLogoLight
                : teamData.teamLogo;

            return (
              <View style={styles.tabLabel}>
                <Image
                  source={logoSource}
                  style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                />
                <Text
                  style={[
                    styles.tabText,
                    isSelected
                      ? styles.tabTextSelected
                      : styles.tabTextUnselected,
                  ]}
                >
                  {teamData.teamCode}
                </Text>
              </View>
            );
          }}
        />
      </View>

      {/* Game List */}
      <FlatList
        data={team.games}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRow}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>No recent games.</Text>}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.date]}>Date</Text>
            <Text style={[styles.cell, styles.teamHeader]}>Matchup</Text>
            <Text style={styles.cell}>Result</Text>
          </View>
        }
      />
    </View>
  );
}
