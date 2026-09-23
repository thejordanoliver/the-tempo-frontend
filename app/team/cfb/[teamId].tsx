import ForumFeed from "@/components/Forum/ForumFeed";
import Roster from "@/components/Sports/Baseball/Team/Roster";
import { ConferenceStandingsList } from "@/components/Sports/Basketball/Standings/ConferenceStandingsList";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import GamesList from "@/components/Sports/Football/Games/GamesList";
import RosterStats from "@/components/Sports/Football/Team/RosterStats";
import { Colors } from "@/constants/styles";
import { useConferenceStandings } from "@/hooks/BasketballHooks/useConferenceStandings";
import { useFootballTeamGames } from "@/hooks/FootballHooks/useFootballTeamGames";
import { useRosterStats } from "@/hooks/FootballHooks/useRosterStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import useTeamDetails from "@/hooks/useTeams";
import { getFootballSeason } from "@/utils/dateUtils";
import NewsList from "components/News/NewsList";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { useTeamStats } from "hooks/FootballHooks/useTeamStats";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useMemo } from "react";
import { View } from "react-native";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getFirstSeasonGame } from "utils/seasonGames";

export default function TeamDetailScreen() {
  const league = "cfb";
  const currentSeason = getFootballSeason();
  const styles = teamDetailStyles;
  const { teamId } = useLocalSearchParams();
  const teamIdNum = Number(teamId);
  const team = getCFBTeam(teamIdNum);
  const { teamDetails } = useTeamDetails(league, teamIdNum);
  const conferenceId = teamDetails?.conferenceId;
  const espnId = team?.espnId ?? 0;
  const teamColor = team?.color ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.midTone;
  const teamName = team?.name;
  const teamLogo = getCFBTeamLogo(teamIdNum, true);
  const screen = useTeamDetailScreen({
    tabLeague: league,
    header: {
      league,
      teamId: teamIdNum,
      teamName,
      teamColor,
      logo: teamLogo,
      favorite: team ? { lookupId: teamIdNum, toggleId: teamIdNum } : undefined,
      infoEnabled: true,
    },
  });
  const { selectedTab, hasVisitedTab, refreshing, isDark, modalVisible, setModalVisible } = screen;

  const { conferences, conferencesLoading, conferencesError } =
    useConferenceStandings(league, conferenceId);

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
    players,
    loading: playersLoading,
    error: playersError,
    refreshPlayers,
  } = useRoster(teamIdNum, league);

  const {
    games: teamGames,
    loading: gamesLoading,
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useFootballTeamGames(teamIdNum, league, currentSeason);

  const {
    teamRoster,
    refreshingStats,
    loading: rosterStatsLoading,
    error: rosterStatsError,
    refetch,
  } = useRosterStats(teamIdNum, league);

  const { teamStats, teamStatsLoading, teamStatsError, refresh } = useTeamStats(
    espnId,
    league,
  );

  const firstSeasonGame = useMemo(
    () => getFirstSeasonGame(teamGames),
    [teamGames],
  );

  const handleRefresh = async () => {
    try {
      await screen.runRefresh(async () => {
        if (selectedTab === "schedule") {
          await refreshTeamGames?.();
        } else if (selectedTab === "roster") {
          await refreshPlayers();
        } else if (selectedTab === "stats") {
          await Promise.all([refetch(), refresh?.()]);
        }
      });
    } catch (err) {
      console.error("Refresh failed:", err);
    }
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
        {/* SCHEDULE */}
        <View key="schedule" style={styles.contentArea}>
          <GamesList
            games={teamGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            error={gamesError}
            showHeaders={true}
            showCountdown={true}
            countdownGame={firstSeasonGame}
            isCFB={true}
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
            isDark={isDark}
          />
        </View>

        {/* ROSTER */}
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
          <ConferenceStandingsList
            conferences={conferences}
            loading={conferencesLoading}
            error={conferencesError}
            league={league}
          />
        </View>

        {/* FORUM */}
        <View key="forum" style={styles.contentArea}>
          <ForumFeed teamId={teamId as string} league={league} />
        </View>
    </SharedTeamDetailScreen>
  );
}
