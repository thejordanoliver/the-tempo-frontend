import FootballGamesList from "@/components/Sports/NFL/Games/FootballGamesList";
import Roster from "@/components/Sports/NFL/Team/Roster";
import RosterStats from "@/components/Sports/NFL/Team/RosterStats";
import { useRosterStats } from "@/hooks/FootballHooks/useRosterStats";
import { useTeamGames } from "@/hooks/FootballHooks/useTeamGames";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { getFootballSeason } from "@/utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import NewsList from "components/News/NewsList";
import { CFBConferenceStandingsList } from "components/Sports/CFB/Standings/CFBConferenceStandingsList";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamStats } from "hooks/FootballHooks/useTeamStats";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLayoutEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";

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
  const espnId = team?.espnId ?? 0;
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
  } = useTeamGames(teamIdNum, league, currentSeason);

  const {
    rosterStats,
    loading: statsLoading,
    error: statsError,
    refreshingStats,
    onRefresh: refreshRosterStats,
  } = useRosterStats(league, teamIdNum);

  const { teamStats, teamStatsLoading, teamStatsError, refresh } = useTeamStats(
    {
      teamId: espnId,
      league: league,
    },
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames?.();
      } else if (selectedTab === "roster") {
        await refreshPlayers();
      } else if (selectedTab === "stats") {
        await Promise.all([refreshRosterStats(), refresh?.()]);
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
        <CustomHeaderTitle
          teamId={team?.id}
          logo={teamLogo}
          teamColor={team?.color}
          onBack={goBack}
          isTeamScreen={true}
          isFavorite={favorited}
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, team, teamLogo, toggleFavorite, favorited]);

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
          <FootballGamesList
            games={teamGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            error={gamesError}
            showHeaders={true}
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
            rosterStats={rosterStats}
            teamStats={teamStats}
            loading={statsLoading || teamStatsLoading}
            error={statsError || teamStatsError}
            refreshing={refreshingStats}
            onRefresh={refreshRosterStats}
            teamId={teamIdNum}
            teamID={Number(team.id)}
            league={league}
          />
        </View>

        {/* FORUM */}
        <View key="standings" style={styles.contentArea}>
          <CFBConferenceStandingsList
            onlyTeamConference={true}
            teamName={team.fullName}
          />
        </View>
        {/* FORUM */}
        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamId as string} league={league} />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league={league}
          isDark={isDark}
        />
      )}
    </View>
  );
}
