import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import CombinedGamesList, {
  CombinedGamesSection,
} from "components/CombinedGamesList";
import DateNavigator from "components/DateNavigator";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCFBSeasonGames } from "hooks/CFBHooks/useCFBSeasonGames";
import { useNFLSeasonGames } from "hooks/NFLHooks/useNFLSeasonGames";
import { mapToInternalTeam } from "constants/teams";
import { useSeasonGames} from "hooks/useSeasonGames";
import { useSummerLeagueGames } from "hooks/useSummerLeagueGames";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import { getScoresStyles } from "styles/leagueStyles";
import { filterByDate, normalizeTeam } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { constructFromSymbol } from "date-fns/constants";

dayjs.extend(utc);
dayjs.extend(timezone);

// --- Helper to convert API game date to local timezone ---
function toLocalDate(apiGameDate: any) {
  if (!apiGameDate) return new Date();
  if (apiGameDate.timestamp) {
    return dayjs.unix(apiGameDate.timestamp).tz("America/New_York").toDate();
  }
  if (apiGameDate.date) {
    return dayjs(apiGameDate.date).tz("America/New_York").toDate();
  }
  return new Date();
}

type TeamLike = {
  id: string;
  name: string;
  record?: string;
  logo?: any;
  fullName: string;
};

export default function ScoresScreen() {
  const currentYear = "2025";

  const {
    games: nbaGames,
    loading: liveLoading,
    refreshGames: refreshLiveGames,
  } = useSeasonGames(currentYear);
  const {
    games: nflGames,
    loading: nflLoading,
    refetch: refreshNFLGames,
  } = useNFLSeasonGames("2025", "1");
  const {
    games: cfbGames,
    loading: cfbLoading,
    refetch: refreshcfbGames,
  } = useCFBSeasonGames("2025", "2");

  const {
    games: summerGames,
    loading: summerLoading,
    refreshGames: refreshSummerGames,
  } = useSummerLeagueGames();

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // --- Favorites ---
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
    }, [])
  );

  // --- Header ---
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

  // --- Normalize Games ---
  const normalizedNFLGames = nflGames.map((game) => ({
    ...game,
    date: toLocalDate(game.game?.date),
    home: {
      ...normalizeTeam(game.teams?.home),
      id: String(game.teams?.home?.id),
    },
    away: {
      ...normalizeTeam(game.teams?.away),
      id: String(game.teams?.away?.id),
    },
  }));

  const normalizedCFBGames = cfbGames.map((game) => ({
    ...game,
    date: toLocalDate(game.game?.date),
    home: {
      ...normalizeTeam(game.teams?.home),
      id: String(game.teams?.home?.id),
    },
    away: {
      ...normalizeTeam(game.teams?.away),
      id: String(game.teams?.away?.id),
    },
  }));

const normalizedSeasonGames = nbaGames.map((game: any) => {
  const home = mapToInternalTeam(game.teams?.home ?? {});
  const away = mapToInternalTeam(game.teams?.visitors ?? {});

  const gameStart = game.date?.start ?? new Date().toISOString();
  const easternDate = dayjs(gameStart).tz("America/New_York").toDate();

  return {
    ...game,
    date: easternDate,
    time: easternDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    home,
    away,
  };
});


  const normalizedSummerGames = summerGames.map((game) => ({
    ...game,
    date: game.date ? new Date(game.date) : new Date(),
    home: normalizeTeam(game.home),
    away: normalizeTeam(game.away),
  }));

  // --- Filter by selected date ---
  const filteredNFLGames = filterByDate(normalizedNFLGames, selectedDate);
  const filteredCFBGames = filterByDate(normalizedCFBGames, selectedDate);
  const filteredSeasonGames = filterByDate(normalizedSeasonGames, selectedDate);
  const filteredSummerGames = filterByDate(normalizedSummerGames, selectedDate);

  // --- Favorites helper ---
  const isFavoriteGame = (game: any, prefix: string) =>
    favorites.includes(`${prefix}:${game.home.id}`.toString()) ||
    favorites.includes(`${prefix}:${game.away.id}`.toString());

  // --- Build Favorites ---
  const favoriteGames = React.useMemo(() => {
    if (!favorites.length) return [];

    const collect = (games: any[], prefix: string, name: string) =>
      games
        .filter((g) => isFavoriteGame(g, prefix))
        .map((g) => ({ ...g, league: { name } }));

    return [
      ...collect(filteredSeasonGames, "NBA", "NBA"),
      ...collect(filteredNFLGames, "NFL", "NFL"),
      ...collect(filteredCFBGames, "CFB", "College Football"),
    ];
  }, [favorites, filteredSeasonGames, filteredNFLGames, filteredCFBGames]);


  // --- Limit non-favorites to 10 ---
  const limitNonFavorites = (games: any[], prefix: string, max = 10) => {
    const nonFavs = games.filter((g) => !isFavoriteGame(g, prefix));
    return nonFavs.slice(0, max);
  };

  // --- Apply limits (EXCLUDE favorites from other categories) ---
  const limitedNBA = limitNonFavorites(filteredSeasonGames, "NBA");
  const limitedNFL = limitNonFavorites(filteredNFLGames, "NFL");
  const limitedCFB = limitNonFavorites(filteredCFBGames, "CFB");
  const limitedSummer = limitNonFavorites(filteredSummerGames, "NBA");

  // --- Combine sections ---
  const gamesByCategory: CombinedGamesSection[] = React.useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: favoriteGames },
      { category: "NBA", data: limitedNBA },
      { category: "NFL", data: limitedNFL },
      { category: "College Football", data: limitedCFB },
      { category: "NBA Summer League", data: limitedSummer },
    ];
    return sections.filter((s) => s.data.length > 0);
  }, [favoriteGames, limitedCFB, limitedNFL, limitedNBA, limitedSummer]);

  // --- Refresh ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshLiveGames(),
    
        refreshSummerGames(),
        refreshNFLGames(),
      ]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const changeDateByDays = (days: number) => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.contentArea}>
          <DateNavigator
            selectedDate={selectedDate}
            onChangeDate={changeDateByDays}
            onOpenCalendar={() => setShowCalendarModal(true)}
            isDark={isDark}
          />

          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <CombinedGamesList
              gamesByCategory={gamesByCategory}
              loading={
                liveLoading ||
                summerLoading ||
                nflLoading ||
                cfbLoading
              }
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </ScrollView>
        </View>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const [year, month, day] = dateString.split("-").map(Number);
          setSelectedDate(new Date(year, month - 1, day));
          setShowCalendarModal(false);
        }}
        markedDates={{
          ...[
            ...normalizedSeasonGames,
            ...normalizedSummerGames,
            ...normalizedNFLGames,
          ].reduce((acc, game) => {
            if (!game.date) return acc;
            const localDate = dayjs(game.date).tz("America/New_York");
            if (!localDate.isValid()) return acc;
            const iso = localDate.format("YYYY-MM-DD");
            acc[iso] = { marked: true, dotColor: isDark ? "#fff" : "#1d1d1d" };
            return acc;
          }, {} as Record<string, { marked: boolean; dotColor: string }>),
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
