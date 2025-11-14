import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mapToInternalTeam } from "constants/teams";
import { useWeeklyGames } from "hooks/useWeeklyGames";
import { usetodayYesterday as useNFLtodayYesterday } from "hooks/NFLHooks/usetodayYesterday";
import { usetodayYesterday as useCFBtodayYesterday } from "hooks/CFBHooks/usetodayYesterday";
import { useCBBWeeklyGames } from "hooks/CBBHooks/useCBBWeeklyGames";
import { useNews } from "hooks/useNews";
import { useHighlights } from "hooks/useHighlights";
import { useNewsStore } from "hooks/newsStore";
import { normalizeTeam, isLiveGame } from "utils/games";
import { CombinedGamesSection } from "components/CombinedGamesList";
import { saveTokens } from "utils/authStorage";

dayjs.extend(utc);
dayjs.extend(timezone);

export function useHomeData(selectedTab: "scores" | "news") {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Local date for filtering
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().startOf("day").toDate()
  );

  // Data sources
  const { games: weeklyGames, loading: nbaLoading, refreshGames } = useWeeklyGames();
  const { games: nflGames, loading: nflLoading, refetch: refreshNFL } = useNFLtodayYesterday();
  const { games: cfbGames, loading: cfbLoading, refetch: refreshCFB } = useCFBtodayYesterday();
  const { cbbGames, cbbLoading, refresh: refreshCBB } = useCBBWeeklyGames();
  const { news, loading: newsLoading, error: newsError, refresh: refreshNews } = useNews();
  const { highlights, loading: highlightsLoading } = useHighlights("10");

  const setArticles = useNewsStore((s) => s.setArticles);

  // 🧠 Load favorites when screen focuses
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

  // 🗞 Cache latest news
  useEffect(() => {
    if (news && news.length > 0) setArticles(news);
  }, [news, setArticles]);

  // Helpers
  const isFavorite = (g: any, prefix: string) =>
    favorites.includes(`${prefix}:${String(g.home.id)}`) ||
    favorites.includes(`${prefix}:${String(g.away.id)}`);

  const sortLiveFirst = (games: any[]) =>
    [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));

  const limitNonFavorites = (games: any[], prefix: string, max = 10) =>
    games.filter((g) => !isFavorite(g, prefix)).slice(0, max);

  // 🏀 Normalize NBA
  const normalizedNBA = weeklyGames.map((game: any) => {
    const home = mapToInternalTeam(game.home ?? {});
    const away = mapToInternalTeam(game.away ?? {});
    const rawDate = game.date?.start ?? game.date;
    const date = dayjs(rawDate); // ✅ local time
    return {
      ...game,
      date: date.toDate(),
      dateString: date.format("YYYY-MM-DD"),
      time: date.format("h:mm A"),
      home,
      away,
    };
  });

// 🏈 Normalize NFL
const normalizedNFL = nflGames.map((game) => {
  const dateInfo = game.game?.date;
  let date = dayjs(); // fallback to now if missing

  if (dateInfo) {
    if (typeof dateInfo.timestamp === "number") {
      date = dayjs.unix(dateInfo.timestamp); // ✅ convert from seconds
    } else if (dateInfo.date) {
      date = dayjs(dateInfo.date); // fallback to ISO string
    }
  }

  return {
    ...game,
    date: date.toDate(),
    dateString: date.format("YYYY-MM-DD"),
    time: date.isValid() ? date.format("h:mm A") : "TBD",
    home: { ...normalizeTeam(game.teams?.home), id: String(game.teams?.home?.id) },
    away: { ...normalizeTeam(game.teams?.away), id: String(game.teams?.away?.id) },
  };
});


  // 🏈 Normalize CFB (local)
  const normalizedCFB = cfbGames.map((g) => {
    const date = dayjs(g.game?.date?.date ?? g.game?.date);
    return {
      ...g,
      date: date.toDate(),
      dateString: date.format("YYYY-MM-DD"),
      time: date.format("h:mm A"),
      home: { ...normalizeTeam(g.teams?.home), id: String(g.teams?.home?.id) },
      away: { ...normalizeTeam(g.teams?.away), id: String(g.teams?.away?.id) },
    };
  });

  

  // 🏀 Normalize CBB (local)
  const normalizedCBB = cbbGames.map((g: any) => {
    const date = dayjs(g.date || g.dateUTC || g.dateLocal);
    return {
      ...g,
      date: date.toDate(),
      dateString: date.format("YYYY-MM-DD"),
      time: date.format("h:mm A"),
      home: { ...normalizeTeam(g.teams?.home), id: String(g.teams?.home?.id) },
      away: { ...normalizeTeam(g.teams?.away), id: String(g.teams?.away?.id) },
    };
  });

  // 📅 Filter for today (local)
  const filterByDate = (games: any[]) =>
    games.filter((g) => dayjs(g.date).isSame(selectedDate, "day"));


// 📅 Filter for yesterday through 7 days ahead (local)
const filterThisWeek = (games: any[]) => {
  const now = dayjs();
  const start = now.subtract(1, "day").startOf("day");
  const end = now.add(7, "day").endOf("day");
  return games.filter((g) => {
    const d = dayjs(g.date);
    return d.isAfter(start) && d.isBefore(end);
  });
};

  
 const filteredNBA = filterByDate(normalizedNBA); 
const filteredNFL = filterThisWeek(normalizedNFL);
const filteredCFB = filterThisWeek(normalizedCFB);
const filteredCBB = filterByDate(normalizedCBB); 
  // ⭐ Favorites
  const favoriteGames = useMemo(() => {
    if (!favorites.length) return [];
    const collect = (games: any[], prefix: string, name: string) =>
      games.filter((g) => isFavorite(g, prefix)).map((g) => ({ ...g, league: { name } }));

    return [
      ...collect(filteredNBA, "NBA", "NBA"),
      ...collect(filteredNFL, "NFL", "NFL"),
      ...collect(filteredCFB, "CFB", "College Football"),
      ...collect(filteredCBB, "CBB", "College Basketball"),
    ];
  }, [favorites, filteredNBA, filteredNFL, filteredCFB, filteredCBB]);

  // 🧩 Limit sections
  const limitedNBA = limitNonFavorites(filteredNBA, "NBA");
  const limitedNFL = limitNonFavorites(filteredNFL, "NFL");
  const limitedCFB = limitNonFavorites(filteredCFB, "CFB");
  const limitedCBB = limitNonFavorites(filteredCBB, "CBB");

  // 📊 Combine all categories
  const gamesByCategory: CombinedGamesSection[] = useMemo(
    () =>
      [
        { category: "Favorites", data: sortLiveFirst(favoriteGames) },
        { category: "NBA", data: sortLiveFirst(limitedNBA) },
        { category: "NFL", data: sortLiveFirst(limitedNFL) },
        { category: "College Football", data: sortLiveFirst(limitedCFB) },
        { category: "Men's College Basketball", data: sortLiveFirst(limitedCBB) },
      ].filter((s) => s.data.length > 0) as CombinedGamesSection[],
    [favoriteGames, limitedNBA, limitedNFL, limitedCFB, limitedCBB]
  );

  // 📰 Merge news + highlights
  const combinedNewsAndHighlights = useMemo(() => {
    const taggedNews = news.map((n) => ({
      ...n,
      itemType: "news" as const,
      publishedAt: n.publishedAt ?? new Date().toISOString(),
    }));
    const taggedHighlights = highlights.map((h) => ({
      ...h,
      itemType: "highlight" as const,
      publishedAt: h.publishedAt ?? new Date().toISOString(),
      duration: String(h.duration),
    }));
    return [...taggedNews, ...taggedHighlights].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [news, highlights]);

  // 🔄 Refresh logic
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "scores") {
        await Promise.all([refreshGames(), refreshNFL(), refreshCFB(), refreshCBB()]);
      } else {
        await refreshNews();
      }
    } finally {
      setRefreshing(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    favorites,
    setFavorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    combinedNewsAndHighlights,
    newsError,
    loading:
      nbaLoading ||
      nflLoading ||
      cfbLoading ||
      cbbLoading ||
      newsLoading ||
      highlightsLoading,
  };
}
