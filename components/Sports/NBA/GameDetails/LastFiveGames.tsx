// ---- LastFiveGamesSwitcher.tsx ----
import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "components/TabBars/FixedWidthTabBar";
import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { lastFiveGameStyles } from "styles/GameDetailStyles/LastFiveGames.styles";
import { LeagueType } from "types/types";

import { getCBBTeamLogo } from "constants/teamsCBB";
import { getTeamLogo } from "constants/teams";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getCFBTeamLogo } from "constants/teamsCFB";

type TeamData = {
  teamId?: number; // 👈 make optional to reflect real data
  teamCode: string | undefined;
  games: any[];
};

type Props = {
  isDark: boolean;
  lighter?: boolean;
  home: TeamData;
  away: TeamData;
  league: LeagueType;
};

export default function LastFiveGames({
  isDark,
  lighter,
  home,
  away,
  league,
}: Props) {
  const [selected, setSelected] = useState<"home" | "away">("away");
  const team = selected === "home" ? home : away;

  const styles = lastFiveGameStyles(isDark, lighter ?? false);
const logoIsDark = lighter ? true : isDark;

const resolveLogo = (teamId?: number) => {
  if (!teamId) return undefined;

  switch (league) {
    case "NBA":
      return getTeamLogo(teamId, logoIsDark);
    case "NFL":
      return getNFLTeamLogo(teamId, logoIsDark);
    case "NHL":
      return getNHLTeamLogo(teamId, logoIsDark);
    case "MLB":
      return getMLBTeamLogo(teamId, logoIsDark);
    case "CBB":
      return getCBBTeamLogo(teamId, logoIsDark, false);
    case "WCBB":
      return getCBBTeamLogo(teamId, logoIsDark, true);
    case "CFB":
      return getCFBTeamLogo(teamId, logoIsDark);
    default:
      return undefined;
  }
};


  const renderRow = ({ item, index }: { item: any; index: number }) => {
    const matchupSymbol = item.isHome ? "vs" : "@";
    const resultSymbol = item.won ? "W" : "L";
    const resultColor = item.won ? styles.colors.win : styles.colors.loss;

    const opponentLogo = resolveLogo(item.opponentId);

    return (
      <View
        style={[
          styles.row,
          {
            borderBottomWidth:
              index === team.games.length - 1
                ? 0
                : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Text style={[styles.cell, styles.date]}>{item.date}</Text>

        <View style={[styles.cell, styles.teamWithLogo]}>
          <Text style={styles.matchupText}>
            {matchupSymbol} {item.opponent}
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
          {resultSymbol}{" "}
          {item.isHome ? item.homeScore : item.awayScore} -{" "}
          {item.isHome ? item.awayScore : item.homeScore}
        </Text>
      </View>
    );
  };

  const tabs: readonly ("away" | "home")[] = ["away", "home"];

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Last Five Games</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs}
          lighter={lighter}
          selected={selected}
          onTabPress={(tab) => setSelected(tab as "home" | "away")}
          renderLabel={(tab, isSelected) => {
            const teamData = tab === "home" ? home : away;

            const teamLogo = resolveLogo(teamData.teamId); // ✅ no toString()

            return (
              <View style={styles.tabLabel}>
                {teamLogo && (
                  <Image
                    source={teamLogo}
                    style={[
                      styles.tabLogo,
                      { opacity: isSelected ? 1 : 0.5 },
                    ]}
                    resizeMode="contain"
                  />
                )}

                <Text
                  style={getLabelStyle(isDark, isSelected, lighter, {
                    opacity: isSelected ? 1 : 0.5,
                  })}
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
              <Text style={[styles.cell, styles.teamHeader]}>
                Matchup
              </Text>
              <Text style={styles.cell}>Result</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
