import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Baseball/Games/GamesList";
import { CBStandingsList } from "@/components/Sports/Baseball/Standings/CBStandingsList";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import { Colors } from "@/constants/styles";
import { getSBTeam, getSBTeamLogo } from "@/constants/teamsSB";
import useTeamDetails from "@/hooks/useTeams";
import { getWNBASeason } from "@/utils/dateUtils";
import MonthSelector from "components/League/MonthSelector";
import NewsList from "components/News/NewsList";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { useLocalSearchParams } from "expo-router";
import { useBaseballTeamGames } from "hooks/BaseballHooks/useBaseballTeamGames";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { View } from "react-native";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function SoftballTeamDetailScreen() {
  const league = "sb";
  const currentSeason = getWNBASeason();
  const styles = teamDetailStyles;
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamIdStr);
  const team = getSBTeam(teamIdNum);
  const teamLogo = getSBTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const teamName = team?.name;
  const screen = useTeamDetailScreen({
    tabLeague: league,
    header: {
      league,
      teamId: team?.id ?? teamIdNum,
      notificationTeamId: teamIdNum,
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
  } = useBaseballTeamGames("sb", teamIdNum ?? null, currentSeason);

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
            scrollEnabled={true}
            showHeaders={true}
            showCountdown={showCountdown}
            countdownGame={firstSeasonGame}
            isSB={true}
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
            isDark={screen.isDark}
          />
        </View>

        <View key="standings">
          <CBStandingsList league="sb" />
        </View>

        <View key="forum" style={styles.contentArea}>
          <ForumFeed teamId={teamIdStr ?? ""} league={league} />
        </View>
    </SharedTeamDetailScreen>
  );
}
