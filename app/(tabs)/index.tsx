import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CombinedGamesList, {
  CombinedGamesSection,
} from "components/CombinedGamesList";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoritesScroll from "components/Favorites/FavoritesScroll";
import FavoritesScrollSkeleton from "components/Favorites/FavoritesScrollSkeleton";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import TabBar from "components/TabBar";
import { mapToInternalTeam } from "constants/teams";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { usetodayYesterday as useCFBtodayYesterday } from "hooks/CFBHooks/usetodayYesterday";
import { useNewsStore } from "hooks/newsStore";
import { usetodayYesterday } from "hooks/NFLHooks/usetodayYesterday";
import { useHighlights } from "hooks/useHighlights";
import { useNews } from "hooks/useNews";
import { useWeeklyGames } from "hooks/useWeeklyGames";
import * as React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { getStyles } from "styles/indexStyles";
import { isLiveGame, normalizeTeam } from "utils/games";

// 👇 Required
dayjs.extend(utc);
dayjs.extend(timezone);

type Tab = "scores" | "news";

export default function HomeScreen() {
  const {
    games: weeklyGames,
    loading: weeklyGamesLoading,
    refreshGames: refreshWeeklyGames,
  } = useWeeklyGames();

  const {
    games: nflGames,
    loading: nflLoading,
    refetch: refreshNFLGames,
  } = usetodayYesterday();

  const {
    games: cfbGames,
    loading: cfbLoading,
    refetch: refreshCFBGames,
  } = useCFBtodayYesterday();

  const {
    news: allNews,
    loading: allNewsLoading,
    error: allNewsError,
    refresh: refreshAllNews,
  } = useNews();

  const { highlights, loading: highlightsLoading } = useHighlights("10");

  // --- Types ---
  type Tab = "scores" | "news";

  type NewsItem = {
    id: string;
    title: string;
    source: string;
    url: string;
    thumbnail?: string;
    publishedAt?: string;
  };

  type HighlightItem = {
    videoId: string;
    title: string;
    publishedAt: string;
    thumbnail: string;
  };

  type CombinedItem =
    | (NewsItem & { itemType: "news" })
    | (HighlightItem & { itemType: "highlight" });

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);
  const setArticles = useNewsStore((state) => state.setArticles);

  // --- Ensure selectedDate is normalized to ET start-of-day ---
  const [selectedDate, setSelectedDate] = React.useState(() =>
    dayjs().tz("America/New_York").startOf("day").toDate()
  );
  const tabs: Tab[] = ["scores", "news"];
  const [selectedTab, setSelectedTab] = useState<Tab>("scores");
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const tabMeasurements = useRef<{ x: number; width: number }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const toLocalDate = (dateString?: string | null) => {
    if (!dateString) return dayjs(); // fallback to now
    return dayjs(dateString).local(); // convert to device local time
  };

  // --- Helpers ---
  const isValidDate = (dateString?: string) => {
    if (!dateString) return false;
    const d = toLocalDate(dateString);
    return !isNaN(d.valueOf());
  };

  // 📰 Cache news
  useEffect(() => {
    if (allNews && allNews.length > 0) setArticles(allNews);
  }, [allNews, setArticles]);

  // 🌟 Load favorites on focus
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

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="Home" tabName="Home" isTeamScreen={false} />
      ),
    });
  }, [navigation, isDark]);

  // --- Tab underline animation
  const handleTabPress = (tab: Tab) => {
    setSelectedTab(tab);
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

  // --- Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "scores") {
        await Promise.all([
          refreshWeeklyGames(),
          refreshNFLGames(),
          refreshCFBGames(),
        ]);
      } else {
        await refreshAllNews();
      }
    } catch (err) {
      console.warn("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Convert date to ET and return a dayjs object in ET ---
  const toEastern = (dateString?: string | Date) =>
    dayjs(dateString).tz("America/New_York");

  // --- Normalize NBA games using LeagueScreen logic ---
  const normalizedNBA = weeklyGames.map((game: any) => {
    const home = mapToInternalTeam(game.home ?? {});
    const away = mapToInternalTeam(game.away ?? {});
    const rawDate = game.date?.start ?? game.date; // raw API UTC string
    const date = dayjs.utc(rawDate).tz("America/New_York"); // ✅ convert once to ET
    return {
      ...game,
      date: date.toDate(),
      dateString: date.format("YYYY-MM-DD"),
      time: date.format("h:mm A"),
      home,
      away,
    };
  });

  const normalizedNFL = nflGames.map((game) => {
    const dateInfo = game.game?.date;

    let date = dayjs().tz("America/New_York"); // fallback

    if (dateInfo) {
      if ("utc" in dateInfo && typeof dateInfo.utc === "string") {
        date = dayjs.utc(dateInfo.utc).tz("America/New_York");
      } else if (typeof dateInfo.timestamp === "number") {
        date = dayjs.unix(dateInfo.timestamp).tz("America/New_York");
      } else if (typeof dateInfo.date === "string") {
        date = dayjs.utc(dateInfo.date).tz("America/New_York");
      }
    }

    return {
      ...game,
      date: date.toDate(),
      dateString: date.format("YYYY-MM-DD"),
      time: date.isValid() ? date.format("h:mm A") : "TBD",
      home: {
        ...normalizeTeam(game.teams?.home),
        id: String(game.teams?.home?.id),
      },
      away: {
        ...normalizeTeam(game.teams?.away),
        id: String(game.teams?.away?.id),
      },
    };
  });

  const normalizedCFB = cfbGames.map((game) => {
    const raw = game.game?.date?.date ?? game.game?.date;
    const date = toEastern(raw);
    return {
      ...game,
      date: date.toDate(),
      dateString: date.format("YYYY-MM-DD"),
      home: {
        ...normalizeTeam(game.teams?.home),
        id: String(game.teams?.home?.id),
      },
      away: {
        ...normalizeTeam(game.teams?.away),
        id: String(game.teams?.away?.id),
      },
      time: date.format("h:mm A"),
    };
  });

  // --- Filter by selected Eastern date ---
  const filteredNBA = normalizedNBA.filter((g) => {
    const gameET = dayjs(g.date).tz("America/New_York");
    const selectedET = dayjs(selectedDate).tz("America/New_York");
    return gameET.isSame(selectedET, "day");
  });

  // --- Filter NFL games: same-day or next upcoming ---
  const filteredNFL = React.useMemo(() => {
    const selectedET = toEastern(selectedDate);
    let games = normalizedNFL.filter((g) =>
      dayjs(g.date).isSame(selectedET, "day")
    );

    // If no same-day games, show the next available date’s games
    if (games.length === 0 && normalizedNFL.length > 0) {
      // Find the earliest game after selectedDate
      const nextGame = normalizedNFL
        .map((g) => dayjs(g.date))
        .filter((d) => d.isAfter(selectedET))
        .sort((a, b) => a.valueOf() - b.valueOf())[0];

      if (nextGame) {
        games = normalizedNFL.filter((g) =>
          dayjs(g.date).isSame(nextGame, "day")
        );
      }
    }

    return games;
  }, [normalizedNFL, selectedDate]);

  const filteredCFB = normalizedCFB.filter((g) => {
    const gameET = toEastern(g.date);
    const selectedET = toEastern(selectedDate);
    return gameET.isSame(selectedET, "day");
  });

  // --- Favorites Helper ---
  const isFavoriteGame = (game: any, prefix: string) =>
    favorites.includes(`${prefix}:${String(game.home.id)}`) ||
    favorites.includes(`${prefix}:${String(game.away.id)}`);

  const sortLiveFirst = (games: any[]) =>
    [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));

  const limitNonFavorites = (games: any[], prefix: string, max = 10) =>
    games.filter((g) => !isFavoriteGame(g, prefix)).slice(0, max);

  // --- Favorite & Limited Sections ---
  const favoriteGames = React.useMemo(() => {
    if (!favorites.length) return [];
    const collect = (games: any[], prefix: string, name: string) =>
      games
        .filter((g) => isFavoriteGame(g, prefix))
        .map((g) => ({ ...g, league: { name } }));

    return [
      ...collect(filteredNBA, "NBA", "NBA"),

      ...collect(filteredNFL, "NFL", "NFL"),
      ...collect(filteredCFB, "CFB", "College Football"),
    ];
  }, [favorites, filteredNBA, filteredNFL, filteredCFB]);

  const limitedNBA = limitNonFavorites(filteredNBA, "NBA");

  const limitedNFL = limitNonFavorites(filteredNFL, "NFL");

  const limitedCFB = limitNonFavorites(filteredCFB, "CFB");

  // --- Combine Sections ---
  const gamesByCategory: CombinedGamesSection[] = React.useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: sortLiveFirst(favoriteGames) },
      { category: "NBA", data: sortLiveFirst(limitedNBA) },
      { category: "NFL", data: sortLiveFirst(limitedNFL) },
      { category: "College Football", data: sortLiveFirst(limitedCFB) },
    ];
    return sections.filter((s) => s.data.length > 0);
  }, [favoriteGames, limitedNBA, limitedNFL, limitedCFB]);

  // --- Combine news + highlights ---
  const combinedNewsAndHighlights: CombinedItem[] = React.useMemo(() => {
    const taggedNews: CombinedItem[] = allNews.map((item) => ({
      ...item,
      itemType: "news",
      publishedAt: isValidDate(item.publishedAt)
        ? item.publishedAt!
        : new Date().toISOString(),
    }));
    const taggedHighlights: CombinedItem[] = highlights.map((item) => ({
      ...item,
      itemType: "highlight",
      publishedAt: isValidDate(item.publishedAt)
        ? item.publishedAt
        : new Date().toISOString(),
    }));
    return [...taggedNews, ...taggedHighlights].sort(
      (a, b) =>
        new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
    );
  }, [allNews, highlights]);

  // --- Render ---
  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        <View style={styles.tabBarWrapper}>
          <TabBar
            tabs={tabs}
            selected={selectedTab}
            onTabPress={handleTabPress}
          />
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? "#fff" : "#000"}
              colors={[isDark ? "#fff" : "#000"]}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {selectedTab === "scores" ? (
            <>
              {weeklyGamesLoading ? (
                <FavoritesScrollSkeleton />
              ) : (
                <FavoritesScroll
                  favoriteTeamIds={favorites}
                  onFavoritesChange={setFavorites}
                />
              )}

              <CombinedGamesList
                gamesByCategory={gamesByCategory}
                loading={weeklyGamesLoading || nflLoading || cfbLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </>
          ) : allNewsError ? (
            <Text style={styles.emptyText}>{allNewsError}</Text>
          ) : combinedNewsAndHighlights.length === 0 && !refreshing ? (
            <Text style={styles.emptyText}>
              No news or highlights available.
            </Text>
          ) : (
            <NewsHighlightsList
              items={combinedNewsAndHighlights}
              loading={allNewsLoading || highlightsLoading}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}
