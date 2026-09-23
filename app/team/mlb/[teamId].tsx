import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Baseball/Games/GamesList";
import RosterStats from "@/components/Sports/Baseball/Team/RosterStats";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import { Colors } from "@/constants/styles";
import { useRosterStats } from "@/hooks/BaseballHooks/useRosterStats";
import { useTeamStats } from "@/hooks/BaseballHooks/useTeamStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import useTeamDetails from "@/hooks/useTeams";
import MonthSelector from "components/League/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import Roster from "components/Sports/Baseball/Team/Roster";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { useLocalSearchParams } from "expo-router";
import { useBaseballTeamGames } from "hooks/BaseballHooks/useBaseballTeamGames";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useState } from "react";
import { View } from "react-native";
import { getMLBSeason } from "utils/dateUtils";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "mlb";
  const currentSeason = getMLBSeason();
  const styles = teamDetailStyles;
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamIdStr);
  const team = getMLBTeam(teamIdNum);
  const espnId = team?.espnId ?? 0;
  const teamLogo = getMLBTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.midTone;
  const teamName = team?.name;
  const [standingsYear, setStandingsYear] = useState(currentSeason.toString());
  const screen = useTeamDetailScreen({
    tabLeague: league,
    header: {
      league,
      teamId: teamIdNum,
      teamName,
      teamColor,
      logo: teamLogo,
      favorite: team ? { lookupId: team.id, toggleId: team.id } : undefined,
      infoEnabled: true,
    },
  });

  const { teamDetails } = useTeamDetails(league, teamIdNum);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshing: refreshingNews,
    loadingMore: loadingMoreNews,
    refresh: refreshNews,
  } = useTeamNews(league, teamIdNum, 10, {
    enabled: screen.hasVisitedTab("news"),
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
  } = useBaseballTeamGames("mlb", teamIdNum, currentSeason);

  const handleRefresh = () =>
    screen.runRefresh(async () => {
      if (screen.selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (screen.selectedTab === "news") {
        await refreshNews();
      }
    });

  return (
    <SharedTeamDetailScreen
      ready={Boolean(team)}
      screen={screen}
      footer={
        <TeamInfoModal
          teamDetails={teamDetails}
          visible={screen.modalVisible}
          onClose={() => screen.setModalVisible(false)}
          teamId={teamIdNum}
          teamLogo={teamLogo}
          league={league}
        />
      }
    >
        {/* SCHEDULE */}
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
            refreshing={gamesRefreshing || screen.refreshing}
            onRefresh={handleRefresh}
            showHeaders={true}
            showCountdown={showCountdown}
            countdownGame={firstSeasonGame}
            scrollEnabled={true}
            teamLogo={teamLogo}
            teamColor={teamColor}
            teamSecondaryColor={teamSecondaryColor}
            teamName={teamName}
          />
        </View>

        {/* NEWS */}
        <View key="news" style={styles.contentArea}>
          <NewsList
            items={articles}
            loading={newsLoading}
            error={newsError}
            refreshing={refreshingNews}
            loadingMore={loadingMoreNews}
            onRefresh={refreshNews}
            isDark={screen.isDark}
          />
        </View>

        {/* ROSTER */}
        <View key="roster" style={styles.contentArea}>
          <Roster
            players={players}
            loading={playersLoading}
            error={playersError}
            refreshing={screen.refreshing}
            onRefresh={handleRefresh}
            league={league}
          />
        </View>

        {/* STATS */}
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

        {/* STANDINGS */}
        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league={league}
          />
        </View>

        {/* FORUM */}
        <View key="forum" style={styles.contentArea}>
          <ForumFeed teamId={teamIdStr} league={league} />
        </View>
    </SharedTeamDetailScreen>
  );
}
