import ForumFeed from "@/components/Forum/ForumFeed";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import GamesList from "@/components/Sports/Football/Games/GamesList";
import { Colors } from "@/constants/styles";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { useFootballTeamGames } from "@/hooks/FootballHooks/useFootballTeamGames";
import useTeamDetails from "@/hooks/useTeams";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import SharedTeamDetailScreen from "components/Team/TeamDetailScreen";
import { useLocalSearchParams } from "expo-router";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { getFootballSeason } from "utils/dateUtils";
import { getFirstSeasonGame } from "utils/seasonGames";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "ufl";
  const currentSeason = getFootballSeason();
  const styles = teamDetailStyles;
  const { teamId } = useLocalSearchParams();
  const teamIdNum = Number(teamId);
  const team = getUFLTeam(teamIdNum);
  const teamLogo = getUFLTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const teamName = team?.name;
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
  const { selectedTab, hasVisitedTab, refreshing, isDark, modalVisible, setModalVisible } = screen;
  const [standingsYear, setStandingsYear] = useState(
    getFootballSeason().toString(),
  );

  const { teamDetails } = useTeamDetails(league, teamIdNum);

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
    games: teamGames,
    loading: gamesLoading,
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useFootballTeamGames(teamIdNum, league, currentSeason);

  const firstSeasonGame = useMemo(
    () => getFirstSeasonGame(teamGames),
    [teamGames],
  );

  const handleRefresh = async () => {
    try {
      await screen.runRefresh(async () => {
        if (selectedTab === "schedule") {
          await refreshTeamGames?.();
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
          <ForumFeed teamId={teamId as string} league={league} />
        </View>
    </SharedTeamDetailScreen>
  );
}
