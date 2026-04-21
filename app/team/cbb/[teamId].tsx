import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/MonthSelector";
import NewsList from "components/News/NewsList";
import CBBGamesList from "components/Sports/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/Sports/CBB/Standings/CBBConferenceStandingsList";
import CBBRosterStats from "components/Sports/CBB/Team/CBBRosterStats";
import Roster from "components/Sports/CBB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getCBBTeam } from "constants/teamsCBB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useRosterStats } from "hooks/CBBHooks/useCBBRosterStats";
import { useCBBTeamGames } from "hooks/CBBHooks/useCBBTeamGames";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useTeamTabs } from "hooks/useLeagueTabs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { BasketballGame } from "types/basketball";
import {
  getGameCountByMonth,
  getMonthsToShow,
  scrollToMonth,
} from "utils/dateUtils";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "CBB";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? Number(teamId) : null;
  const team = getCBBTeam(Number(teamIdNum), false);
  const espnId = team?.espnID;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cachedGames, setCachedGames] = useState<BasketballGame[]>([]);
  const {
    rosterStats,
    loading: statsLoading,
    error: statsError,
    refreshingStats,
    onRefresh: refreshRosterStats,
  } = useRosterStats(league, espnId ?? 0);
  const { players } = usePlayersByTeam(team?.espnID?.toString() ?? "");
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);
  const rosterRef = useRef<{ refresh: () => void }>(null);
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];
  const handlePageChange = (index: number) => {
    setSelectedTab(indexToTab(index));
  };
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();

  const favorited = team ? isFavorite(league, team.id) : false;
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);
  const CACHE_KEY = `teamGames-${teamIdNum}`;
  const CACHE_EXPIRY_HOURS = 6;
  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    error: gamesError,
  } = useCBBTeamGames(teamIdNum ?? "", league);

  const teamGames = useMemo(
    () =>
      (cachedGames.length ? cachedGames : rawTeamGames).filter(
        (g) => !!g?.date,
      ),
    [cachedGames, rawTeamGames],
  );

  /** ---------------- MONTHS ---------------- */
  const gameCountByMonth = useMemo(
    () => getGameCountByMonth(teamGames, (g) => g.date),
    [teamGames],
  );

  const monthsToShow = useMemo(
    () => getMonthsToShow(teamGames, (g) => g.date),
    [teamGames],
  );

  const initialSelectedDate = useMemo(() => {
    if (monthsToShow.length === 0) return null;

    const today = new Date();
    const currentMonth = monthsToShow.find(
      (m) => m.month === today.getMonth() && m.year === today.getFullYear(),
    );

    const start = currentMonth ?? monthsToShow[0];
    return new Date(start.year, start.month, 1);
  }, [monthsToShow]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDate,
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };

  useEffect(() => {
    if (selectedDate || monthsToShow.length === 0) return;

    const today = new Date();

    const currentMonth = monthsToShow.find(
      (m) => m.month === today.getMonth() && m.year === today.getFullYear(),
    );

    const start = currentMonth ?? monthsToShow[0];

    setSelectedDate(new Date(start.year, start.month, 1));
  }, [monthsToShow, selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "roster") {
        rosterRef.current?.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const filteredGames = useMemo(() => {
    if (!selectedDate) return teamGames;
    return teamGames.filter((g) => {
      const d = new Date(g.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [teamGames, selectedDate]);

  useEffect(() => {
    if (!teamIdNum) return;
    AsyncStorage.getItem(CACHE_KEY).then((cached) => {
      if (!cached) return;
      const { timestamp, data } = JSON.parse(cached);
      if ((Date.now() - timestamp) / 36e5 < CACHE_EXPIRY_HOURS) {
        setCachedGames(data);
      }
    });
  }, [teamIdNum]);

  useEffect(() => {
    if (!teamIdNum || !rawTeamGames.length) return;
    AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: rawTeamGames }),
    );
  }, [rawTeamGames, teamIdNum]);

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
        initialPage={tabToIndex(selectedTab)}
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
      >
        {/* Schedule Page */}
        <View key="schedule" style={styles.contentArea}>
          <View style={styles.monthSelector}>
            <MonthSelector
              months={monthsToShow}
              selectedDate={selectedDate}
              onSelect={(month, year, index) =>
                handleSelectMonth(month, year, index)
              }
              loading={gamesLoading}
              gameCountByMonth={gameCountByMonth}
            />
          </View>
          <CBBGamesList
            games={filteredGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            error={gamesError}
            showHeaders={false}
          />
        </View>

        {/* News Page */}
        <View key="news" style={styles.contentArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <NewsList
              items={articles}
              isDark={isDark}
              loading={newsLoading}
              error={newsError}
              refreshing
              onRefresh={handleRefresh}
            />
          </ScrollView>
        </View>

        {/* Roster Page */}
        <View key="roster" style={styles.contentArea}>
          <Roster
            players={players}
            loading={false}
            error={null}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team?.fullName ?? "Unknown Team"}
            teamId={team.id}
          />
        </View>

        {/* Stats Page */}
        <View key="stats" style={styles.contentArea}>
          {team?.espnID && team?.id && (
            <CBBRosterStats
              rosterStats={rosterStats}
              espnId={team.espnID}
              teamId={Number(team.id)}
              league={league}
              loading={statsLoading}
              error={statsError}
              refreshing={refreshingStats}
              onRefresh={refreshRosterStats}
            />
          )}
        </View>

        {/* Standings Page */}
        <View key="standings" style={styles.contentArea}>
          <CBBConferenceStandingsList
            onlyTeamConference={true}
            teamName={team.fullName}
          />
        </View>

        {/* Forum Page */}
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
