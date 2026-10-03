import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Basketball/Games/GamesList";
import { ConferenceStandingsList } from "@/components/Sports/Basketball/Standings/ConferenceStandingsList";
import Roster from "@/components/Sports/Basketball/Team/Roster";
import RosterStats from "@/components/Sports/Basketball/Team/RosterStats";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import { Colors } from "@/constants/styles";
import { getMCBBTeam, getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { useBasketballTeamGames } from "@/hooks/BasketballHooks/useBasketballTeamGames";
import { useConferenceStandings } from "@/hooks/BasketballHooks/useConferenceStandings";
import { useTeamStats } from "@/hooks/BasketballHooks/useTeamStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import useTeamDetails from "@/hooks/useTeams";
import { getMCBBSeason } from "@/utils/dateUtils";
import MonthSelector from "components/League/MonthSelector";
import NewsList from "components/News/NewsList";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { useLocalSearchParams } from "expo-router";
import { useRosterStats } from "hooks/NBAHooks/useRosterStats";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { View } from "react-native";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "mcbb";
  const currentSeason = getMCBBSeason();
  const styles = TeamDetailStyles;
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number.parseInt(teamIdStr ?? "", 10);
  const team = getMCBBTeam(teamIdNum);
  const teamColor = team?.color ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.white;
  const {
    teamDetails,
    loading: teamDetailsLoading,
    error: teamDetailsError,
  } = useTeamDetails(league, teamIdNum);
  const conferenceId = teamDetails?.conferenceId;
  const teamName = team?.name;
  const espnId = team?.espnId ?? 0;
  const teamLogo = getMCBBTeamLogo(teamIdNum, true);
  const screen = useTeamDetailScreen({
    tabLeague: league,
    header: {
      league,
      teamId: teamIdNum,
      teamName,
      teamColor,
      logo: teamLogo,
      favorite: team
        ? { lookupId: team.id ?? 0, toggleId: teamIdNum }
        : undefined,
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

  const {
    conferences,
    conferencesLoading,
    ConferencesRefreshing,
    conferencesError,
    refresh: refreshConferenceStandings,
  } = useConferenceStandings(league, conferenceId, {
    enabled: selectedTab === "standings" || hasVisitedTab("standings"),
  });

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
  } = useRosterStats(teamIdNum, league, { enabled: hasVisitedTab("stats") });

  const {
    teamStats,
    loading: teamStatsLoading,
    error: teamStatsError,
  } = useTeamStats({
    enabled: hasVisitedTab("stats"),
    teamId: espnId,
    league,
  });

  const {
    players,
    loading: playersLoading,
    error: playersError,
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
  } = useBasketballTeamGames(league, espnId, currentSeason);

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
          teamId={teamIdStr}
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
        <ConferenceStandingsList
          conferences={conferences}
          loading={
            conferencesLoading ||
            teamDetailsLoading ||
            (!teamDetails && !teamDetailsError)
          }
          refreshing={ConferencesRefreshing}
          error={conferencesError || teamDetailsError}
          onRefresh={refreshConferenceStandings}
          league={league}
        />
      </View>

      <View key="forum" style={styles.contentArea}>
        <ForumFeed teamId={teamIdStr} league={league} />
      </View>
    </SharedTeamDetailScreen>
  );
}
