import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Hockey/Games/GamesList";
import { Colors, globalStyles } from "@/constants/styles";
import { useTeamGames } from "@/hooks/HockeyHooks/useTeamGames";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import MonthSelector from "components/League/Selectors/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import Roster from "components/Team/Roster";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { resolveImage } from "utils/customheader/utils";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useState } from "react";
import { Text, View } from "react-native";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getNHLSeason } from "utils/common/dateUtils";
import type { TeamLeague } from "utils/navigation/teamNavigation";

export default function HockeyTeamScreen({
  league,
  teamId: teamIdStr,
}: {
  league: TeamLeague<"hockey">;
  teamId: string;
}) {
  const styles = TeamDetailStyles;
  const teamIdNum = Number(teamIdStr);
  const currentSeason = getNHLSeason();
  const [standingsYear, setStandingsYear] = useState(currentSeason);
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
  } = useTeamGames(league, teamIdNum);

  const screen = useTeamDetailScreen({
    loading: gamesLoading,
    useStoredTeamIdentity: true,
    tabLeague: league,
    header: {
      league,
      teamId: teamIdNum,
      teamColor: Colors.midTone,
      logo: PlaceholderLogo,
      infoEnabled: true,
    },
  });
  const team = screen.teamDetails;
  const teamLogo =
    resolveImage(team?.logoDark || team?.logo) ?? PlaceholderLogo;
  const teamColor = team?.primaryColor ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.midTone;
  const teamName = team?.name;

  const { runRefresh, selectedTab, hasVisitedTab, refreshing, isDark } = screen;

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
      ready={Boolean(team) || screen.loading}
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
        <Text style={globalStyles(isDark).emptyTitle}>
          Team stats unavailable
        </Text>
        <Text style={globalStyles(isDark).emptySubText}>
          Stats are not available for this team yet.
        </Text>
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
