import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Hockey/Games/GamesList";
import { Colors, globalStyles } from "@/constants/styles";
import { useTeamGames } from "@/hooks/HockeyHooks/useTeamGames";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import MonthSelector from "components/League/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import Roster from "components/Sports/Baseball/Team/Roster";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { useLocalSearchParams } from "expo-router";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useState } from "react";
import { Text, View } from "react-native";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getNHLSeason } from "utils/dateUtils";

export default function TeamDetailScreen() {
  const league = "nhl";
  const styles = TeamDetailStyles;
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamIdStr);
  const team = getNHLTeam(teamIdNum);
  const teamLogo = getNHLTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.midTone;
  const teamName = team?.name;
  const currentSeason = getNHLSeason();
  const [standingsYear, setStandingsYear] = useState(currentSeason);
  const screen = useTeamDetailScreen({
    tabLeague: league,
    header: {
      league,
      teamId: teamIdNum,
      teamName,
      teamColor,
      logo: teamLogo,
      favorite: team ? { lookupId: team.id, toggleId: teamIdNum } : undefined,
      infoEnabled: true,
    },
  });
  const {
    runRefresh,
    selectedTab,
    hasVisitedTab,
    refreshing,
    isDark,
  } = screen;


  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshing: refreshingNews,
    loadingMore: loadingMoreNews,
    refresh: refreshNews,
  } = useTeamNews(league, teamIdNum, 10, {
    enabled: hasVisitedTab("news"),
  });

  const {
    sections,
    loading: playersLoading,
    error: playersError,
    refreshPlayers,
  } = useRoster(teamIdNum, league, { enabled: hasVisitedTab("roster") });

  const {
    games,
    months,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    error: gamesError,
    refresh: refreshTeamGames,
    selectedMonthKey,
    selectMonth,
    firstSeasonGame,
    showCountdown,
  } = useTeamGames("nhl", teamIdNum);

  const handleRefresh = () =>
    runRefresh(async () => {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (selectedTab === "roster") {
        await refreshPlayers();
      }

      if (selectedTab === "news") {
        await refreshNews();
      }
    });

  return (
    <SharedTeamDetailScreen
      ready={Boolean(team)}
      screen={screen}
    >
      <View key="schedule" style={styles.contentArea}>
        <View style={styles.monthSelector}>
          <MonthSelector
            months={months}
            selected={selectedMonthKey}
            onSelect={selectMonth}
            loading={gamesLoading}
          />
        </View>

        <GamesList
          games={games}
          error={gamesError}
          loading={gamesLoading}
          refreshing={gamesRefreshing || refreshing}
          onRefresh={handleRefresh}
          showHeaders={true}
          showCountdown={showCountdown}
          countdownGame={firstSeasonGame}
          scrollEnabled
          teamLogo={teamLogo}
          teamColor={teamColor}
          teamSecondaryColor={teamSecondaryColor}
          teamName={teamName}
        />
      </View>

      <View key="news" style={styles.contentArea}>
        <NewsList
          items={articles}
          loading={newsLoading}
          error={newsError}
          refreshing={refreshingNews}
          loadingMore={loadingMoreNews}
          onRefresh={refreshNews}
          isDark={isDark}
        />
      </View>

      <View key="roster" style={styles.contentArea}>
        <Roster
          sections={sections}
          loading={playersLoading}
          error={playersError}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          league={league}
        />
      </View>

      <View key="stats" style={globalStyles(isDark).emptyContainer}>
        <Text style={globalStyles(isDark).emptyTitle}>Team stats unavailable</Text>
        <Text style={globalStyles(isDark).emptySubText}>Stats are not available for this team yet.</Text>
      </View>

      <View key="standings" style={styles.contentArea}>
        <StandingsList
          year={standingsYear}
          onYearChange={setStandingsYear}
          league={league}
        />
      </View>

      <View key="forum" style={styles.contentArea}>
        <ForumFeed teamId={teamIdStr ?? ""} league={league} />
      </View>
    </SharedTeamDetailScreen>
  );
}
