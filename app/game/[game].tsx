import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FloatingChatButton from "components/FloatingButton";
import {
  BoxScore,
  GameLeaders,
  GameTeamStats,
  LastFiveGamesSwitcher,
  LineScore,
  PredictionBar,
  TeamInjuriesTab,
  TeamLocationSection,
  Weather,
} from "components/GameDetails";
import GameHeader from "components/GameDetails/GameHeader";
import GameOddsSection from "components/GameDetails/GameOddsSection";
import GameOfficials from "components/GameDetails/GameOfficials";
import GameUniforms from "components/GameDetails/GameUniforms";
import { Fonts } from "constants/fonts";
import { neutralVenues, teams, venueImages } from "constants/teams";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameDetails } from "hooks/useGameDetails";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useLastFiveGames } from "hooks/useLastFiveGames";
import { useFetchPlayoffGames } from "hooks/usePlayoffSeries";
import { useGamePrediction } from "hooks/usePredictions";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { matchBroadcastToGame } from "utils/matchBroadcast";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { openChat, isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const isScrollingRef = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);


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

  if (typeof game !== "string") return null;

  let parsedGame: any;
  try {
    parsedGame = JSON.parse(game);
  } catch (e) {
    console.warn("Failed to parse game:", game);
    return null;
  }
  if (!parsedGame?.id) return null;

  const {
    home,
    away,
    date,

    time,
    status,
    homeScore,
    awayScore,
    period,
    clock,
    venue,
    linescore,
    id: gameId,
  } = parsedGame;


  const gameDateObj = useMemo(() => {
  if (!date) return new Date(); // fallback to now
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date() : d;
}, [date]);

const gameDate = useMemo(() => gameDateObj.toISOString().split("T")[0], [gameDateObj]);

const formattedDate = useMemo(
  () =>
    gameDateObj
      ? gameDateObj.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
      : "Unknown",
  [gameDateObj]
);

const gameDateStr = useMemo(() => gameDateObj.toISOString(), [gameDateObj]);


  const homeTeamData = teams.find(
    (t) =>
      t.name === home.name || t.code === home.name || t.fullName === home.name
  );
  const awayTeamData = teams.find(
    (t) =>
      t.name === away.name || t.code === away.name || t.fullName === away.name
  );
  if (!homeTeamData || !awayTeamData) return null;

  const homeTeamIdNum = Number(homeTeamData.id);
  const awayTeamIdNum = Number(awayTeamData.id);

  const homeColor = homeTeamData.color || "#007A33";
  const awayColor = awayTeamData.color || "#CE1141";

  const venueNameFromGame = venue?.name ?? "";
  const venueCityFromGame = venue?.city ?? "";
  const neutralArenaData = neutralVenues[venueNameFromGame];

  const cleanedArenaName = venueNameFromGame.replace(/\s*\(.*?\)/, "").trim();
  const resolvedArenaName = cleanedArenaName || homeTeamData.venueName;
  const resolvedArenaCity = venueCityFromGame || homeTeamData.location;
  const resolvedArenaAddress =
    neutralArenaData?.address || homeTeamData.address || "";
  const resolvedArenaCapacity =
    neutralArenaData?.venueCapacity || homeTeamData.venueCapacity || "";
  const resolvedArenaImage =
    neutralArenaData?.venueImage ||
    venueImages[venueNameFromGame] ||
    venueImages[venueCityFromGame] ||
    venueImages[homeTeamData.code] ||
    homeTeamData.venueImage;


  const awayCode = useMemo(() => awayTeamData.code, [awayTeamData.code]);
  const homeCode = useMemo(() => homeTeamData.code, [homeTeamData.code]);
  const stableGameId = useMemo(() => gameId.toString(), [gameId]);

  const lat =
    neutralArenaData?.latitude ??
    venue?.latitude ??
    homeTeamData.latitude ??
    null;
  const lon =
    neutralArenaData?.longitude ??
    venue?.longitude ??
    homeTeamData.longitude ??
    null;

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

  const season = 2024;
  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);
  const { data: gameStats, loading: statsLoading } = useGameStatistics(gameId);
  const { games: playoffGames } = useFetchPlayoffGames(
    homeTeamIdNum,
    awayTeamIdNum,
    season
  );
  const {
    data: prediction,
    loading: predictionLoading,
    error: predictionError,
  } = useGamePrediction(homeTeamIdNum, awayTeamIdNum, season);
  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    date
  );


  const currentPlayoffGame = playoffGames.find((g) => g.id === gameId);
  const awayIsWinner =
    status === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    status === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

  const cleanedArenaNameLower = cleanedArenaName.toLowerCase();
  const homeArenaNameLower = homeTeamData.venueName.toLowerCase();
  const awayArenaNameLower = awayTeamData.venueName.toLowerCase();

  const isNeutralSiteByArena =
    cleanedArenaNameLower !== "" &&
    cleanedArenaNameLower !== homeArenaNameLower &&
    cleanedArenaNameLower !== awayArenaNameLower;
  const isHomeSiteByArena = cleanedArenaNameLower === homeArenaNameLower;

  const headerTitle = isNeutralSiteByArena
    ? `${awayTeamData.code} vs ${homeTeamData.code}`
    : isHomeSiteByArena
    ? `${awayTeamData.code} @ ${homeTeamData.code}`
    : `${awayTeamData.code} vs ${homeTeamData.code}`;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          isNeutralSite={isNeutralSiteByArena}
        />
      ),
    });
  }, [navigation, headerTitle]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  const seriesSummary = currentPlayoffGame?.seriesSummary;
  const getGameNumberLabel = () =>
    currentPlayoffGame?.gameNumber
      ? `Game ${currentPlayoffGame.gameNumber}`
      : null;


  const { broadcasts } = useGameBroadcasts(
    homeTeamData.name,
    awayTeamData.name,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  const { data, detailsLoading, detailsError } = useGameDetails(
    gameDate,
    homeTeamData.name,
    awayTeamData.name
  );

const homeScoreValue = parsedGame.scores?.home?.points ?? 0;
const awayScoreValue = parsedGame.scores?.visitors?.points ?? 0;

const statusDisplay = status?.long || status?.short || "Unknown";
  // Replace your currentClock logic
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (status !== "In Progress") return;

    const interval = setInterval(() => {
      // increment the tick to trigger re-render
      setRefreshTick((prev) => prev + 1);
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [status]);

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
  homeTeamData={homeTeamData}
  awayTeamData={awayTeamData}
  home={home}
  away={away}
  homeScore={homeScoreValue}
  awayScore={awayScoreValue}
  status={statusDisplay}   // ← use this
  period={period}
  displayClock={clock}
  colors={colors}
  isDark={isDark}
  formattedDate={formattedDate}
  time={time}
  networkString={broadcastText}
  seriesSummary={seriesSummary}
  getGameNumberLabel={getGameNumberLabel}
  refreshTick={refreshTick}
/>


        <View style={{ gap: 20, marginTop: 20 }}>
      
            <GameOddsSection
              date={date}
              gameDate={gameDate}
              homeCode={homeCode}
              awayCode={awayCode}
              gameId={stableGameId}
            />

            {linescore && (
              <LineScore
                linescore={linescore}
                homeCode={homeTeamData.code}
                awayCode={awayTeamData.code}
              />
            )}

        

            <GameLeaders
              gameId={gameId.toString()}
              awayTeamId={awayTeamIdNum}
              homeTeamId={homeTeamIdNum}
            />

            <BoxScore
              gameId={gameId.toString()}
              homeTeamId={homeTeamIdNum}
              awayTeamId={awayTeamIdNum}
            />
            {!statsLoading && gameStats && <GameTeamStats stats={gameStats} />}

            <LastFiveGamesSwitcher
              isDark={isDark}
              home={{
                teamCode: homeTeamData.code,
                teamLogo: homeTeamData.logo,
                teamLogoLight: homeTeamData.logoLight,
                games: homeLastGames.games,
              }}
              away={{
                teamCode: awayTeamData.code,
                teamLogo: awayTeamData.logo,
                teamLogoLight: awayTeamData.logoLight,
                games: awayLastGames.games,
              }}
            />
            <GameOfficials officials={data?.officials ?? []} />
            <TeamInjuriesTab injuries={data?.injuries ?? []} />

            <GameUniforms
              homeTeamId={homeTeamData.id}
              awayTeamId={awayTeamData.id}
            />

            <TeamLocationSection
              venueImage={resolvedArenaImage}
              venueName={resolvedArenaName}
              location={resolvedArenaCity}
              address={resolvedArenaAddress}
              venueCapacity={resolvedArenaCapacity}
              loading={weatherLoading}
              error={weatherError}
            />

            <Weather
              address={resolvedArenaAddress}
              weather={weather}
              loading={weatherLoading}
              error={weatherError}
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
        <FloatingChatButton gameId={gameId} openChat={openChat} />
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
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    paddingBottom: 12,
    position: "relative",
  },
  playoffSummaryContainer: {
    marginHorizontal: 12,
    position: "absolute",
    top: -16,
    borderRadius: 6,
    backgroundColor: "#22222222",
    alignItems: "center",
  },
  playoffSummaryText: {
    fontFamily: Fonts.OSEXTRALIGHT,
    fontSize: 12,
    textAlign: "center",
  },
});
