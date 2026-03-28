import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import CFBGamesList from "components/Sports/CFB/Games/CFBGamesList";
import { CFBConferenceStandingsList } from "components/Sports/CFB/Standings/CFBConferenceStandingsList";
import { Roster } from "components/Sports/CFB/Team/Roster";
import { FootballRosterStats } from "components/Sports/CFB/Team/RosterStats";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getCFBTeam } from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useFootballTeamGames } from "hooks/NFLHooks/useFootballTeamGames";
import { useTeamTabs } from "hooks/useLeagueTabs";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useLayoutEffect, useRef, useState } from "react";
import { ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";

export default function TeamDetailScreen() {
  const isDark = useColorScheme() === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const team = getCFBTeam(Number(teamIdNum));
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs("CFB");
  const rosterRef = useRef<{ refresh: () => void }>(null);
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
  } = useFootballTeamGames(teamIdNum ?? 0, "2025", 2);

  // --- Refresh handler ---
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

  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const league = "CFB";
  const favorited = team ? isFavorite(league, team.id) : false;

  // --- Header ---
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
  }, [navigation, team, favorited]);

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
        <View key="schedule" style={{ flex: 1 }}>
          <CFBGamesList
            games={teamGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            error={gamesError}
            showHeaders={true}
          />
        </View>

        {/* News Page */}
        <ScrollView key="news" style={{ flex: 1 }}></ScrollView>

        {/* Roster Page */}
        <View key="roster" style={{ flex: 1 }}>
          <Roster
            ref={rosterRef}
            teamId={String(team.id)}
            teamName={team.name}
            league="CFB"
          />
        </View>

        {/* Stats Page */}
        <ScrollView key="stats" contentContainerStyle={{ paddingBottom: 100 }}>
          {team?.espnID && team?.id && (
            <FootballRosterStats
              espnID={Number(team.espnID)}
              teamID={Number(team.id)}
              league="CFB"
            />
          )}
        </ScrollView>

        {/* Forum Page */}
        <View key="standings" style={{ flex: 1 }}>
          <CFBConferenceStandingsList
            onlyTeamConference={true}
            teamName={team.fullName}
          />
        </View>
        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="CFB" />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="CFB"
        />
      )}
    </View>
  );
}
