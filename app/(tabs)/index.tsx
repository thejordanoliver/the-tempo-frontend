import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CombinedGamesList, {
  CombinedGamesSection,
} from "components/CombinedGamesList";
import FavoritesScroll from "../../components/Favorites/FavoritesScroll";
import FavoritesScrollSkeleton from "../../components/Favorites/FavoritesScrollSkeleton";
import TabBar from "../../components/TabBar";
import { useNewsStore } from "../../hooks/newsStore";
import { useHighlights } from "../../hooks/useHighlights";
import { useNews } from "../../hooks/useNews";
import { useWeeklyGames } from "../../hooks/useWeeklyGames";
import { useSummerLeagueGames } from "hooks/useSummerLeagueGames";
import { usetodayYesterday } from "hooks/NFLHooks/usetodayYesterday";
import { usetodayYesterday as useCFBtodayYesterday } from "hooks/CFBHooks/usetodayYesterday";
import * as React from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import type { summerGame, Game, Team } from "types/types";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { getStyles } from "../../styles/indexStyles";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";

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

// --- Helpers ---
const isValidDate = (dateString?: string) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  return !isNaN(d.getTime());
};
const isTodayOrTomorrow = (dateString?: string) => {
  if (!isValidDate(dateString) || !dateString) return false;
const gameDate = new Date(dateString ?? new Date().toISOString());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return (
    (gameDate >= today && gameDate < new Date(today.getTime() + 86400000)) ||
    (gameDate >= tomorrow && gameDate < new Date(tomorrow.getTime() + 86400000))
  );
};

function mapSummerGameToGame(g: summerGame): Game {
  return {
    ...g,
    home: { ...g.home, espnID: Number(g.home?.id ?? 0) },
    away: { ...g.away, espnID: Number(g.away?.id ?? 0) },
    venue: typeof g.venue === "string" ? { name: g.venue, city: "" } : g.venue,
    status:
      g.status?.short === "FT"
        ? "Final"
        : g.status?.short === "NS"
        ? "Scheduled"
        : "In Progress",
    period: g.period !== undefined ? String(g.period) : undefined,
    date: isValidDate(g.date) ? g.date : new Date().toISOString(),
  };
}

// --- HomeScreen ---
export default function HomeScreen() {
  // --- Hooks for games & news ---
  const { games: weeklyGames, loading: weeklyGamesLoading, refreshGames: refreshWeeklyGames } = useWeeklyGames();
  const { games: summerGames, loading: summerLoading, refreshGames: refreshSummerGames } = useSummerLeagueGames() as {
    games: summerGame[];
    loading: boolean;
    refreshGames: () => Promise<void>;
  };
  const { games: nflGames, loading: nflLoading, refetch: refreshNFLGames } = usetodayYesterday();
  const { games: cfbGames, loading: cfbLoading, refetch: refreshCFBGames } = useCFBtodayYesterday();
  const { news, loading: newsLoading, error: newsError, refreshNews } = useNews();
  const { highlights, loading: highlightsLoading } = useHighlights("NBA highlights", 50);

  // --- Setup ---
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);
  const setArticles = useNewsStore((state) => state.setArticles);

  // --- Tabs ---
  const tabs: Tab[] = ["scores", "news"];
  const [selectedTab, setSelectedTab] = useState<Tab>("scores");
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const tabMeasurements = useRef<{ x: number; width: number }[]>([]);

  // --- Favorites ---
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (news && news.length > 0) setArticles(news);
  }, [news, setArticles]);

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

  useEffect(() => {
    useNewsStore.getState().loadCachedArticles();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle title="Home" tabName="Home" isTeamScreen={false} />,
    });
  }, [navigation, isDark]);

  // --- Tabs logic ---
  const handleTabPress = (tab: Tab) => {
    setSelectedTab(tab);
    const index = tabs.indexOf(tab);
    if (tabMeasurements.current[index]) {
      Animated.parallel([
        Animated.timing(underlineX, { toValue: tabMeasurements.current[index].x, duration: 200, useNativeDriver: false }),
        Animated.timing(underlineWidth, { toValue: tabMeasurements.current[index].width, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  };

  // --- Pull to refresh ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "scores") {
        await Promise.all([refreshWeeklyGames?.(), refreshSummerGames?.(), refreshNFLGames?.(), refreshCFBGames?.()]);
      } else if (selectedTab === "news") {
        await refreshNews?.();
      }
    } catch (err) {
      console.warn("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Filter & sort games ---
  const filteredWeeklyNBA = weeklyGames.filter((g) => isValidDate(g.date) && isTodayOrTomorrow(g.date));
  const filteredSummerNBA = summerGames.filter((g) => isValidDate(g.date) && isTodayOrTomorrow(g.date)).map(mapSummerGameToGame);

  const sortGamesByLiveStatus = (games: Game[]) => {
    return [...games].sort((a, b) => {
      const liveStatuses = ["In Progress", "Live", "1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter"];
      const aLive = liveStatuses.includes(a.status) ? 1 : 0;
      const bLive = liveStatuses.includes(b.status) ? 1 : 0;
      if (aLive !== bLive) return bLive - aLive;
      const aTime = isValidDate(a.date) ? new Date(a.date).getTime() : 0;
      const bTime = isValidDate(b.date) ? new Date(b.date).getTime() : 0;
      return aTime - bTime;
    });
  };

  const sortedWeeklyNBA = sortGamesByLiveStatus(filteredWeeklyNBA);
  const sortedSummerNBA = sortGamesByLiveStatus(filteredSummerNBA);

  // --- Favorites helper ---
  const isFavoriteGame = (game: any, prefix: string) => {
    const homeId = game.home?.id;
    const awayId = game.away?.id;
    if (!homeId && !awayId) return false;
    return (homeId && favorites.includes(`${prefix}:${homeId}`)) || (awayId && favorites.includes(`${prefix}:${awayId}`));
  };

  // --- Build Favorites ---
  const favoriteGames = React.useMemo(() => {
    if (!favorites.length) return [];
    const collect = (games: any[], prefix: string, leagueName: string) =>
      games.filter((g) => isFavoriteGame(g, prefix)).map((g) => ({ ...g, league: { name: leagueName } }));
    return [
      ...collect(weeklyGames, "NBA", "NBA"),
      ...collect(summerGames.map(mapSummerGameToGame), "NBA", "NBA Summer League"),
      ...collect(nflGames, "NFL", "NFL"),
      ...collect(cfbGames, "CFB", "College Football"),
    ];
  }, [favorites, weeklyGames, summerGames, nflGames, cfbGames]);

  // --- Limit non-favorites ---
  const limitNonFavorites = (games: any[], prefix: string, max = 10) =>
    games.filter((g) => !isFavoriteGame(g, prefix)).slice(0, max);

  const limitedWeeklyNBA = limitNonFavorites(sortedWeeklyNBA, "NBA");
  const limitedSummerNBA = limitNonFavorites(sortedSummerNBA, "NBA");
  const limitedNFL = limitNonFavorites(nflGames.filter((g) => isValidDate(g.game.date.date)), "NFL");
  const limitedCFB = limitNonFavorites(cfbGames.filter((g) => isValidDate(g.game.date.date)), "CFB");

  // --- Combine sections ---
  const gamesByCategory: CombinedGamesSection[] = React.useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: favoriteGames },
      { category: "NBA", data: limitedWeeklyNBA },
      { category: "NBA Summer League", data: limitedSummerNBA },
      { category: "NFL", data: limitedNFL },
      { category: "College Football", data: limitedCFB },
    ];
    return sections.filter((s) => s.data.length > 0);
  }, [favoriteGames, limitedWeeklyNBA, limitedSummerNBA, limitedNFL, limitedCFB]);

  // --- Combine news + highlights ---
  const combinedNewsAndHighlights: CombinedItem[] = React.useMemo(() => {
    const taggedNews: CombinedItem[] = news.map((item) => ({
      ...item,
      itemType: "news",
      publishedAt: isValidDate(item.publishedAt) ? item.publishedAt! : new Date().toISOString(),
    }));
    const taggedHighlights: CombinedItem[] = highlights.map((item) => ({
      ...item,
      itemType: "highlight",
      publishedAt: isValidDate(item.publishedAt) ? item.publishedAt : new Date().toISOString(),
    }));
    return [...taggedNews, ...taggedHighlights].sort(
      (a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
    );
  }, [news, highlights]);

  // --- Render ---
  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        <View style={styles.tabBarWrapper}>
          <TabBar tabs={tabs} selected={selectedTab} onTabPress={handleTabPress} />
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
              {weeklyGamesLoading || summerLoading ? (
                <FavoritesScrollSkeleton />
              ) : (
                <FavoritesScroll favoriteTeamIds={favorites} />
              )}

              <CombinedGamesList
                gamesByCategory={gamesByCategory}
                loading={weeklyGamesLoading || summerLoading || nflLoading || cfbLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </>
          ) : newsError ? (
            <Text style={styles.emptyText}>{newsError}</Text>
          ) : combinedNewsAndHighlights.length === 0 && !refreshing ? (
            <Text style={styles.emptyText}>No news or highlights available.</Text>
          ) : (
            <NewsHighlightsList
              items={combinedNewsAndHighlights}
              loading={newsLoading || highlightsLoading}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}
