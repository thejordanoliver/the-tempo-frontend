import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  BoxScore,
  GameLeaders,
  GameTeamStats,
  LastFiveGamesSwitcher,
  LineScore,
  TeamInjuriesTab,
  TeamLocationSection,
  Weather,
} from "components/GameDetails";
import GameHeader from "components/GameDetails/GameHeader";
import GameOddsSection from "components/GameDetails/GameOddsSection";
import GameUniforms from "components/GameDetails/GameUniforms";
import LastPlay from "components/GameDetails/LastPlay";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import { neutralVenues, teams, venueImages } from "constants/teams";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameDetails } from "hooks/useGameDetails";
import { useGameInfo } from "hooks/useGameInfo";
import { useGameScores } from "hooks/useGameScores";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useLastFiveGames } from "hooks/useLastFiveGames";
import { useFetchPlayoffGames } from "hooks/usePlayoffSeries";
import { useTeamRecord } from "hooks/useTeamRecords";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
    arena,
    linescore,
    id: gameId,
  } = parsedGame;

  const gameDateObj = useMemo(() => {
    if (!date) return new Date(); // fallback to now
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [date]);

  const gameDate = useMemo(
    () => gameDateObj.toISOString().split("T")[0],
    [gameDateObj]
  );

  const formattedDate = useMemo(() => {
    if (!gameDateObj || isNaN(gameDateObj.getTime())) return "Unknown";

    return gameDateObj.toLocaleDateString("en-US", {
      month: "short", // 👈 short month name (Jan, Feb, Mar, etc.)
      day: "numeric",
    });
  }, [gameDateObj]);

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

  const venueNameFromGame = arena?.name ?? "";
  const venueCityFromGame = arena?.city ?? "";
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
    arena?.latitude ??
    homeTeamData.latitude ??
    null;
  const lon =
    neutralArenaData?.longitude ??
    arena?.longitude ??
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

  const season = 2025;
  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);
  const { data: gameStats, loading: statsLoading } = useGameStatistics(gameId);
  const { games: playoffGames } = useFetchPlayoffGames(
    homeTeamIdNum,
    awayTeamIdNum,
    season
  );

  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    date
  );

  const { record: awayRecord } = useTeamRecord(away?.espnID);
  const { record: homeRecord } = useTeamRecord(home?.espnID);

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

  // ESPN IDs
  const homeEspnId = homeTeamData?.espnID;
  const awayEspnId = awayTeamData?.espnID;

  const { score: liveScore, isLive } = useGameScores(
    "nba",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDate
  );

  const { headlineText } = useGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const homeScoreValue =
    liveScore?.home.total ?? parsedGame.scores?.home?.points ?? 0;
  const awayScoreValue =
    liveScore?.away.total ?? parsedGame.scores?.visitors?.points ?? 0;

  const statusDisplay =
    typeof status === "string"
      ? status
      : status?.long || status?.short || "Unknown";

  // --- Clock display ---
  const displayClock = liveScore?.displayClock ?? parsedGame.status?.clock;
  const displayPeriod = liveScore?.period ?? parsedGame.status?.period;

  // --- Quarter / period label + halftime flag ---
  const getQuarterLabel = (
    currentPeriod: number,
    totalPeriods: number = 4,
    statusText?: string
  ) => {
    if (statusText?.toLowerCase() === "halftime")
      return { label: "Halftime", halftime: true };

    switch (currentPeriod) {
      case 1:
        return { label: "1st", halftime: false };
      case 2:
        return { label: "2nd", halftime: false };
      case 3:
        return { label: "3rd", halftime: false };
      case 4:
        return { label: "4th", halftime: false };
      default:
        const otNumber = currentPeriod - totalPeriods;
        return { label: `OT${otNumber}`, halftime: false };
    }
  };

  const { label: quarterLabel, halftime } = getQuarterLabel(
    displayPeriod,
    4,
    liveScore?.statusText
  );

  // Replace your currentClock logic
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    if (status !== "In Play") return;

    const interval = setInterval(() => {
      // increment the tick to trigger re-render
      setRefreshTick((prev) => prev + 1);
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [status]);
  const normalizedStatus = (() => {
    if (typeof status === "string") return status;
    if (status?.long) return status.long;
    if (status?.short) return status.short;
    return "Unknown";
  })();
  const showBoxScore =
    normalizedStatus === "Finished" || normalizedStatus === "In ProgrPlayess";

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
          home={home}
          away={away}
          halftime={halftime}
          homeScore={homeScoreValue}
          awayScore={awayScoreValue}
          status={statusDisplay}
          period={quarterLabel}
          displayClock={displayClock}
          colors={colors}
          isDark={isDark}
          formattedDate={formattedDate}
          time={time}
          networkString={broadcastText}
          seriesSummary={seriesSummary}
          getGameNumberLabel={getGameNumberLabel}
          refreshTick={refreshTick}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
        />
        <View style={{ gap: 20, marginTop: 20 }}>
          <LastPlay lastPlay={liveScore?.lastPlay} />
          <GameOddsSection
            date={date}
            gameDate={gameDate}
            homeCode={homeCode}
            awayCode={awayCode}
            gameId={stableGameId}
          />
          <WinPredictionVote
            gameId={parsedGame.id}
            awayTeam={{
              id: awayTeamData.id,
              name: awayTeamData.name || awayTeamData.code,
              code: awayTeamData.code || awayTeamData.code,
              logo: awayTeamData.logo,
              logoLight: awayTeamData.logoLight,
              color: awayTeamData.color,
            }}
            homeTeam={{
              id: homeTeamData.id,
              name: homeTeamData.name || homeTeamData.code,
              code: homeTeamData.code || homeTeamData.code,
              logo: homeTeamData.logo,
              logoLight: homeTeamData.logoLight,
              color: homeTeamData.color,
            }}
          />
          {lineScore && (
            <LineScore
              linescore={lineScore}
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
            gameStatus={parsedGame.status.long}
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
            league="NBA"
          />
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
      <MemoizedFloatingChatButton gameId={gameId} />
    </>
  );
}
const styles = StyleSheet.create({
  container: { paddingVertical: 24, paddingHorizontal: 12, paddingBottom: 60 },
});
