import Roster from "@/components/Sports/Baseball/Team/Roster";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import GamesList from "@/components/Sports/Football/Games/GamesList";
import RosterStats from "@/components/Sports/Football/Team/RosterStats";
import { Colors } from "@/constants/styles";
import { useCFBConferenceStandings } from "@/hooks/FootballHooks/useCFBConferenceStandings";
import { useFootballTeamGames } from "@/hooks/FootballHooks/useFootballTeamGames";
import { useRosterStats } from "@/hooks/FootballHooks/useRosterStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import useTeamDetails from "@/hooks/useTeams";
import { getFootballSeason } from "@/utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import NewsList from "components/News/NewsList";
import { CFBConferenceStandingsList } from "components/Sports/Football/Standings/CFBConferenceStandingsList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamStats } from "hooks/FootballHooks/useTeamStats";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getFirstSeasonGame } from "utils/seasonGames";
import { CustomHeader } from "../../../components/CustomHeader";

export default function TeamDetailScreen() {
  const league = "CFB";
  const currentSeason = getFootballSeason();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = Number(teamId);
  const team = getCFBTeam(teamIdNum);
  const { teamDetails } = useTeamDetails(league, teamIdNum);
  const conferenceId = teamDetails?.conferenceId;
  const espnId = team?.espnId ?? 0;
  const teamColor = team?.color ?? Colors.midTone;
  const teamLogo = getCFBTeamLogo(teamIdNum, true);
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const favorited = team ? isFavorite(league, teamIdNum) : false;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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

  const { conferences, conferencesLoading, conferencesError } =
    useCFBConferenceStandings(conferenceId);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshing: refreshingNews,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

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
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames?.();
      } else if (selectedTab === "roster") {
        await refreshPlayers();
      } else if (selectedTab === "stats") {
        await Promise.all([refetch(), refresh?.()]);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
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
    team,
    teamColor,
    teamLogo,
    toggleFavorite,
    favorited,
    teamIdNum,
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
            isCFB={true}
          />
        </View>

        {/* NEWS */}
        <View key="news" style={styles.contentArea}>
          <NewsList
            items={articles}
            loading={newsLoading}
            error={newsError}
            refreshing={refreshingNews}
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
          <CFBConferenceStandingsList
            conferences={conferences}
            loading={conferencesLoading}
            error={conferencesError}
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
