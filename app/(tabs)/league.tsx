import { useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import DateNavigator from "components/DateNavigator";
import CombinedGamesList, {
  CombinedGamesSection,
} from "components/League/CombinedGamesList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { Colors } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useFootballSeasonGames } from "hooks/FootballHooks/useFootballSeasonGames";
import { useMLBSeasonGames } from "hooks/MLBHooks/useMLBSeasonGames";
import { useSeasonGames } from "hooks/NBAHooks/useSeasonGames";
import { useNHLSeasonGames } from "hooks/NHLHooks/useNHLSeasonGames";
import { useWNBASeasonGames } from "hooks/WNBAHooks/useWNBASeasonGames";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import {
  getFootballSeason,
  getMLBSeason,
  getNBASeason,
  getNHLSeason,
} from "utils/dateUtils";
import { filterByDate, isLiveGame, normalizeGames } from "utils/games";
dayjs.extend(utc);
dayjs.extend(timezone);

export default function LeagueScreen() {
  const { favorites } = useFavoriteTeamsContext();
  const nbaCalendarYear = getNBASeason();
  const mlbCalendarYear = getMLBSeason();
  const nhlCalendarYear = getNHLSeason();
  const navigation = useNavigation();
  const { resolvedColorScheme, viewMode } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);

  // --------------------------------------------------
  // State
  // --------------------------------------------------
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );

  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const sportsModalRef = useRef<SportsListModalRef>(null);

  // --------------------------------------------------
  // Game Data Hooks
  // --------------------------------------------------
  const {
    games: nbaGames,
    loading: nbaLoading,
    refreshGames: refreshNBAGames,
  } = useSeasonGames(nbaCalendarYear);

  const {
    games: mlbGames,
    loading: mlbLoading,
    refreshGames: refreshMLBGames,
  } = useMLBSeasonGames(mlbCalendarYear);

  const {
    games: mensBasketballGames,
    loading: mensCBBLoading,
    refreshBasketballGames: refreshMensCBB,
  } = useCBBSeasonGames();

  const {
    games: womensBasketballGames,
    loading: womensCBBLoading,
    refreshBasketballGames: refreshWomensCBB,
  } = useCBBSeasonGames({ isWomen: true });

  const {
    wnbaGames,
    wnbaLoading,
    refreshGames: refreshWNBAGames,
  } = useWNBASeasonGames();

  const {
    games: nflGames,
    loading: nflLoading,
    refetch: refreshNFLGames,
  } = useFootballSeasonGames(getFootballSeason(), 1);

  const {
    games: nhlGames,
    loading: nhlLoading,
    refreshGames: refreshNHLGames,
  } = useNHLSeasonGames(nhlCalendarYear);

  const {
    games: cfbGames,
    loading: cfbLoading,
    refetch: refreshCFBGames,
  } = useFootballSeasonGames(getFootballSeason(), 2);

  // --------------------------------------------------
  // Header
  // --------------------------------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={() => {
            setLeagueModalVisible(true);
            sportsModalRef.current?.present();
          }}
        />
      ),
    });
  }, [navigation, leagueModalVisible]);

  // --------------------------------------------------
  // Normalize games
  // --------------------------------------------------

  const normalizedNBA = useMemo(
    () => normalizeGames(nbaGames, "NBA"),
    [nbaGames],
  );
  const normalizedWNBA = useMemo(
    () => normalizeGames(wnbaGames, "WNBA"),
    [nbaGames],
  );
  const normalizedMLB = useMemo(
    () => normalizeGames(mlbGames, "MLB"),
    [mlbGames],
  );
  const normalizedNFL = useMemo(
    () => normalizeGames(nflGames, "NFL"),
    [nflGames],
  );
  const normalizedCFB = useMemo(
    () => normalizeGames(cfbGames, "CFB"),
    [cfbGames],
  );
  const normalizedMensCBB = useMemo(
    () => normalizeGames(mensBasketballGames, "CBB", false),
    [mensBasketballGames],
  );
  const normalizedWomensCBB = useMemo(
    () => normalizeGames(womensBasketballGames, "WCBB", true),
    [womensBasketballGames],
  );
  const normalizedNHL = useMemo(
    () => normalizeGames(nhlGames, "NHL", true),
    [nhlGames],
  );

  // --------------------------------------------------
  // Filter by date
  // --------------------------------------------------
  const filteredNBA = filterByDate(normalizedNBA, selectedDate);
  const filteredNFL = filterByDate(normalizedNFL, selectedDate);
  const filteredMLB = filterByDate(normalizedMLB, selectedDate);
  const filteredNHL = filterByDate(normalizedNHL, selectedDate);
  const filteredCFB = filterByDate(normalizedCFB, selectedDate);
  const filteredMensCBB = filterByDate(normalizedMensCBB, selectedDate);
  const filteredWomensCBB = filterByDate(normalizedWomensCBB, selectedDate);
  const filteredWNBA = filterByDate(normalizedWNBA, selectedDate);

  // --------------------------------------------------
  // Favorites helpers
  // --------------------------------------------------
  const isFavoriteGame = (g: any, prefix: string) =>
    favorites.includes(`${prefix}:${String(g.home.id)}`) ||
    favorites.includes(`${prefix}:${String(g.away.id)}`);

  const sortLiveFirst = (games: any[]) =>
    [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));

  const limitNonFavorites = (games: any[], prefix: string, max = 8) =>
    sortLiveFirst(games.filter((g) => !isFavoriteGame(g, prefix))).slice(
      0,
      max,
    );

  // --------------------------------------------------
  // Favorites
  // --------------------------------------------------
  const favoriteGames = useMemo(() => {
    const collect = (games: any[], prefix: string) =>
      games.filter((g) => isFavoriteGame(g, prefix));

    return [
      ...collect(filteredNBA, "NBA"),
      ...collect(filteredNFL, "NFL"),
      ...collect(filteredMLB, "MLB"),
      ...collect(filteredNHL, "NHL"),
      ...collect(filteredCFB, "CFB"),
      ...collect(filteredMensCBB, "CBB"),
      ...collect(filteredWomensCBB, "WCBB"),
      ...collect(filteredWNBA, "WNBA"),
    ];
  }, [
    favorites,
    filteredNBA,
    filteredNFL,
    filteredNHL,
    filteredMLB,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
  ]);

  // --------------------------------------------------
  // Sections
  // --------------------------------------------------
  const gamesByCategory = useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: sortLiveFirst(favoriteGames) },
      { category: "NBA", data: limitNonFavorites(filteredNBA, "NBA") },
      { category: "WNBA", data: limitNonFavorites(filteredWNBA, "WNBA") },
      { category: "NFL", data: limitNonFavorites(filteredNFL, "NFL") },
      { category: "MLB", data: limitNonFavorites(filteredMLB, "MLB") },
      { category: "NHL", data: limitNonFavorites(filteredNHL, "NHL") },
      {
        category: "College Football",
        data: limitNonFavorites(filteredCFB, "CFB"),
      },
      {
        category: "Men's College Basketball",
        data: limitNonFavorites(filteredMensCBB, "CBB"), // <--- OK
      },
      {
        category: "Women's College Basketball",
        data: limitNonFavorites(filteredWomensCBB, "WCBB"), // <--- OK
      },
    ];

    return sections.filter((s) => s.data.length > 0);
  }, [
    favoriteGames,
    filteredNBA,
    filteredWNBA,
    filteredNFL,
    filteredMLB,
    filteredNHL,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
  ]);

  // --------------------------------------------------
  // Refresh
  // --------------------------------------------------
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshNBAGames(),
        refreshWNBAGames(),
        refreshNFLGames(),
        refreshMLBGames(),
        refreshNHLGames(),
        refreshCFBGames(),
        refreshMensCBB(),
        refreshWomensCBB(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // Marked dates
  // --------------------------------------------------
  const markedDates = useMemo(() => {
    const all = [
      ...normalizedNBA,
      ...normalizedWNBA,
      ...normalizedNFL,
      ...normalizedMLB,
      ...normalizedCFB,
      ...normalizedNHL,
      ...normalizedMensCBB,
      ...normalizedWomensCBB,
    ];

    const dotColor = isDark ? Colors.white : Colors.black;

    return Object.fromEntries(
      all.map((g) => [
        dayjs(g.date).format("YYYY-MM-DD"),
        { marked: true, dotColor },
      ]),
    );
  }, [
    normalizedNBA,
    normalizedWNBA,
    normalizedNFL,
    normalizedMLB,
    normalizedNHL,
    normalizedCFB,
    normalizedMensCBB,
    normalizedWomensCBB,
    isDark,
  ]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <>
      <View style={styles.container}>
        <View style={styles.contentArea}>
          <DateNavigator
            selectedDate={selectedDate}
            onChangeDate={(d) =>
              setSelectedDate(
                dayjs(selectedDate).add(d, "day").startOf("day").toDate(),
              )
            }
            onOpenCalendar={() => setShowCalendarModal(true)}
            isDark={isDark}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? Colors.white : Colors.black}
                colors={[isDark ? Colors.white : Colors.black]} // Android
              />
            }
          >
            <CombinedGamesList
              gamesByCategory={gamesByCategory}
              loading={
                nbaLoading ||
                wnbaLoading ||
                nflLoading ||
                mlbLoading ||
                nhlLoading ||
                cfbLoading ||
                mensCBBLoading ||
                womensCBBLoading
              }
              refreshing={refreshing}
              onRefresh={handleRefresh}
              isDark={isDark}
              viewMode={viewMode}
            />
          </ScrollView>
        </View>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(d) => {
          setSelectedDate(dayjs(d).startOf("day").toDate());
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
