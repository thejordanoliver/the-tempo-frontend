// ---- LastFiveGames.tsx ----
import { getUFLTeamLogo } from "@/constants/teamsUFL";
import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { lastFiveGameStyles } from "styles/GameDetailStyles/LastFiveGames.styles";

type LastFiveGame = {
  id: number;
  date: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  won: boolean;
  opponentId?: number | null;
  opponent?: string | { id?: number; name?: string; code?: string };
  opponentLogo?: any;
};

type TeamData = {
  teamId?: number;
  teamCode: string | undefined;
  games: LastFiveGame[];
};

type Props = {
  isDark: boolean;
  home: TeamData;
  away: TeamData;
  league: string;
  gameStatusDescription: string;
};

export default function LastFiveGames({
  isDark,
  home,
  away,
  league,
  gameStatusDescription,
}: Props) {
  const [selected, setSelected] = useState<"home" | "away">("away");
  const team = selected === "home" ? home : away;

  const styles = lastFiveGameStyles(isDark);

  const resolveTeam = (teamId?: number | null) => {
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
      case "CB":
        return getCBTeam(teamId);
      case "SB":
        return getSBTeam(teamId);
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

  const resolveLogo = (teamId?: number | null) => {
    if (!teamId) return undefined;

    switch (league) {
      case "NBA":
        return getTeamLogo(teamId, isDark);
      case "WNBA":
        return getWNBATeamLogo(teamId, isDark);
      case "NFL":
        return getNFLTeamLogo(teamId, isDark);
      case "UFL":
        return getUFLTeamLogo(teamId, isDark);
      case "NHL":
        return getNHLTeamLogo(teamId, isDark);
      case "MLB": {
        const mlbTeam = getMLBTeam(teamId);
        return getMLBTeamLogo(mlbTeam?.id ?? teamId, isDark);
      }
      case "CB":
        return getCBTeamLogo(teamId, isDark);
      case "SB":
        return getSBTeamLogo(teamId, isDark);
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

  const getOpponentId = (item: LastFiveGame) => {
    if (item.opponentId) return item.opponentId;

    if (typeof item.opponent === "object" && item.opponent?.id) {
      return Number(item.opponent.id);
    }

    return null;
  };

  const getOpponentCode = (item: LastFiveGame, fallbackTeam?: any) => {
    if (fallbackTeam?.code) return fallbackTeam.code;

    if (typeof item.opponent === "string") return item.opponent;

    return item.opponent?.code || item.opponent?.name || "TBD";
  };

  const renderRow = ({
    item,
    index,
  }: {
    item: LastFiveGame;
    index: number;
  }) => {
    const matchupSymbol = item.isHome ? "vs" : "@";
    const resultSymbol = item.won ? "W" : "L";
    const resultColor = item.won ? styles.colors.win : styles.colors.loss;

    const opponentId = getOpponentId(item);
    const opponent = resolveTeam(opponentId);
    const opponentLogo = resolveLogo(opponentId);
    const opponentCode = getOpponentCode(item, opponent);

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

  const hasHomeGames = home?.games?.length > 0;
  const hasAwayGames = away?.games?.length > 0;

  if (!hasHomeGames && !hasAwayGames) return null;

  if (gameStatusDescription === "Final") return null;

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
