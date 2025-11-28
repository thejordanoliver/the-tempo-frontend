import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  BoxScore,
  GameLeaders,
  GameTeamStats,
  LastFiveGamesSwitcher,
  LineScore,
  TeamLocationSection,
  Weather,
} from "components/GameDetails";
import GameHeader from "components/GameDetails/GameHeader";
import GameOddsSection from "components/GameDetails/GameOddsSection";
import GameSummary from "components/GameDetails/GameSummary";
import GameUniforms from "components/GameDetails/GameUniforms";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import LastPlay from "components/GameDetails/LastPlay";
import Officials from "components/GameDetails/Officials";
import ShotChart from "components/GameDetails/ShotChart";
import TeamInjuries from "components/GameDetails/TeamInjuries";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import { Colors } from "constants/Colors";
import { neutralVenues, teams, venueImages } from "constants/teams";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/CBBHooks/useGameDetails";
import { useGameBroadcasts } from "hooks/useBroadcasts";

import { useGameInfo } from "hooks/useGameInfo";
import { useGameScores } from "hooks/useGameScores";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useLastFiveGames } from "hooks/useLastFiveGames";

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
  const { home, away, date, time, status, arena, id: gameId } = parsedGame;

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

  // --- Colors ---
  const colors = useMemo(
    () => ({
      background: isDark ? Colors.black : Colors.white,
      text: isDark ? Colors.dark.white : Colors.light.black,
      secondaryText: isDark ? Colors.lightGray : Colors.darkGray,
      record: isDark ? Colors.dark.white : Colors.light.black,
      score: isDark ? Colors.lightGray : Colors.darkGray,
      winnerScore: isDark ? Colors.dark.white : Colors.light.black,
      border: isDark ? Colors.darkGray : Colors.lightGray,
      finalText: isDark ? Colors.dark.lightRed : Colors.light.red,
    }),
    [isDark]
  );

  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);
  const { data: gameStats, loading: statsLoading } = useGameStatistics(
    Number(gameId)
  );

  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    date
  );

  const { record: awayRecord } = useTeamRecord(away?.espnID);
  const { record: homeRecord } = useTeamRecord(home?.espnID);

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

  const { broadcasts } = useGameBroadcasts(
    homeTeamData.name,
    awayTeamData.name,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  // ESPN IDs
  const homeEspnId = homeTeamData?.espnID;
  const awayEspnId = awayTeamData?.espnID;

  const { score: liveScore } = useGameScores(
    "nba",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDate
  );

  const {
    officials,
    highlights,
    timeouts,
    injuries,
    plays,
    loading: officialsLoading,
    error: officialsError,
  } = useGameDetails("nba", homeEspnId, awayEspnId, gameDate);

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

  const formattedTeamInjuries = (injuries ?? []).map((inj) => ({
    team: {
      displayName: inj.team?.displayName ?? "",
      abbreviation: inj.team?.abbreviation ?? "",
    },
    injuries: inj.athletes ?? [], // 👈 This matches the TeamInjury type
  }));

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
    if (statusText?.toLowerCase() === "halftime") {
      return { label: "Halftime", halftime: true };
    }

    // Regulation
    switch (currentPeriod) {
      case 1:
        return { label: "1st", halftime: false };
      case 2:
        return { label: "2nd", halftime: false };
      case 3:
        return { label: "3rd", halftime: false };
      case 4:
        return { label: "4th", halftime: false };
    }

    // Overtime
    const otNumber = currentPeriod - totalPeriods;

    if (otNumber === 1) {
      return { label: "OT", halftime: false }; // ✅ First OT → "OT"
    }

    return { label: `${otNumber}OT`, halftime: false }; // ✅ e.g. "2OT", "3OT", etc.
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
          awayTimeouts={timeouts.away ?? 0}
          homeTimeouts={timeouts.home ?? 0}
          status={liveScore?.status ?? ""}
          period={quarterLabel}
          displayClock={displayClock}
          colors={colors}
          isDark={isDark}
          formattedDate={formattedDate}
          time={time}
          networkString={broadcastText}
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

          {liveScore?.status !== "scheduled" && (
            <ShotChart
              plays={plays}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
              isCBB={false}
            />
          )}

          <GameSummary
            plays={plays ?? []}
            awayTeamId={awayEspnId}
            homeTeamId={homeEspnId}
            league="NBA"
          />

          {liveScore?.status !== "scheduled" && (
            <BoxScore
              gameId={gameId.toString()}
              homeTeamId={homeTeamIdNum}
              awayTeamId={awayTeamIdNum}
            />
          )}

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
          <TeamInjuries injuries={injuries} />
          {highlights.length > 0 && (
            <HighlightVideoList highlights={highlights} />
          )}
          <GameUniforms
            homeTeamId={homeTeamData.id}
            awayTeamId={awayTeamData.id}
          />
          <Officials officials={officials ?? []} loading={false} error={null} />
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
  container: {
    paddingVertical: 0,
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
});
