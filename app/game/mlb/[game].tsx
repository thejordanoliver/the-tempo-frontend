import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
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
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { useLastFiveGames } from "hooks/MLBHooks/useLastFiveGames";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Animated, ScrollView, useColorScheme, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { opacityAnim, handleScrollStart, handleScrollEnd, showDetails } =
    useScrollFade();

  const parsedGame = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch {
      return null;
    }
  }, [game]);

  if (!parsedGame?.id) return null;

  const { home, away, timestamp } = parsedGame;

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
  const homeLogo = getMLBTeamLogo(homeId, isDark);
  const awayLogo = getMLBTeamLogo(awayId, isDark);

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
  const homeScore = liveScore?.home?.total ?? parsedGame?.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away?.total ?? parsedGame?.scores?.away?.total ?? 0;
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
          homeLogo={homeLogo}
          awayLogo={awayLogo}
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
        contentContainerStyle={styles.container}
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


        <View style={styles.innerContainer}>
        {!isFinal && <LastPlay lastPlay={lastPlay} />}
        
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

          {isScheduled && homeChance != 0 && awayChance != 0 && (
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
        </View>
      </ScrollView>

      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={parsedGame.id} />
      </Animated.View>
    </>
  );
}
