import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Basketball/Games/GamesList";
import Roster from "@/components/Sports/Basketball/Team/Roster";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import { Colors } from "@/constants/styles";
import { getGLeagueTeam, getGLeagueTeamLogo } from "@/constants/teamsGLeague";
import { useBasketballTeamGames } from "@/hooks/BasketballHooks/useBasketballTeamGames";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import useTeamDetails from "@/hooks/useTeams";
import MonthSelector from "components/League/MonthSelector";
import NewsList from "components/News/NewsList";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { useLocalSearchParams } from "expo-router";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { View } from "react-native";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getNBASeason } from "utils/dateUtils";

export default function GLeagueTeamDetailScreen() {
  const league = "gleague";
  const currentSeason = getNBASeason();
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number.parseInt(teamIdStr ?? "", 10);
  const team = getGLeagueTeam(teamIdNum);
  const teamLogo = getGLeagueTeamLogo(teamIdNum, true);
  const screen = useTeamDetailScreen({
    tabLeague: league,
    header: {
      league,
      teamId: teamIdNum,
      teamName: team?.name,
      teamColor: team?.color ?? Colors.midTone,
      logo: teamLogo,
      favorite: team?.id
        ? { lookupId: team.id, toggleId: teamIdNum }
        : undefined,
      infoEnabled: true,
    },
  });
  const { hasVisitedTab, selectedTab, refreshing, modalVisible, setModalVisible, isDark } = screen;
  const { teamDetails } = useTeamDetails(league, teamIdNum);
  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshing: refreshingNews,
    loadingMore: loadingMoreNews,
    refresh: refreshNews,
  } = useTeamNews(league, teamIdNum, 10, { enabled: hasVisitedTab("news") });
  const { players, loading: playersLoading, error: playersError, refreshPlayers } =
    useRoster(teamIdNum, league);
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
  } = useBasketballTeamGames(league, teamIdNum, currentSeason);

  const handleRefresh = async () => {
    await screen.runRefresh(async () => {
      if (selectedTab === "schedule") await refreshTeamGames();
      if (selectedTab === "news") await refreshNews();
      if (selectedTab === "roster") await refreshPlayers();
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
      <View key="schedule" style={teamDetailStyles.contentArea}>
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
          scrollEnabled
          showHeaders
        />
      </View>

      <View key="news" style={teamDetailStyles.contentArea}>
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

      <View key="roster" style={teamDetailStyles.contentArea}>
        <Roster
          players={players}
          loading={playersLoading}
          error={playersError}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          league={league}
        />
      </View>

      <View key="forum" style={teamDetailStyles.contentArea}>
        <ForumFeed teamId={teamIdStr} league={league} />
      </View>
    </SharedTeamDetailScreen>
  );
}
