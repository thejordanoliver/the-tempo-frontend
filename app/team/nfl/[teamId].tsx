import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import { Roster } from "components/Sports/CFB/Team/Roster";
import { FootballRosterStats } from "components/Sports/CFB/Team/RosterStats";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import NFLGamesList from "components/Sports/NFL/Games/NFLGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getNFLTeam } from "constants/teamsNFL";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useFootballTeamGames } from "hooks/NFLHooks/useFootballTeamGames";
import { useTeamTabs } from "hooks/useLeagueTabs";
import { useLayoutEffect, useRef, useState } from "react";
import { ScrollView, View, useColorScheme } from "react-native";
import PagerView from "react-native-pager-view";
import { getFootballSeason } from "utils/dateUtils";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "NFL";
  const isDark = useColorScheme() === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const team = getNFLTeam(teamIdNum ?? 0);
  const favorited = team ? isFavorite(league, team.id) : false;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(
    getFootballSeason().toString(),
  );
  const rosterRef = useRef<{ refresh: () => void }>(null);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs("NFL");
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
    games: teamGames,
    loading: gamesLoading,
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useFootballTeamGames(teamIdNum ?? 0, String(getFootballSeason()), 2);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames?.();
      } else if (selectedTab === "roster") {
        rosterRef.current?.refresh();
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
          teamId={team?.id}
          logo={team?.logoLight || team?.logo}
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
  }, [navigation, isDark, team, favorited]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator isDark={isDark} />
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
        {/* Schedule Page */}
        <View key="schedule" style={styles.contentArea}>
          <NFLGamesList
            games={teamGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showHeaders={true}
          />
        </View>

        {/* News Page */}
        <ScrollView key="news" style={styles.contentArea}></ScrollView>

        {/* Roster Page */}
        <View key="roster" style={styles.contentArea}>
          <Roster
            ref={rosterRef}
            teamId={String(team.id)}
            teamName={team.name}
            league="NFL"
          />
        </View>

        {/* Stats Page */}
        <ScrollView key="stats" contentContainerStyle={{ paddingBottom: 100 }}>
          {team?.espnID && team?.id && (
            <FootballRosterStats
              espnID={Number(team.espnID)}
              teamID={Number(team.id)}
            />
          )}
        </ScrollView>

        {/* Standings Page */}
        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="NFL"
          />
        </View>

        {/* Forum Page */}
        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamId as string} league="NFL" />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="NFL"
        />
      )}
    </View>
  );
}
