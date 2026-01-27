import MemoizedFloatingChatButton from "components//MemoizedFloatingChatButton";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayersOnCourt from "components/Sports/CBB/GameDetails/PlayersOnCourt";
import { useNBAStore } from "store/nbaStore";

import {
  BoxScore,
  GameLeaders,
  GameLocation,
  GameTeamStats,
  LastFiveGamesSwitcher,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import GameHeader from "components/Sports/NBA/GameDetails/GameHeader";
import GameOddsSection from "components/Sports/NBA/GameDetails/GameOddsSection";
import GameSummary from "components/Sports/NBA/GameDetails/GameSummary";
import GameUniforms from "components/Sports/NBA/GameDetails/GameUniforms";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LastPlay from "components/Sports/NBA/GameDetails/LastPlay";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import PlayersInFoulTrouble from "components/Sports/NBA/GameDetails/PlayersInFoulTrouble";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import TeamInjuries from "components/Sports/NBA/GameDetails/TeamInjuries";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import { getTeamById, neutralVenues, teams } from "constants/teams";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/useGameDetails";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useLastFiveGames } from "hooks/useLastFiveGames";
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
import { Game } from "types/types";
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

  let parsedGame: Game;

  try {
    parsedGame = JSON.parse(game) as Game;
  } catch (e) {
    console.warn("Failed to parse game:", game);
    return null;
  }

  if (!parsedGame?.id) return null;

  if (!parsedGame?.id) return null;
  const { home, away, date, time, status, venue, id } = parsedGame;

  const gameId = String(id);
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

  const homeTeamData = teams.find(
    (t) =>
      t.name === home.name || t.code === home.name || t.fullName === home.name
  );
  const awayTeamData = teams.find(
    (t) =>
      t.name === away.name || t.code === away.name || t.fullName === away.name
  );
  if (!homeTeamData || !awayTeamData) return null;

  const homeTeam = getTeamById(home.id);
  const awayTeam = getTeamById(away.id);

  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { score: liveScore, details } = useGameDetails(
    "nba",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDate
  );

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
    neutralVenues[venueNameFromGame] ||
    neutralVenues[venueCityFromGame] ||
    neutralVenues[homeTeamData.code] ||
    homeTeamData.venueImage;

  const awayCode = useMemo(() => awayTeamData.code, [awayTeamData.code]);
  const homeCode = useMemo(() => homeTeamData.code, [homeTeamData.code]);

  const lat = neutralArenaData?.latitude ?? homeTeamData.latitude ?? null;
  const lon = neutralArenaData?.longitude ?? homeTeamData.longitude ?? null;

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

  const { data: gameStats, loading: statsLoading } = useGameStatistics(
    Number(gameId)
  );

  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    date
  );

  const cleanedArenaNameLower = cleanedArenaName.toLowerCase();
  const homeArenaNameLower = homeTeamData.venueName.toLowerCase();
  const awayArenaNameLower = awayTeamData.venueName.toLowerCase();

  const isNeutralSiteByArena =
    cleanedArenaNameLower !== "" &&
    cleanedArenaNameLower !== homeArenaNameLower &&
    cleanedArenaNameLower !== awayArenaNameLower;

  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const fouls = liveScore?.fouls;
  const awayBonus = fouls?.away?.bonusState;
  const homeBonus = fouls?.home?.bonusState;
  const homeTimeouts = liveScore?.timeouts?.home ?? 0;
  const awayTimeouts = liveScore?.timeouts?.away ?? 0;
  const plays = liveScore?.plays ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const lastPlay = liveScore?.lastPlay

  /* ---------------- Header ---------------- */

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (isLoading || !liveScore || !homeTeamData || !awayTeamData) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    // Show header once everything is ready
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamId={homeTeamId}
          awayTeamId={awayTeamId}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          isNeutralSite={isNeutralSiteByArena}
          league="NBA"
        />
      ),
    });
  }, [
    navigation,
    isLoading,
    liveScore,
    homeCode,
    awayCode,
    isNeutralSiteByArena,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  // --- Broadcasts ---
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const displayClock = liveScore?.displayClock;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const playerStats = liveScore?.playerStats ?? [];
  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;
  const period = liveScore?.period;

  const isChristmasDay =
    gameDateObj.getMonth() === 11 && gameDateObj.getDate() === 25;
  const isNewYearsDay =
    gameDateObj.getMonth() === 0 && gameDateObj.getDate() === 1;
  const holidayLabel = isChristmasDay
    ? "Christmas Day"
    : isNewYearsDay
    ? "New Year's Day"
    : null;

  const headline = headlineText ?? holidayLabel ?? "";

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  if (isLoading || !liveScore) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          headlineText={headline}
          homeScore={homeScore}
          awayScore={awayScore}
          home={home}
          away={away}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeBonusState={homeBonus}
          awayBonusState={awayBonus}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          displayClock={displayClock}
          period={period}
          isDark={isDark}
          formattedDate={formattedDate}
          time={time}
          networkString={broadcastText}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        <View style={{ gap: 20, marginTop: 20 }}>
          {!dontShowDetails && (
            <>
              {!isFinal && !isScheduled && <LastPlay lastPlay={lastPlay} />}

              {!isFinal && (
                <WinPredictionVote
                  gameId={gameId}
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
              )}
              <GameOddsSection
                date={date}
                homeId={homeTeamId}
                awayId={awayTeamId}
                gameDate={gameDate}
                homeCode={homeCode}
                awayCode={awayCode}
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
                awayTeamId={awayTeamId}
                homeTeamId={homeTeamId}
              />

              {(isHalftime || inProgress) && (
                <PlayersInFoulTrouble gameId={gameId} home={home} away={away} />
              )}

              {!isScheduled && (
                <BoxScore
                  gameId={gameId.toString()}
                  homeTeamId={homeTeamId}
                  awayTeamId={awayTeamId}
                />
              )}
              {!isScheduled && (
                <ShotChart
                  plays={plays}
                  homeTeamId={String(homeEspnId)}
                  awayTeamId={String(awayEspnId)}
                  league="NBA"
                />
              )}

              {inProgress && (
                <PlayersOnCourt
                  playerStats={playerStats}
                  homeTeamId={Number(homeEspnId)}
                  awayTeamId={Number(awayEspnId)}
                  league={"NBA"}
                />
              )}
              {!isScheduled && (
                <GameSummary
                  plays={plays ?? []}
                  homeTeamId={String(homeEspnId)}
                  awayTeamId={String(awayEspnId)}
                  league="NBA"
                />
              )}

              {!statsLoading && gameStats && (
                <GameTeamStats stats={gameStats} />
              )}

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

              {!isFinal && (
                <GameUniforms
                  homeTeamId={homeTeamData.id}
                  awayTeamId={awayTeamData.id}
                />
              )}

              <Officials
                officials={officials ?? []}
                loading={false}
                error={null}
              />

              <GameLocation
                venueImage={resolvedArenaImage}
                venueName={resolvedArenaName}
                location={resolvedArenaCity}
                address={resolvedArenaAddress}
                venueCapacity={resolvedArenaCapacity}
                loading={weatherLoading}
                error={weatherError}
                weather={weather}
              />
            </>
          )}
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
