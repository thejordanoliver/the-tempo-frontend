import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import CustomRefreshControl from "components/CustomRefreshControl";
import DateNavigator from "components/DateNavigator";
import CombinedGamesList, {
  CombinedGamesSection,
} from "components/League/CombinedGamesList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { Colors } from "constants/styles";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useMLBSeasonGames } from "hooks/MLBHooks/useMLBSeasonGames";
import { useSeasonGames } from "hooks/NBAHooks/useSeasonGames";
import { useFootballSeasonGames } from "hooks/NFLHooks/useFootballSeasonGames";
import * as React from "react";
import { ScrollView, View, useColorScheme } from "react-native";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import {
  getFootballSeasonYear,
  getMLBSeason,
  getNBASeason,
} from "utils/dateUtils";
import { filterByDate, isLiveGame, normalizeTeam } from "utils/games";
dayjs.extend(utc);
dayjs.extend(timezone);

export default function LeagueScreen() {
  const nbaCalendarYear = getNBASeason();
  const mlbCalendarYear = getMLBSeason();
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);

  // --------------------------------------------------
  // State
  // --------------------------------------------------
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showCalendarModal, setShowCalendarModal] = React.useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = React.useState(false);
  const sportsModalRef = React.useRef<SportsListModalRef>(null);

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
    games: mensCBBGames,
    loading: mensCBBLoading,
    refreshCBBGames: refreshMensCBB,
  } = useCBBSeasonGames();

  const {
    games: womensCBBGames,
    loading: womensCBBLoading,
    refreshCBBGames: refreshWomensCBB,
  } = useCBBSeasonGames({ isWomen: true });

  const {
    games: nflGames,
    loading: nflLoading,
    refetch: refreshNFLGames,
  } = useFootballSeasonGames(getFootballSeasonYear(), 1);

  const {
    games: cfbGames,
    loading: cfbLoading,
    refetch: refreshCFBGames,
  } = useFootballSeasonGames(getFootballSeasonYear(), 2);

  // --------------------------------------------------
  // Load Favorites
  // --------------------------------------------------
  useFocusEffect(
    React.useCallback(() => {
      const loadFavorites = async () => {
        const stored = await AsyncStorage.getItem("favorites");
        if (stored) setFavorites(JSON.parse(stored));
      };
      loadFavorites();
    }, []),
  );

  // --------------------------------------------------
  // Header
  // --------------------------------------------------
  React.useLayoutEffect(() => {
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
  const normalizeGames = (games: any[], leagueType: string, isWomen = false) =>
    games
      .map((game: any) => {
        let date: dayjs.Dayjs | null = null;

        if (leagueType === "CFB" || leagueType === "NFL") {
          const ts = game.game?.date?.timestamp;
          if (!ts) return null;
          date = dayjs.unix(ts).local();
        } else {
          const raw =
            game.date?.start ?? game.date?.date ?? game.date ?? game.game?.date;
          if (!raw) return null;
          date = dayjs.utc(raw).local();
        }

        let home, away;

        if (leagueType === "NBA") {
          home = { ...game.home, id: String(game.home?.id) };
          away = {
            ...game.away,
            id: String(game.away?.id),
          };
        } else if (leagueType === "NFL" || leagueType === "CFB") {
          home = { ...game.teams?.home, id: String(game.teams?.home?.id) };
          away = { ...game.teams?.away, id: String(game.teams?.away?.id) };
        } else if (leagueType === "MLB") {
          home = {
            id: game.teams?.home?.id,
            name: game.teams?.home?.name,
          };

          away = {
            id: game.teams?.away?.id,
            name: game.teams?.away?.name,
          };
        } else {
          home = normalizeTeam(game.teams?.home, isWomen);
          away = normalizeTeam(game.teams?.away, isWomen);
        }

        return {
          ...game,
          date: date.toDate(),
          dateString: date.format("YYYY-MM-DD"),
          time: date.format("h:mm A"),
          home,
          away,
        };
      })
      .filter(Boolean);

  const normalizedNBA = React.useMemo(
    () => normalizeGames(nbaGames, "NBA"),
    [nbaGames],
  );
  const normalizedMLB = React.useMemo(
    () => normalizeGames(mlbGames, "MLB"),
    [mlbGames],
  );
  const normalizedNFL = React.useMemo(
    () => normalizeGames(nflGames, "NFL"),
    [nflGames],
  );
  const normalizedCFB = React.useMemo(
    () => normalizeGames(cfbGames, "CFB"),
    [cfbGames],
  );
  const normalizedMensCBB = React.useMemo(
    () => normalizeGames(mensCBBGames, "CBB", false),
    [mensCBBGames],
  );
  const normalizedWomensCBB = React.useMemo(
    () => normalizeGames(womensCBBGames, "CBB", true),
    [womensCBBGames],
  );

  // --------------------------------------------------
  // Filter by date
  // --------------------------------------------------
  const filteredNBA = filterByDate(normalizedNBA, selectedDate);
  const filteredNFL = filterByDate(normalizedNFL, selectedDate);
  const filteredMLB = filterByDate(normalizedMLB, selectedDate);
  const filteredCFB = filterByDate(normalizedCFB, selectedDate);
  const filteredMensCBB = filterByDate(normalizedMensCBB, selectedDate);
  const filteredWomensCBB = filterByDate(normalizedWomensCBB, selectedDate);

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
  const favoriteGames = React.useMemo(() => {
    const collect = (games: any[], prefix: string) =>
      games.filter((g) => isFavoriteGame(g, prefix));

    return [
      ...collect(filteredNBA, "NBA"),
      ...collect(filteredNFL, "NFL"),
      ...collect(filteredMLB, "MLB"),
      ...collect(filteredCFB, "CFB"),
      ...collect(filteredMensCBB, "CBB"),
      ...collect(filteredWomensCBB, "WCBB"),
    ];
  }, [
    favorites,
    filteredNBA,
    filteredNFL,
    filteredMLB,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
  ]);

  // --------------------------------------------------
  // Sections
  // --------------------------------------------------
  const gamesByCategory = React.useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: sortLiveFirst(favoriteGames) },
      { category: "NBA", data: limitNonFavorites(filteredNBA, "NBA") },
      { category: "NFL", data: limitNonFavorites(filteredNFL, "NFL") },
      { category: "MLB", data: limitNonFavorites(filteredMLB, "MLB") },
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
    filteredNFL,
    filteredMLB,
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
        refreshNFLGames(),
        refreshMLBGames(),
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
  const markedDates = React.useMemo(() => {
    const all = [
      ...normalizedNBA,
      ...normalizedNFL,
      ...normalizedMLB,
      ...normalizedCFB,
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
    normalizedNFL,
    normalizedMLB,
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

          <CustomRefreshControl onRefresh={handleRefresh}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <CombinedGamesList
                gamesByCategory={gamesByCategory}
                loading={
                  nbaLoading ||
                  nflLoading ||
                  mlbLoading ||
                  cfbLoading ||
                  mensCBBLoading ||
                  womensCBBLoading
                }
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </ScrollView>
          </CustomRefreshControl>
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
