import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Basketball/Games/GamesList";
import Roster from "@/components/Sports/Basketball/Team/Roster";
import RosterStats from "@/components/Sports/Basketball/Team/RosterStats";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import { Colors } from "@/constants/styles";
import { useBasketballTeamGames } from "@/hooks/BasketballHooks/useBasketballTeamGames";
import { useTeamStats } from "@/hooks/BasketballHooks/useTeamStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { useRosterStats } from "@/hooks/NBAHooks/useRosterStats";
import useTeamDetails from "@/hooks/useTeams";
import MonthSelector from "components/League/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { useLocalSearchParams } from "expo-router";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useState } from "react";
import { View } from "react-native";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getWNBASeason } from "utils/dateUtils";

export default function TeamDetailScreen() {
  const league = "wnba";
  const currentSeason = getWNBASeason();
  const styles = teamDetailStyles;
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number.parseInt(teamIdStr ?? "", 10);
  const team = getWNBATeam(teamIdNum);
  const teamColor = team?.color ?? Colors.midTone;
  const teamName = team?.name;
  const espnId = team?.espnId ?? 0;
  const teamLogo = getWNBATeamLogo(teamIdNum, true);
  const [standingsYear, setStandingsYear] = useState(currentSeason.toString());
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
    hasVisitedTab,
    selectedTab,
    refreshing,
    modalVisible,
    setModalVisible,
    isDark,
  } = screen;

  const { teamDetails } = useTeamDetails(league, teamIdNum);

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
    teamRoster,
    refreshingStats,
    loading: rosterStatsLoading,
    error: rosterStatsError,
    refetch,
  } = useRosterStats(teamIdNum, league);

  const {
    teamStats,
    loading: teamStatsLoading,
    error: teamStatsError,
  } = useTeamStats({
    teamId: espnId,
    league,
  });

  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = useRoster(teamIdNum, league);

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
  } = useBasketballTeamGames("wnba", teamIdNum, currentSeason);

  const handleRefresh = async () => {
    await screen.runRefresh(async () => {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (selectedTab === "news") {
        await refreshNews();
      }

      if (selectedTab === "stats") {
        await refetch();
      }
    });
  };

  return (
    <SharedTeamDetailScreen
      ready={Boolean(team)}
      screen={screen}
      footer={
        <TeamInfoModal
          teamDetails={teamDetails}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={teamIdNum}
          teamLogo={teamLogo}
          league={league}
        />
      }
    >
        <View key="schedule" style={styles.contentArea}>
          <MonthSelector
            months={months}
            selected={selectedMonthKey}
            onSelect={selectMonth}
            loading={gamesLoading}
          />

          <GamesList
            games={games}
            error={gamesError}
            loading={gamesLoading}
            refreshing={gamesRefreshing || refreshing}
            onRefresh={handleRefresh}
            showCountdown={showCountdown}
            countdownGame={firstSeasonGame}
            scrollEnabled={true}
            showHeaders={true}
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
            players={players}
            loading={playersLoading}
            error={playersError}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            league={league}
          />
        </View>

        <View key="stats" style={styles.contentArea}>
          <RosterStats
            rosterStats={teamRoster}
            teamId={teamIdNum}
            teamStats={teamStats}
            loading={rosterStatsLoading || teamStatsLoading}
            error={rosterStatsError || teamStatsError}
            refreshing={refreshingStats}
            onRefresh={refetch}
            league={league}
          />
        </View>

        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league={league}
          />
        </View>

        <View key="forum" style={styles.contentArea}>
          <ForumFeed teamId={teamIdStr} league={league} />
        </View>
    </SharedTeamDetailScreen>
  );
}
