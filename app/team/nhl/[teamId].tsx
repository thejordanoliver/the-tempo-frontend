import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import MonthSelector from "components/MonthSelector";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import NHLGamesList from "components/Sports/NHL/Games/NHLGamesList";
import Roster from "components/Sports/NHL/Team/Roster";
import { players } from "constants/nhlPlayers";
import { Colors } from "constants/styles";
import { nhlTeams } from "constants/teamsNHL";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useNHLTeamGames } from "hooks/NHLHooks/useNHLTeamGames";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, useColorScheme } from "react-native";
import PagerView from "react-native-pager-view";
import {
  getGameCountByMonth,
  getMonthsToShow,
  getNHLSeason,
  scrollToMonth,
} from "utils/dateUtils";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import TabBar from "../../../components/TabBar";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

type PageSelectedEvent = {
  nativeEvent: {
    position: number;
  };
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const [standingsYear, setStandingsYear] = useState(getNHLSeason());
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const isDark = useColorScheme() === "dark";
  const styles = teamDetailStyles;

  const tabs = ["schedule", "news", "roster", "stats", "forum"] as const;
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("schedule");

  const rosterRef = useRef<{ refresh: () => void }>(null);
  const pagerRef = useRef<PagerView>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const team = useMemo(
    () => (teamIdNum ? nhlTeams.find((t) => Number(t.id) === teamIdNum) : null),
    [teamIdNum],
  );

  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    refreshGames: refreshTeamGames,
  } = useNHLTeamGames(teamIdNum ? teamIdNum.toString() : "");

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

  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const league = "NHL";
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
  }, [navigation, isDark, team, favorited]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator isDark={isDark} />
      </View>
    );
  }

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <View style={styles.container}>
      <TabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);
          pagerRef.current?.setPage(tabToIndex(tab));
        }}
        isDark
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

          <NHLGamesList
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
            players={players.filter((p) => p.teamId === String(team.espnID))}
            loading={false}
            error={null}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team?.fullName ?? "Unknown Team"}
            teamColor={team?.color ?? Colors.midTone}
            isDark={isDark}
          />
        </View>

        {/* Stats */}
        <ScrollView key="stats" style={{ flex: 1 }}></ScrollView>

        {/* Standings */}
        <View key="standings" style={{ flex: 1 }}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="NHL"
          />
        </View>

        {/* Forum */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="NHL" />
        </View>
      </PagerView>

      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="NHL"
        />
      )}
    </View>
  );
}
