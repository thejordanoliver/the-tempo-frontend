import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import NHLGamesList from "components/Sports/NHL/Games/NHLGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/Styles";
import { getNHLTeam } from "constants/teamsNHL";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useNHLSeasonGames } from "hooks/NHLHooks/useNHLSeasonGames";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { NHLGame } from "types/nhl";
import { getNHLSeason } from "utils/dateUtils";
import { filterByDate } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
dayjs.extend(utc);
dayjs.extend(timezone);

export default function MLBLeagueScreen() {
  const { games, loading: liveLoading } = useNHLSeasonGames(2024);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const currentSeason = getNHLSeason();
  const [standingsYear, setStandingsYear] = useState(currentSeason);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("NHL");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const stored = await AsyncStorage.getItem("favorites");
          if (stored) setFavorites(JSON.parse(stored));
        } catch (error) {
          console.warn("Failed to load favorites:", error);
        }
      };
      loadFavorites();
    }, []),
  );

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="NHL"
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={() => {
            setLeagueModalVisible(true);
            sportsModalRef.current?.present();
          }}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, leagueModalVisible]);

  // --- Normalize regular season games ---
  const normalizedSeasonGames = games.map((game: NHLGame) => {
    const home = getNHLTeam(game.teams?.home.id ?? {});
    const away = getNHLTeam(game.teams?.away.id ?? {});

    let rawTimestamp: number | null = null;

    if (typeof game.date === "number") {
      rawTimestamp = game.date;
    } else if (typeof game.timestamp === "number") {
      rawTimestamp = game.timestamp;
    }

    const date = rawTimestamp ? dayjs(rawTimestamp * 1000) : dayjs(NaN);

    return {
      ...game,
      date: date.toDate(),
      dateString: date.isValid() ? date.format("YYYY-MM-DD") : "",
      time: date.isValid() ? date.format("h:mm A") : "",
      home,
      away,
    };
  });

  // --- Helper to sort live games on top ---
  const sortLiveGamesFirst = (gamesArray: any[]) =>
    [...gamesArray].sort((a, b) => {
      const aStatus = a.status?.long?.toLowerCase() || "";
      const bStatus = b.status?.long?.toLowerCase() || "";

      if (aStatus === "in play" && bStatus !== "in play") return -1;
      if (aStatus !== "in play" && bStatus === "in play") return 1;

      // Otherwise, sort by date/time
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // Filter both sets by selectedDate
  const filteredSeasonGames = sortLiveGamesFirst(
    filterByDate(normalizedSeasonGames, selectedDate),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Change Date (now local) ---
  const changeDateByDays = (days: number) => {
    setSelectedDate((prev) =>
      dayjs(prev).add(days, "day").startOf("day").toDate(),
    );
  };

  // Helper to mark games on calendar
  const markDates = (gamesArray: any[]) =>
    gamesArray.reduce(
      (acc, game) => {
        const localDate = new Date(game.date);
        const iso = `${localDate.getFullYear()}-${String(
          localDate.getMonth() + 1,
        ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
        acc[iso] = {
          marked: true,
          dotColor: isDark ? Colors.white : Colors.black,
        };
        return acc;
      },
      {} as Record<string, { marked: boolean; dotColor: string }>,
    );

  return (
    <>
      <View style={styles.container}>
        <MainScrollTabBar
          tabs={tabs}
          selected={selectedTab}
          onTabPress={setSelectedTab}
        />

        <View style={styles.contentArea}>
          {selectedTab === "scores" && (
            <>
              <DateNavigator
                selectedDate={selectedDate}
                onChangeDate={changeDateByDays}
                onOpenCalendar={() => setShowCalendarModal(true)}
                isDark={isDark}
              />

              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
              >
                {filteredSeasonGames.length > 0 ? (
                  <NHLGamesList
                    games={filteredSeasonGames} // <-- filtered by selectedDate
                    loading={liveLoading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    scrollEnabled={false}
                  />
                ) : null}
              </ScrollView>
            </>
          )}

          {selectedTab === "news" && (
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            ></ScrollView>
          )}

          {selectedTab === "standings" && (
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league="NHL"
            />
          )}
          {selectedTab === "stats" && ""}
          {selectedTab === "awards" && <AwardSeasons league="NHL" />}
          {selectedTab === "forum" && <LeagueForum league="NHL" />}
        </View>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const localSelected = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();
          setSelectedDate(localSelected);
          setShowCalendarModal(false);
        }}
        markedDates={{
          ...markDates([...normalizedSeasonGames]),
        }}
      />

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
