import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import GamesList from "@/components/Sports/Football/Games/GamesList";
import { Colors } from "@/constants/styles";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { useFootballTeamGames } from "@/hooks/FootballHooks/useFootballTeamGames";
import useTeamDetails from "@/hooks/useTeams";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { getFootballSeason } from "utils/dateUtils";
import { getFirstSeasonGame } from "utils/seasonGames";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "UFL";
  const currentSeason = getFootballSeason();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = Number(teamId);
  const team = getUFLTeam(teamIdNum);
  const teamLogo = getUFLTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const favorited = team ? isFavorite(league, team.id) : false;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(
    getFootballSeason().toString(),
  );
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];
  const handlePageChange = (index: number) => {
    setSelectedTab(indexToTab(index));
  };

  const { teamDetails } = useTeamDetails(league, teamIdNum);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(league, 10);

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
    setRefreshing(true);
    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames?.();
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={teamIdNum}
          logo={teamLogo}
          teamColor={teamColor}
          onBack={goBack}
          isTeamScreen={true}
          isFavorite={favorited}
          onToggleFavorite={() => team && toggleFavorite(league, teamIdNum)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [
    navigation,
    isDark,
    team,
    teamIdNum,
    teamColor,
    teamLogo,
    toggleFavorite,
    favorited,
  ]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
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
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
          <TeamForum teamId={teamId as string} league={league} />
        </View>
      </PagerView>

      <TeamInfoModal
        teamDetails={teamDetails}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        teamId={teamIdNum}
        teamLogo={teamLogo}
        league={league}
        isDark={isDark}
      />
    </View>
  );
}
