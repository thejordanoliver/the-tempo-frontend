import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { StandingsList } from "components/League/Standings/StandingsList";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import GameHeader from "components/Sports/MLB/GameDetails/GameHeader";
import GameSummary from "components/Sports/MLB/GameDetails/GameSummary";
import LastPlay from "components/Sports/MLB/GameDetails/LastPlay";
import MLBInjuries from "components/Sports/MLB/GameDetails/MLBInjuries";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import { getMLBTeam } from "constants/teamsMLB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { useLastFiveGames } from "hooks/MLBHooks/useLastFiveGames";
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
import { getMLBStandingsSeason } from "utils/dateUtils";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [standingsYear, setStandingsYear] = useState(
    getMLBStandingsSeason().toString(),
  );
  // -----------------------------------------------------
  // 🟦 Stabilize parsedGame (critical fix)
  // -----------------------------------------------------
  const parsedGame = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch {
      return null;
    }
  }, [game]);

  if (!parsedGame?.id) return null;

  // -----------------------------------------------------
  // 🟩 Extract via parsed object
  // -----------------------------------------------------
  const { home, away, timestamp } = parsedGame;

  // -----------------------------------------------------
  // 🟧 Stable gameDate object
  // -----------------------------------------------------

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);
  // -----------------------------------------------------
  // 🟥 Team Mapping
  // -----------------------------------------------------
  const homeId = home?.id ?? parsedGame?.teams?.home?.id;
  const awayId = away?.id ?? parsedGame?.teams?.away?.id;

  if (!homeId || !awayId) return null;

  const homeTeam = getMLBTeam(homeId);
  const awayTeam = getMLBTeam(awayId);
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);
  const homeLogo = isDark ? homeTeam?.logoLight : homeTeam?.logo;
  const awayLogo = isDark ? awayTeam?.logoLight : awayTeam?.logo;

  if (!homeTeam || !awayTeam) return null;

  const {
    score: liveScore,
    details,
    loading,
  } = useBaseballGameDetails(
    "mlb",
    awayTeam?.espnID,
    homeTeam?.espnID,
    gameDateStr,
  );

  const homeLastGames = useLastFiveGames(homeId);
  const awayLastGames = useLastFiveGames(awayId);

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const neutralSite = details?.neutralSite;
  const headline = details?.headline;
  const seriesSummary = details?.seriesSummary;
  const seasonState = details?.seasonState;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.statusText ?? "";
  const plays = liveScore?.plays;
  const lastPlay = liveScore?.lastPlay;
  const isPostseason = details?.isPostseason;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const playerStats = liveScore?.playerStats ?? [];
  const homeScore = liveScore?.home.total ?? parsedGame.scores.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? parsedGame.scores.away.total ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const period = liveScore?.period;
  const venue = details?.venue;
  const attendance = details?.venue;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const isTopInning = gameStatusDetail.includes("Top");
  const outs = liveScore?.outs;
  const bases: { first: boolean; second: boolean; third: boolean } =
    liveScore?.bases ?? {
      first: false,
      second: false,
      third: false,
    };

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const resolvedVenue = useMemo(
    () =>
      resolveVenue({
        espnVenue: venue,
        homeTeam: homeTeam,
        isNeutralSite: neutralSite,
        league: "MLB",
      }),
    [venue, homeTeam, neutralSite],
  );

  const { weather } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateStr,
  );

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (isLoading || !liveScore || !homeTeam || !awayTeam) {
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
          homeTeamId={homeId}
          awayTeamId={awayId}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          isNeutralSite={neutralSite}
          league="MLB"
        />
      ),
    });
  }, [navigation, isLoading, liveScore, homeCode, awayCode, neutralSite]);
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  // -----------------------------------------------------
  // 🎬 Scroll Fade Animations
  // -----------------------------------------------------
  const handleScrollStart = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
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
      Animated.timing(opacityAnim, {
        toValue: isChatOpen ? 0 : 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);
  };
  if (isLoading || !liveScore) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  // -----------------------------------------------------
  // 🧱 UI Render
  // -----------------------------------------------------
  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        stickyHeaderIndices={[0]}
        onScrollBeginDrag={handleScrollStart}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
      >
        <GameHeader
          seriesSummary={seriesSummary}
          headlineText={headline}
          seasonState={seasonState}
          home={homeTeam}
          away={awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          league="mlb"
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
          isTopInning={isTopInning}
          outs={outs}
          bases={bases}
        />

        {!isFinal && <LastPlay lastPlay={lastPlay} />}

        <View style={{ gap: 20, marginTop: 20 }}>
          {!isFinal && (
            <WinPredictionVote
              gameId={parsedGame.id}
              awayTeam={{
                id: awayTeam.id,
                name: awayTeam.name,
                code: awayTeam.code,
                logo: awayTeam.logo,
                logoLight: awayTeam.logoLight,
                color: awayTeam.color,
              }}
              homeTeam={{
                id: homeTeam.id,
                name: homeTeam.name,
                code: homeTeam.code,
                logo: homeTeam.logo,
                logoLight: homeTeam.logoLight,
                color: homeTeam.color,
              }}
            />
          )}

          {!isScheduled && (
            <LineScore
              linescore={lineScore}
              homeCode={homeTeam.code}
              awayCode={awayTeam.code}
              league="MLB"
            />
          )}

          {isScheduled && (
            <MatchupPredictor
              away={{
                name: awayTeam.code ?? "UNK",
                logo: awayLogo,
                color: isDark ? awayTeam.secondaryColor : awayTeam.color,
                chance: awayChance,
              }}
              home={{
                name: homeTeam.code ?? "UNK",
                logo: homeLogo,
                color: isDark ? homeTeam.secondaryColor : homeTeam.color,
                chance: homeChance,
              }}
              size={180}
            />
          )}
          <GameSummary plays={plays ?? []} />

          <LastFiveGames
            isDark={isDark}
            away={{
              teamId: awayTeam.id,
              teamCode: awayTeam.code,
              games: awayLastGames.games,
            }}
            home={{
              teamId: homeTeam.id,
              teamCode: homeTeam.code,
              games: homeLastGames.games,
            }}
            league="MLB"
          />

          <HighlightVideoList highlights={highlights} />

          <MLBInjuries
            injuries={injuries}
            loading={false}
            error={null}
            awayTeam={awayTeam.code}
            homeTeam={homeTeam.code}
          />

          <Officials officials={officials ?? []} loading={false} error={null} />

          <GameLocation
            venueImage={resolvedVenue.image}
            venueName={resolvedVenue.name}
            location={
              resolvedVenue.city ? `${resolvedVenue.city}` : resolvedVenue.name
            }
            address={resolvedVenue.address}
            venueCapacity={String(resolvedVenue.capacity ?? "")}
            venueAttendance={undefined}
            weather={weather}
            loading={false}
            error={null}
          />

          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="MLB"
          />
        </View>
      </ScrollView>

      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={parsedGame.id} />
      </Animated.View>
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
