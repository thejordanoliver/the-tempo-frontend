import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FloatingChatButton from "components/FloatingButton";
import { LastFiveGamesSwitcher } from "components/GameDetails";
import GameHeader from "components/GameDetails/GameHeader";
import GameOddsSection from "components/GameDetails/GameOddsSection";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import { teams } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBGamePossession } from "hooks/CBBHooks/useCBBGamePossession";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useFetchPlayoffGames } from "hooks/usePlayoffSeries";
import { useTeamRecord } from "hooks/useTeamRecords";
import { useWeatherForecast } from "hooks/useWeather";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
const parts = String(game).split("-");
const homeId = parts[0];
const awayId = parts[1];
const date = parts.slice(2).join("-"); // ✅ preserves full date (e.g. "2025-11-04")

  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { openChat, isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const isScrollingRef = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Scroll animation for Floating Button ---
  const handleScrollStart = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    isScrollingRef.current = true;

    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleScrollEnd = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isScrollingRef.current = false;
      Animated.timing(opacityAnim, {
        toValue: isChatOpen ? 0 : 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  // --- Team Data ---
  const homeTeamId = Number(homeId);
  const awayTeamId = Number(awayId);

  const homeTeamData = teams.find((t) => Number(t.id) === homeTeamId);
  const awayTeamData = teams.find((t) => Number(t.id) === awayTeamId);

  if (!homeTeamData || !awayTeamData) {
    console.warn("Missing team data for IDs:", { homeTeamId, awayTeamId });
    return null;
  }

  // --- Date Handling ---
  const gameDateObj = useMemo(() => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [date]);

  const gameDate = gameDateObj.toISOString().split("T")[0];
  const formattedDate = gameDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = gameDateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const gameDateStr = gameDateObj.toISOString();

  // --- Colors ---
  const colors = useMemo(
    () => ({
      background: isDark ? "#1d1d1d" : "#ffffff",
      text: isDark ? "#ffffff" : "#000000", 
      secondaryText: isDark ? "#aaa" : "#444",
      record: isDark ? "#fff" : "#1d1d1d",
      score: isDark ? "#aaa" : "rgba(0, 0, 0, 0.4)",
      winnerScore: isDark ? "#fff" : "#000",
      live: isDark ? "#0f0" : "#090",
      border: isDark ? "#333" : "#ccc",
      finalText: isDark ? "#ff4c4c" : "#d10000",
    }),
    [isDark]
  );

  // --- Hooks ---
  const season = 2025;
  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);
  const { record: homeRecord } = useTeamRecord(homeTeamData.espnID, "cbb");
  const { record: awayRecord } = useTeamRecord(awayTeamData.espnID, "cbb");
  const gameId = Number(`${homeTeamId}${awayTeamId}`);
  const { data: gameStats } = useGameStatistics(gameId);
  const { games: playoffGames } = useFetchPlayoffGames(
    homeTeamId,
    awayTeamId,
    season
  );

  const lat = homeTeamData.latitude ?? null;
  const lon = homeTeamData.longitude ?? null;
  const { weather } = useWeatherForecast(lat, lon, date);

  const homeEspnId = homeTeamData.espnID;
  const awayEspnId = awayTeamData.espnID;

  const { broadcasts } = useGameBroadcasts(
    homeTeamData.name,
    awayTeamData.name,
    gameDateStr,
    "mens-college-basketball"
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  const { headlineText } = useCBBHeadline(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const livePossession = useCBBGamePossession(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
  );

  // --- Derived Data ---
  const displayHomeScore = livePossession?.score?.home ?? 0;
  const displayAwayScore = livePossession?.score?.away ?? 0;
  const displayClock = livePossession?.displayClock ?? "";
  const statusDisplay = livePossession?.gameStatusDescription ?? "Scheduled";
  const periodNum = Number(livePossession?.period ?? 0);
  const quarterLabel =
    periodNum > 2 ? `OT${periodNum - 2}` : periodNum === 2 ? "2nd" : "1st";

  // --- Header Title ---
  const isNeutralSite = false;
  const headerTitle = `${awayTeamData.code} @ ${homeTeamData.code}`;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamCode={homeTeamData.code}
          awayTeamCode={awayTeamData.code}
          isNeutralSite={isNeutralSite}
          league="CBB"
        />
      ),
    });
  }, [navigation, headerTitle]);

  // --- Loading Delay for Animation ---
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        style={{ backgroundColor: colors.background }}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          headlineText={headlineText}
          homeTeamData={homeTeamData}
          awayTeamData={awayTeamData}
          home={{ name: homeTeamData.name }}
          away={{ name: awayTeamData.name }}
          homeScore={displayHomeScore}
          awayScore={displayAwayScore}
          status={statusDisplay}
          period={quarterLabel}
          displayClock={displayClock}
          colors={colors}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          refreshTick={0}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          league="cbb"
        />

        <View style={{ gap: 20, marginTop: 20 }}>
          <GameOddsSection
            date={date}
            gameDate={gameDate}
            homeCode={homeTeamData.code!}
            awayCode={awayTeamData.code!}
            gameId={`${homeTeamId}-${awayTeamId}`}
          />

          <WinPredictionVote
            gameId={`${homeTeamId}-${awayTeamId}`}
            awayTeam={{
              id: awayTeamData.id,
              name: awayTeamData.name,
              code: awayTeamData.code,
              logo: awayTeamData.logo,
              logoLight: awayTeamData.logoLight,
              color: awayTeamData.color,
            }}
            homeTeam={{
              id: homeTeamData.id,
              name: homeTeamData.name,
              code: homeTeamData.code,
              logo: homeTeamData.logo,
              logoLight: homeTeamData.logoLight,
              color: homeTeamData.color,
            }}
          />

          <LastFiveGamesSwitcher
            isDark={isDark}
            home={{
              teamCode: homeTeamData.code!,
              teamLogo: homeTeamData.logo,
              teamLogoLight: homeTeamData.logoLight,
              games: homeLastGames.games,
            }}
            away={{
              teamCode: awayTeamData.code!,
              teamLogo: awayTeamData.logo,
              teamLogoLight: awayTeamData.logoLight,
              games: awayLastGames.games,
            }}
            league="CBB"
          />
        </View>
      </ScrollView>

      <Animated.View
        style={{
          opacity: opacityAnim,
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
        }}
        pointerEvents={isChatOpen ? "none" : "auto"}
      >
        <FloatingChatButton
          gameId={`${homeTeamId}-${awayTeamId}`}
          openChat={openChat}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
});
