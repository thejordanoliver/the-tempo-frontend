import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import CombinedGamesList, {
  CombinedGamesSection,
} from "components/CombinedGamesList";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import DateNavigator from "components/DateNavigator";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { mapToInternalTeam } from "constants/teams";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useCFBSeasonGames } from "hooks/CFBHooks/useCFBSeasonGames";
import { useNFLSeasonGames } from "hooks/NFLHooks/useNFLSeasonGames";
import { useSeasonGames } from "hooks/useSeasonGames";
import * as React from "react";
import { RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import { getScoresStyles } from "styles/leagueStyles";
import { filterByDate, isLiveGame, normalizeTeam } from "utils/games";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function LeagueScreen() {
  const currentYear = "2025";
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);

  // --- State ---
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate()
  );
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showCalendarModal, setShowCalendarModal] = React.useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = React.useState(false);
  const sportsModalRef = React.useRef<SportsListModalRef>(null);

  // --- Game Data Hooks ---
  const {
    games: nbaGames,
    loading: nbaLoading,
    refreshGames: refreshNBAGames,
  } = useSeasonGames(currentYear);

  const {
    games: cbbGames,
    loading: cbbLoading,
    refreshCBBGames,
  } = useCBBSeasonGames();

  const {
    games: nflGames,
    loading: nflLoading,
    refetch: refreshNFLGames,
  } = useNFLSeasonGames(currentYear, "1");

  const {
    games: cfbGames,
    loading: cfbLoading,
    refetch: refreshCFBGames,
  } = useCFBSeasonGames(currentYear, "2");

  // --- Load Favorites ---
  useFocusEffect(
    React.useCallback(() => {
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

  // --- Header Setup ---
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

  // --- Normalize All Games to Local Time ---
  const normalizeGames = (games: any[], leagueType: string) =>
    games
      .map((game: any) => {
        let date: dayjs.Dayjs | null = null;

        // Use timestamp if available (CFB/NFL), otherwise fallback for NBA/CBB
        if (leagueType === "CFB" || leagueType === "NFL") {
          const timestamp = game.game?.date?.timestamp;
          if (!timestamp) return null; // skip invalid games
          date = dayjs.unix(timestamp).local();
        } else {
          const rawDate =
            game.date?.start ?? game.date?.date ?? game.date ?? game.game?.date;
          if (!rawDate) return null;
          date = dayjs.utc(rawDate).local();
        }

        // --- Normalize teams ---
        let home, away;
        if (leagueType === "NBA") {
          const homeTeam = game.teams?.home ?? {};
          const awayTeam = game.teams?.visitors ?? {};
          home = mapToInternalTeam(homeTeam) || {
            id: String(homeTeam.id),
            code: homeTeam.code,
            name: homeTeam.name,
            nickname: homeTeam.nickname,
            logo: homeTeam.logo,
          };
          away = mapToInternalTeam(awayTeam) || {
            id: String(awayTeam.id),
            code: awayTeam.code,
            name: awayTeam.name,
            nickname: awayTeam.nickname,
            logo: awayTeam.logo,
          };
        } else if (leagueType === "NFL" || leagueType === "CFB") {
          home = { ...game.teams?.home, id: String(game.teams?.home?.id) };
          away = { ...game.teams?.away, id: String(game.teams?.away?.id) };
        } else if (leagueType === "CBB") {
          home = normalizeTeam(game.teams?.home);
          away = normalizeTeam(game.teams?.away);
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
      .filter(Boolean); // remove null games

  const normalizedNBAGames = normalizeGames(nbaGames, "NBA");
  const normalizedNFLGames = normalizeGames(nflGames, "NFL");
  const normalizedCFBGames = normalizeGames(cfbGames, "CFB");
  const normalizedCBBGames = normalizeGames(cbbGames, "CBB");

  // --- Filter by Selected Local Date ---
  const filteredNBA = filterByDate(normalizedNBAGames, selectedDate);
  const filteredNFL = filterByDate(normalizedNFLGames, selectedDate);
  const filteredCFB = filterByDate(normalizedCFBGames, selectedDate);
  const filteredCBB = filterByDate(normalizedCBBGames, selectedDate);

  // --- Favorites Helper ---
  const isFavoriteGame = (game: any, prefix: string) =>
    favorites.includes(`${prefix}:${String(game.home.id)}`) ||
    favorites.includes(`${prefix}:${String(game.away.id)}`);

  // --- Sort Live Games First ---
  const sortLiveFirst = (games: any[]) =>
    [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));

  // --- Limit Non-Favorites ---
  const limitNonFavorites = (games: any[], prefix: string, max = 12) =>
    sortLiveFirst(games.filter((g) => !isFavoriteGame(g, prefix))).slice(
      0,
      max
    );

  // --- Favorite Games ---
  const favoriteGames = React.useMemo(() => {
    if (!favorites.length) return [];

    const collectFavorites = (games: any[], prefix: string, name: string) =>
      games
        .filter((g) => isFavoriteGame(g, prefix))
        .map((g) => ({ ...g, league: { name } }));

    return [
      ...collectFavorites(filteredNBA, "NBA", "NBA"),
      ...collectFavorites(filteredNFL, "NFL", "NFL"),
      ...collectFavorites(filteredCFB, "CFB", "College Football"),
      ...collectFavorites(filteredCBB, "CBB", "College Basketball"),
    ];
  }, [favorites, filteredNBA, filteredNFL, filteredCFB, filteredCBB]);

  // --- Apply Live Sorting and Limiting ---
  const limitedNBA = limitNonFavorites(filteredNBA, "NBA");
  const limitedNFL = limitNonFavorites(filteredNFL, "NFL");
  const limitedCFB = limitNonFavorites(filteredCFB, "CFB");
  const limitedCBB = limitNonFavorites(filteredCBB, "CBB");

  // --- Build Combined Sections ---
  const gamesByCategory: CombinedGamesSection[] = React.useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: sortLiveFirst(favoriteGames) },
      { category: "NBA", data: sortLiveFirst(limitedNBA) },
      { category: "NFL", data: sortLiveFirst(limitedNFL) },
      { category: "College Football", data: sortLiveFirst(limitedCFB) },
      { category: "Men's College Basketball", data: sortLiveFirst(limitedCBB) },
    ];

    return sections.filter((s) => s.data.length > 0);
  }, [favoriteGames, limitedNBA, limitedNFL, limitedCFB, limitedCBB]);

  // --- Refresh Handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshNBAGames(),
        refreshNFLGames(),
        refreshCFBGames(),
        refreshCBBGames(),
      ]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Change Date (local time) ---
  const changeDateByDays = (days: number) => {
    setSelectedDate((prev) =>
      dayjs(prev).add(days, "day").startOf("day").toDate()
    );
  };

  // --- Marked Dates (local time) ---
const markedDates = React.useMemo(() => {
  return Object.fromEntries(
    [...normalizedNBAGames, ...normalizedNFLGames, ...normalizedCFBGames, ...normalizedCBBGames].map(g => [
      dayjs(g.date).format("YYYY-MM-DD"),
      { marked: true, dotColor: isDark ? "#fff" : "#1d1d1d" },
    ])
  );
}, [normalizedNBAGames, normalizedNFLGames, normalizedCFBGames, normalizedCBBGames, isDark]);


  // --- Render ---
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
              loading={nbaLoading || nflLoading || cfbLoading || cbbLoading}
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
          const localSelected = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();
          setSelectedDate(localSelected);
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
