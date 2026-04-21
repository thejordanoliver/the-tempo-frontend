import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/MonthSelector";
import CBBGamesList from "components/Sports/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/Sports/CBB/Standings/CBBConferenceStandingsList";
import CBBRosterStats from "components/Sports/CBB/Team/CBBRosterStats";
import Roster from "components/Sports/CBB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useRosterStats } from "hooks/CBBHooks/useCBBRosterStats";
import { useCBBTeamGames } from "hooks/CBBHooks/useCBBTeamGames";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { useTeamTabs } from "hooks/useLeagueTabs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { BasketballGame } from "types/basketball";
import {
  getGameCountByMonth,
  getMonthsToShow,
  scrollToMonth,
} from "utils/dateUtils";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

type PageSelectedEvent = {
  nativeEvent: { position: number };
};

export default function TeamDetailScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = Number(teamId);
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const league = "WCBB";
  const team = getCBBTeam(Number(teamIdNum), true);
  const espnId = team?.espnID;
  const favorited = team ? isFavorite(league, teamIdNum) : false;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cachedGames, setCachedGames] = useState<BasketballGame[]>([]);
  const {
    rosterStats,
    loading: statsLoading,
    error: statsError,
    refreshingStats,
    onRefresh: refreshRosterStats,
  } = useRosterStats("WCBB", espnId ?? 0);
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const { players } = usePlayersByTeam(team?.espnID?.toString() ?? "", true);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs("WCBB");
  const pagerRef = useRef<PagerView>(null);
  const rosterRef = useRef<{ refresh: () => void }>(null);

  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const CACHE_KEY = `teamGames-${teamIdNum}`;
  const CACHE_EXPIRY_HOURS = 6;

  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    error: gamesError,
    refreshGames,
  } = useCBBTeamGames(team?.wid ?? "", "423");

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
    // Only initialize once, when data arrives
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
      if (selectedTab === "schedule") {
        await refreshGames?.();
      } else if (selectedTab === "roster") {
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

  /** ---------------- CACHE ---------------- */

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

  /** ---------------- HEADER ---------------- */

  const logo = getCBBTeamLogo(teamIdNum ?? 0, true, true);
  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={team?.id}
          logo={logo}
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
        onPageSelected={(e: PageSelectedEvent) => {
          const index = e.nativeEvent.position;
          setSelectedTab(indexToTab(index));
        }}
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
        <ScrollView key="news" style={styles.contentArea}></ScrollView>

        {/* Roster Page */}
        <View key="roster" style={styles.contentArea}>
          <Roster
            players={players}
            loading={false}
            error={null}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team?.fullName ?? "Unknown Team"}
            teamId={team.wid}
            isWomen={true}
          />
        </View>

        {/* Stats Page */}
        <View key="stats" style={styles.contentArea}>
          {team?.espnID && team?.id && (
            <CBBRosterStats
              rosterStats={rosterStats}
              espnId={team.espnID}
              teamId={Number(team.id)}
              league="WCBB"
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
            women={true}
          />
        </View>

        {/* Forum Page */}
        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamId as string} league="WCBB" />
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
