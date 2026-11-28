import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Baseball/Games/GamesList";
import { CBStandingsList } from "@/components/Sports/Baseball/Standings/CBStandingsList";
import RosterStats from "@/components/Team/BaseballRosterStats";
import { Colors } from "@/constants/styles";
import { useRosterStats } from "@/hooks/BaseballHooks/useRosterStats";
import { useTeamStats } from "@/hooks/BaseballHooks/useTeamStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import MonthSelector from "components/League/Selectors/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import TransactionList from "components/League/Transactions/TransactionList";
import NewsList from "components/News/NewsList";
import Roster from "components/Team/Roster";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { useBaseballTeamGames } from "hooks/BaseballHooks/useBaseballTeamGames";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useState } from "react";
import { View } from "react-native";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getMLBSeason } from "utils/common/dateUtils";
import type { TeamLeague } from "utils/navigation/teamNavigation";

const teamLookups = {
  mlb: { getTeam: getMLBTeam, getLogo: getMLBTeamLogo },
  cb: { getTeam: getCBTeam, getLogo: getCBTeamLogo },
  sb: { getTeam: getSBTeam, getLogo: getSBTeamLogo },
};

export default function BaseballTeamScreen({
  league,
  teamId: teamIdStr,
}: {
  league: TeamLeague<"baseball">;
  teamId: string;
}) {
  const styles = TeamDetailStyles;
  const teamIdNum = Number(teamIdStr);
  const { getTeam, getLogo } = teamLookups[league];
  const team = getTeam(teamIdNum);
  const teamLogo = getLogo(teamIdNum, true);
  const isMLB = league === "mlb";
  const teamColor = team?.primaryColor ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.midTone;
  const teamName = team?.name;
  const [standingsYear, setStandingsYear] = useState(() =>
    getMLBSeason().toString(),
  );
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
  } = useBaseballTeamGames(league, teamIdNum);

  const screen = useTeamDetailScreen({
    loading: Boolean(team) && gamesLoading,
    tabLeague: league,
    header: {
      league,
      teamId: isMLB ? teamIdNum : (team?.id ?? teamIdNum),
      notificationTeamId: teamIdNum,
      teamName: team?.name,
      teamColor,
      logo: teamLogo,
      favorite: team
        ? { lookupId: team.id, toggleId: isMLB ? teamIdNum : team.id }
        : undefined,
      infoEnabled: true,
    },
  });
  const { runRefresh, hasVisitedTab, selectedTab, refreshing, isDark } = screen;

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
  } = useRosterStats(teamIdNum, "mlb", {
    enabled: hasVisitedTab("stats"),
  });

  const {
    teamStats,
    loading: teamStatsLoading,
    refresh: refreshTeamStats,
    error: teamStatsError,
  } = useTeamStats({
    enabled: hasVisitedTab("stats"),
    teamId: teamIdNum,
    league: "mlb",
  });

  const {
    sections,
    loading: playersLoading,
    error: playersError,
    refreshPlayers,
  } = useRoster(teamIdNum, league, { enabled: hasVisitedTab("roster") });

  const handleRefresh = () =>
    runRefresh(async () => {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (selectedTab === "roster") {
        await refreshPlayers();
      }

      if (selectedTab === "stats") {
        await Promise.all([refetch(), refreshTeamStats()]);
      }

      if (selectedTab === "news") {
        await refreshNews();
      }
    });

  return (
    <SharedTeamDetailScreen ready={Boolean(team)} screen={screen}>
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
          refreshing={gamesRefreshing || refreshing}
          onRefresh={handleRefresh}
          showHeaders={true}
          showCountdown={showCountdown}
          countdownGame={firstSeasonGame}
          scrollEnabled={true}
          isCB={league === "cb"}
          isSB={league === "sb"}
          teamLogo={isMLB ? teamLogo : undefined}
          teamColor={isMLB ? teamColor : undefined}
          teamSecondaryColor={isMLB ? teamSecondaryColor : undefined}
          teamName={isMLB ? teamName : undefined}
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
          sections={sections}
          loading={playersLoading}
          error={playersError}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          league="mlb"
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
          refreshing={refreshingStats || refreshing}
          onRefresh={handleRefresh}
          league="mlb"
        />
      </View>

      {/* STANDINGS */}
      <View key="standings" style={styles.contentArea}>
        {isMLB ? (
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league={league}
          />
        ) : (
          <CBStandingsList league={league} />
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
