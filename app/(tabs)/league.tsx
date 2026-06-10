import { useBaseballGames } from "@/hooks/BaseballHooks/useBaseballGames";
import { useBasketballGames } from "@/hooks/BasketballHooks/useBasketballGames";
import { useBasketballSeasonGames } from "@/hooks/BasketballHooks/useBasketballSeasonGames";
import { useFootballGames } from "@/hooks/FootballHooks/useFootballGames";
import { filterByDate, getFootballSeason } from "@/utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import CalendarModal from "../../components/CalendarModal";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import DateNavigator from "../../components/DateNavigator";
import CombinedGamesList, {
  CombinedGamesSection,
} from "../../components/League/CombinedGamesList";
import SportsListModal, {
  SportsListModalRef,
} from "../../components/League/SportsListModal";
import { Colors } from "../../constants/styles";
import { useFavoriteTeamsContext } from "../../contexts/FavoriteTeamsContext";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useHockeyGames } from "../../hooks/HockeyHooks/useHockeyGames";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { isLiveGame, normalizeGames } from "../../utils/games";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function LeagueScreen() {
  const { favorites } = useFavoriteTeamsContext();
  const navigation = useNavigation();
  const currentFootballSeason = getFootballSeason();
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
  } = useBasketballGames(selectedDate, "nba");

  const {
    games: mlbGames,
    loading: mlbLoading,
    refreshGames: refreshMLBGames,
  } = useBaseballGames(selectedDate, "mlb");

  const {
    games: cbGames,
    loading: cbLoading,
    refreshGames: refreshCBGames,
  } = useBaseballGames(selectedDate, "cb");

  const {
    games: sbGames,
    loading: sbLoading,
    refreshGames: refreshSBGames,
  } = useBaseballGames(selectedDate, "sb");

  const {
    games: slvGames,
    loading: slvLoading,
    refreshGames: refreshSLVGames,
  } = useBasketballGames(selectedDate, "summervegas");
  const {
    games: sluGames,
    loading: sluLoading,
    refreshGames: refreshSLUGames,
  } = useBasketballGames(selectedDate, "summerutah");

  const {
    games: cfbGames,
    loading: cfbLoading,
    refreshGames: refreshCFBGames,
  } = useFootballGames({
    date: selectedDate,
    season: currentFootballSeason,
    league: "cfb",
  });

  const {
    games: nflGames,
    loading: nflLoading,
    refreshGames: refreshNFLGames,
  } = useFootballGames({
    date: selectedDate,
    season: currentFootballSeason,
    league: "nfl",
  });

  const {
    games: uflGames,
    loading: uflLoading,
    refreshGames: refreshUFLGames,
  } = useFootballGames({
    date: selectedDate,
    season: currentFootballSeason,
    league: "ufl",
  });

  const {
    games: mensBasketballGames,
    loading: mensCBBLoading,
    refreshGames: refreshMensCBB,
  } = useBasketballGames(selectedDate, "cbb");

  const {
    games: womensBasketballGames,
    loading: womensCBBLoading,
    refreshGames: refreshWomensCBB,
  } = useBasketballGames(selectedDate, "wcbb");

  const {
    games: wnbaGames,
    loading: wnbaLoading,
    refreshBasketballGames: refreshWNBAGames,
  } = useBasketballSeasonGames({ isWNBA: true });

  const {
    games: nhlGames,
    loading: nhlLoading,
    refreshGames: refreshNHLGames,
  } = useHockeyGames(selectedDate, "nhl");

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
    [wnbaGames],
  );
  const normalizedMLB = useMemo(
    () => normalizeGames(mlbGames, "MLB"),
    [mlbGames],
  );
  const normalizedCB = useMemo(() => normalizeGames(cbGames, "CB"), [cbGames]);
  const normalizedSB = useMemo(() => normalizeGames(sbGames, "SB"), [sbGames]);
  const normalizedSLV = useMemo(
    () => normalizeGames(slvGames, "NBA"),
    [slvGames],
  );
  const normalizedSLU = useMemo(
    () => normalizeGames(sluGames, "NBA"),
    [sluGames],
  );

  const normalizedNFL = useMemo(() => {
    return Array.isArray(nflGames) ? nflGames : [];
  }, [nflGames]);

  const normalizedCFB = useMemo(() => {
    return Array.isArray(cfbGames) ? cfbGames : [];
  }, [cfbGames]);

  const normalizedUFL = useMemo(() => {
    return Array.isArray(uflGames) ? uflGames : [];
  }, [uflGames]);

  const normalizedMensCBB = useMemo(
    () => normalizeGames(mensBasketballGames, "CBB"),
    [mensBasketballGames],
  );
  const normalizedWomensCBB = useMemo(
    () => normalizeGames(womensBasketballGames, "WCBB"),
    [womensBasketballGames],
  );
  const normalizedNHL = useMemo(
    () => normalizeGames(nhlGames, "NHL"),
    [nhlGames],
  );

  // --------------------------------------------------
  // Filter by date
  // --------------------------------------------------
  const filteredNBA = filterByDate(normalizedNBA, selectedDate);
  const filteredNFL = filterByDate(normalizedNFL, selectedDate);
  const filteredMLB = filterByDate(normalizedMLB, selectedDate);
  const filteredCB = filterByDate(normalizedCB, selectedDate);
  const filteredSB = filterByDate(normalizedSB, selectedDate);
  const filteredSLV = filterByDate(normalizedSLV, selectedDate);
  const filteredSLU = filterByDate(normalizedSLU, selectedDate);
  const filteredNHL = filterByDate(normalizedNHL, selectedDate);
  const filteredCFB = filterByDate(normalizedCFB, selectedDate);
  const filteredUFL = filterByDate(normalizedUFL, selectedDate);
  const filteredMensCBB = filterByDate(normalizedMensCBB, selectedDate);
  const filteredWomensCBB = filterByDate(normalizedWomensCBB, selectedDate);
  const filteredWNBA = filterByDate(normalizedWNBA, selectedDate);

  // --------------------------------------------------
  // Favorites helpers
  // --------------------------------------------------
  const isFavoriteGame = useCallback(
    (g: any, prefix: string) =>
      favorites.includes(`${prefix}:${String(g?.home?.id)}`) ||
      favorites.includes(`${prefix}:${String(g?.away?.id)}`),
    [favorites],
  );

  const sortLiveFirst = useCallback(
    (games: any[]) =>
      [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a))),
    [],
  );

  const limitNonFavorites = useCallback(
    (games: any[], prefix: string, max = 8) =>
      sortLiveFirst(games.filter((g) => !isFavoriteGame(g, prefix))).slice(
        0,
        max,
      ),
    [isFavoriteGame, sortLiveFirst],
  );
  // --------------------------------------------------
  // Favorites
  // --------------------------------------------------
  const favoriteGames = useMemo(() => {
    const collect = (games: any[], prefix: string) =>
      games.filter((g) => isFavoriteGame(g, prefix));

    return [
      ...collect(filteredNBA, "NBA"),
      ...collect(filteredSLV, "NBA"),
      ...collect(filteredSLU, "NBA"),
      ...collect(filteredNFL, "NFL"),
      ...collect(filteredUFL, "UFL"),
      ...collect(filteredCFB, "CFB"),
      ...collect(filteredMLB, "MLB"),
      ...collect(filteredCB, "CB"),
      ...collect(filteredSB, "SB"),
      ...collect(filteredNHL, "NHL"),
      ...collect(filteredMensCBB, "CBB"),
      ...collect(filteredWomensCBB, "WCBB"),
      ...collect(filteredWNBA, "WNBA"),
    ];
  }, [
    filteredNBA,
    filteredWNBA,
    filteredSLV,
    filteredSLU,
    filteredNFL,
    filteredUFL,
    filteredCFB,
    filteredNHL,
    filteredMLB,
    filteredCB,
    filteredSB,
    filteredMensCBB,
    filteredWomensCBB,
    isFavoriteGame,
  ]);

  // --------------------------------------------------
  // Sections
  // --------------------------------------------------
  const gamesByCategory = useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: sortLiveFirst(favoriteGames) },
      { category: "NBA", data: limitNonFavorites(filteredNBA, "NBA") },
      {
        category: "NBA Summer League",
        data: limitNonFavorites(filteredSLV, "NBA"),
      },
      {
        category: "NBA Summer League",
        data: limitNonFavorites(filteredSLU, "NBA"),
      },
      {
        category: "College Football",
        data: limitNonFavorites(filteredCFB, "CFB"),
      },
      {
        category: "Men's College Basketball",
        data: limitNonFavorites(filteredMensCBB, "CBB"),
      },
      {
        category: "Women's College Basketball",
        data: limitNonFavorites(filteredWomensCBB, "WCBB"),
      },
      { category: "WNBA", data: limitNonFavorites(filteredWNBA, "WNBA") },
      { category: "NFL", data: limitNonFavorites(filteredNFL, "NFL") },
      { category: "UFL", data: limitNonFavorites(filteredUFL, "UFL") },
      { category: "MLB", data: limitNonFavorites(filteredMLB, "MLB") },
      {
        category: "College Baseball",
        data: limitNonFavorites(filteredCB, "CB"),
      },
      {
        category: "College Softball",
        data: limitNonFavorites(filteredSB, "SB"),
      },
      { category: "NHL", data: limitNonFavorites(filteredNHL, "NHL") },
    ];

    return sections.filter((s) => s.data.length > 0);
  }, [
    favoriteGames,
    filteredNBA,
    filteredSLV,
    filteredSLU,
    filteredWNBA,
    filteredNFL,
    filteredUFL,
    filteredCFB,
    filteredMLB,
    filteredNHL,
    filteredCB,
    filteredSB,
    filteredMensCBB,
    filteredWomensCBB,
    limitNonFavorites,
    sortLiveFirst,
  ]);

  // --------------------------------------------------
  // Refresh
  // --------------------------------------------------
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshNBAGames(),
        refreshSLVGames(),
        refreshSLUGames(),
        refreshWNBAGames(),
        refreshNFLGames(),
        refreshUFLGames(),
        refreshMLBGames(),
        refreshCBGames(),
        refreshSBGames(),
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
      ...normalizedSLV,
      ...normalizedSLU,
      ...normalizedWNBA,
      ...normalizedNFL,
      ...normalizedMLB,
      ...normalizedCB,
      ...normalizedSB,
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
    normalizedSLV,
    normalizedSLU,
    normalizedWNBA,
    normalizedNFL,
    normalizedMLB,
    normalizedCB,
    normalizedSB,
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
                slvLoading ||
                sluLoading ||
                wnbaLoading ||
                nflLoading ||
                uflLoading ||
                mlbLoading ||
                cbLoading ||
                sbLoading ||
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
