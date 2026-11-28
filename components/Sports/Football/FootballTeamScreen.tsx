import ForumFeed from "@/components/Forum/ForumFeed";
import { ConferenceStandingsList } from "@/components/League/Standings/ConferenceStandingsList";
import GamesList from "@/components/Sports/Football/Games/GamesList";
import RosterStats from "@/components/Team/FootballRosterStats";
import Roster from "@/components/Team/Roster";
import { Colors } from "@/constants/styles";
import { useConferenceStandings } from "@/hooks/BasketballHooks/useConferenceStandings";
import { useFootballTeamGames } from "@/hooks/FootballHooks/useFootballTeamGames";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { StandingsList } from "components/League/Standings/StandingsList";
import TransactionList from "components/League/Transactions/TransactionList";
import NewsList from "components/News/NewsList";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getUFLTeam, getUFLTeamLogo } from "constants/teamsUFL";
import { useRosterStats } from "hooks/FootballHooks/useRosterStats";
import { useTeamStats } from "hooks/FootballHooks/useTeamStats";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getFootballSeason } from "utils/common/dateUtils";
import { getFirstSeasonGame } from "utils/games/seasonGames";
import type { TeamLeague } from "utils/navigation/teamNavigation";

const teamLookups = {
  nfl: { getTeam: getNFLTeam, getLogo: getNFLTeamLogo },
  cfb: { getTeam: getCFBTeam, getLogo: getCFBTeamLogo },
  ufl: { getTeam: getUFLTeam, getLogo: getUFLTeamLogo },
};

export default function FootballTeamScreen({
  league,
  teamId: teamIdStr,
}: {
  league: TeamLeague<"football">;
  teamId: string;
}) {
  const styles = TeamDetailStyles;
  const teamIdNum = Number(teamIdStr);
  const { getTeam, getLogo } = teamLookups[league];
  const team = getTeam(teamIdNum);
  const teamLogo = getLogo(teamIdNum, true);
  const isCollege = league === "cfb";
  const hasRoster = league !== "ufl";
  const teamColor = team?.primaryColor ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.midTone;
  const teamName = team?.name;
  const {
    games: teamGames,
    loading: gamesLoading,
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useFootballTeamGames(teamIdNum, league);

  const screen = useTeamDetailScreen({
    loading: Boolean(team) && gamesLoading,
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
    teamDetails,
    teamDetailsLoading,
    teamDetailsError,
  } = screen;
  const {
    conferences,
    conferencesLoading,
    ConferencesRefreshing,
    conferencesError,
    refresh: refreshConferenceStandings,
  } = useConferenceStandings(league, teamDetails?.conferenceId, {
    enabled:
      isCollege && (selectedTab === "standings" || hasVisitedTab("standings")),
  });
  const [standingsYear, setStandingsYear] = useState(() =>
    getFootballSeason(undefined, league).toString(),
  );

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    loadingMore: loadingMoreNews,
    error: newsError,
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

  const firstSeasonGame = useMemo(
    () => getFirstSeasonGame(teamGames),
    [teamGames],
  );

  const handleRefresh = async () => {
    try {
      await runRefresh(async () => {
        if (selectedTab === "schedule") {
          await refreshTeamGames?.();
        } else if (selectedTab === "roster") {
          await refreshPlayers();
        } else if (selectedTab === "news") {
          await refreshNews();
        }
      });
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  };

  return (
    <SharedTeamDetailScreen ready={Boolean(team)} screen={screen}>
      {/* SCHEDULE */}
      <View key="schedule" style={styles.contentArea}>
        <GamesList
          games={teamGames}
          loading={gamesLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          error={gamesError}
          countdownGame={firstSeasonGame}
          isNFL={league === "nfl"}
          isCFB={isCollege}
          showHeaders={true}
          showCountdown={true}
          teamLogo={hasRoster ? teamLogo : undefined}
          teamColor={hasRoster ? teamColor : undefined}
          teamSecondaryColor={hasRoster ? teamSecondaryColor : undefined}
          teamName={hasRoster ? teamName : undefined}
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
        {hasRoster && (
          <Roster
            sections={sections}
            loading={playersLoading}
            error={playersError}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            league={league}
          />
        )}
      </View>

      {/* STATS */}
      <View key="stats" style={styles.contentArea}>
        {hasRoster && (
          <FootballTeamStats
            league={league}
            teamId={teamIdNum}
            refreshing={refreshing}
            runRefresh={runRefresh}
          />
        )}
      </View>

      {/* STANDINGS */}
      <View key="standings" style={styles.contentArea}>
        {isCollege ? (
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
        ) : (
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league={league}
          />
        )}
      </View>

      {/* FORUM */}
      <View key="transactions" style={styles.contentArea}>
        <TransactionList
          league={league}
          team={teamIdNum}
          active={selectedTab === "transactions"}
        />
      </View>

      <View key="forum" style={styles.contentArea}>
        <ForumFeed teamId={teamIdStr} league={league} />
      </View>
    </SharedTeamDetailScreen>
  );
}

function FootballTeamStats({
  league,
  teamId: teamIdNum,
  refreshing,
  runRefresh,
}: {
  league: "nfl" | "cfb";
  teamId: number;
  refreshing: boolean;
  runRefresh: ReturnType<typeof useTeamDetailScreen>["runRefresh"];
}) {
  const {
    teamRoster,
    refreshingStats,
    loading: rosterStatsLoading,
    error: rosterStatsError,
    refetch,
  } = useRosterStats(teamIdNum, league);

  const { teamStats, teamStatsLoading, teamStatsError, refresh } = useTeamStats(
    teamIdNum,
    league,
  );

  return (
    <RosterStats
      rosterStats={teamRoster}
      teamId={teamIdNum}
      teamStats={teamStats}
      loading={rosterStatsLoading || teamStatsLoading}
      error={rosterStatsError || teamStatsError}
      refreshing={refreshingStats || refreshing}
      onRefresh={() =>
        runRefresh(async () => {
          await Promise.all([refetch(), refresh()]);
        })
      }
      league={league}
    />
  );
}
