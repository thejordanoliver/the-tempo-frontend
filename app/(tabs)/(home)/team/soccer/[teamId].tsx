import ForumFeed from "@/components/Forum/ForumFeed";
import MonthSelector from "@/components/League/MonthSelector";
import Roster, {
  SupportedRosterLeague,
} from "@/components/Sports/Baseball/Team/Roster";
import GamesList from "@/components/Sports/Soccer/Games/GamesList";
import { Colors } from "@/constants/styles";
import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { useSoccerTeamGames } from "@/hooks/SoccerHooks/useSoccerTeamGames";
import NewsList from "components/News/NewsList";
import TeamDetailScreenShell from "components/Team/TeamDetailScreen";
import { useLocalSearchParams } from "expo-router";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { resolveSoccerTeamLeague } from "utils/soccerTeamLeague";
import { View } from "react-native";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const styles = TeamDetailStyles;
  const { teamId, league: leagueParam } = useLocalSearchParams<{
    teamId?: string | string[];
    league?: SupportedRosterLeague | SupportedRosterLeague[];
  }>();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamIdStr);
  const team = getSOCCTeam(teamIdNum);
  const league = resolveSoccerTeamLeague(teamIdStr, leagueParam) as SupportedRosterLeague;
  const teamLogo = getSOCCTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const teamName = team?.name;
  const screen = useTeamDetailScreen({
    tabLeague: league === "msoc" || league === "wsoc" ? league : "SOCC",
    header: {
      league,
      teamId: teamIdNum,
      teamName,
      teamColor,
      logo: teamLogo,
      favoriteLeague: "socc",
      favorite: team ? { lookupId: team.id, toggleId: team.id } : undefined,
      infoEnabled: true,
    },
  });
  const { selectedTab, hasVisitedTab, refreshing, isDark } = screen;

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
    games: teamGames,
    months,
    selectedMonthKey,
    selectMonth,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    error: gamesError,
    refresh: refreshTeamGames,
  } = useSoccerTeamGames(teamIdNum, league);

  const {
    sections,
    loading: playersLoading,
    error: playersError,
    refreshPlayers,
  } = useRoster(teamIdNum, "socc", {
    enabled: screen.tabs.includes("roster") && hasVisitedTab("roster"),
  });

  const handleRefresh = () =>
    screen.runRefresh(async () => {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (selectedTab === "news") {
        await refreshNews();
      }
      if (selectedTab === "roster") {
        await refreshPlayers();
      }
    });

  return (
    <TeamDetailScreenShell ready={Boolean(team)} screen={screen}>
      {/* SCHEDULE */}
      <View key="schedule" style={styles.contentArea}>
        <MonthSelector
          months={months}
          selected={selectedMonthKey}
          onSelect={selectMonth}
          loading={gamesLoading}
        />

        <GamesList
          games={teamGames}
          error={gamesError}
          loading={gamesLoading}
          refreshing={gamesRefreshing || refreshing}
          onRefresh={handleRefresh}
          showHeaders={true}
          scrollEnabled={true}
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
          league={league}
        />
      </View>

      {/* FORUM */}
      <View key="forum" style={styles.contentArea}>
        <ForumFeed teamId={teamIdStr ?? ""} league={league} />
      </View>
    </TeamDetailScreenShell>
  );
}
