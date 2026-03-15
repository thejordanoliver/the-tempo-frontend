import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import MonthSelector from "components/MonthSelector";
import MLBGamesList from "components/Sports/MLB/Games/MLBGamesList";
import Roster from "components/Sports/MLB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { teams } from "constants/teamsMLB";
import { useNotifications } from "contexts/NotificationContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useMLBTeamGames } from "hooks/MLBHooks/useMLBTeamGames";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, View, useColorScheme } from "react-native";
import PagerView from "react-native-pager-view";
import {
  getGameCountByMonth,
  getMLBSeason,
  getMonthsToShow,
  scrollToMonth,
} from "utils/dateUtils";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

type PageSelectedEvent = {
  nativeEvent: {
    position: number;
  };
};

type MonthItem = {
  label: string;
  month: number;
  year: number;
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(getMLBSeason().toString());
  const isDark = useColorScheme() === "dark";
  const styles = teamDetailStyles;

  const tabs = [
    "schedule",
    "news",
    "roster",
    "stats",
    "standings",
    "forum",
  ] as const;
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("schedule");

  const rosterRef = useRef<{ refresh: () => void }>(null);
  const pagerRef = useRef<PagerView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const tabMeasurements = useRef<{ x: number; width: number }[]>([]);

  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const team = useMemo(
    () => (teamIdNum ? teams.find((t) => Number(t.id) === teamIdNum) : null),
    [teamIdNum],
  );

  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    refreshGames: refreshTeamGames,
  } = useMLBTeamGames(teamIdNum ? teamIdNum.toString() : "");

  const gameCountByMonth = useMemo(
    () => getGameCountByMonth(rawTeamGames, (g) => g.date ?? null),
    [rawTeamGames],
  );

  const monthsToShow = useMemo(
    () => getMonthsToShow(rawTeamGames, (g) => g.date ?? null),
    [rawTeamGames],
  );

  // -------------------------------
  // SELECTED MONTH
  // -------------------------------
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Auto-select first month
  useEffect(() => {
    if (!selectedDate && monthsToShow.length > 0) {
      const m = monthsToShow[0];
      setSelectedDate(new Date(m.year, m.month, 1));
    }
  }, [monthsToShow]);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };
  // -------------------------------
  // FILTER GAMES FOR MONTH
  // -------------------------------
  const filteredGames = useMemo(() => {
    if (!selectedDate) return rawTeamGames;

    return rawTeamGames.filter((game) => {
      const dateStr = game?.date;
      if (!dateStr) return false;

      const d = new Date(dateStr);

      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth()
      );
    });
  }, [rawTeamGames, selectedDate]);

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
  const { toggleNotifications, isNotified } = useNotifications();
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const league = "MLB";
  const favorited = team ? isFavorite(league, team.id) : false;
  const teamKey = String(team?.id);
  const notfied = team ? isNotified(league, teamKey) : false;

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
          isNotified={notfied} // ✅ MATCH
          onToggleNotifications={() => toggleNotifications(league, teamKey)}
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, isDark, team, favorited]);

  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));

    const index = tabs.indexOf(tab);
    if (tabMeasurements.current[index]) {
      Animated.parallel([
        Animated.timing(underlineX, {
          toValue: tabMeasurements.current[index].x,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(underlineWidth, {
          toValue: tabMeasurements.current[index].width,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <View style={styles.container}>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={handleTabPress}
      />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e: PageSelectedEvent) =>
          setSelectedTab(indexToTab(e.nativeEvent.position))
        }
      >
        {/* Schedule */}
        <View key="schedule" style={{ flex: 1 }}>
          <MonthSelector
            months={monthsToShow}
            selectedDate={selectedDate}
            onSelect={(month, year, index) =>
              handleSelectMonth(month, year, index)
            }
            loading={gamesLoading}
            gameCountByMonth={gameCountByMonth}
          />

          <MLBGamesList
            games={filteredGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={refreshTeamGames}
          />
        </View>

        {/* News */}
        <ScrollView key="news" style={{ flex: 1 }}></ScrollView>

        {/* Roster Page */}
        <View key="roster" style={{ flex: 1 }}>
          <Roster
            teamId={Number(team.id)}
            teamFullName={team.fullName}
            teamColor={team.color}
            isDark={isDark}
          />
        </View>

        {/* Stats */}
        <ScrollView key="stats" style={{ flex: 1 }} />

        {/* Standings Page */}
        <View key="standings" style={{ flex: 1 }}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="MLB"
          />
        </View>

        {/* Forum */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="MLB" />
        </View>
      </PagerView>

      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="MLB"
        />
      )}
    </View>
  );
}
