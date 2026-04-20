import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LastPlay from "components/Sports/MLB/GameDetails/LastPlay";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import MemoizedFloatingChatButton from "components/Sports/NBA/GameDetails/GameChat/MemoizedFloatingChatButton";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameHeader from "components/Sports/NHL/GameDetails/GameHeader";
import GameSummary from "components/Sports/NHL/GameDetails/GameSummary";
import NHLInjuries from "components/Sports/NHL/GameDetails/NHLInjuries";
import ShotChart from "components/Sports/NHL/GameDetails/ShotChart";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useHockeyDetails } from "hooks/NHLHooks/useHockeyGameDetails";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { Animated, ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { NHLGame } from "types/hockey";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams<{ game: string }>();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  // Parse game safely before hooks that depend on it
  let parsedGame: NHLGame | null = null;
  if (typeof game === "string") {
    try {
      parsedGame = JSON.parse(game) as NHLGame;
    } catch (e) {
      console.warn("Failed to parse game:", game);
    }
  }

  const teams = parsedGame?.teams;
  const gameId = parsedGame?.id ?? null;
  const timestamp = parsedGame?.timestamp ?? "";

  const {
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(Number(timestamp));

  const homeTeam = getNHLTeam(teams?.home?.id ?? 0) ?? null;
  const awayTeam = getNHLTeam(teams?.away?.id ?? 0) ?? null;

  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const homeLogo = getNHLTeamLogo(homeTeamId, isDark);
  const awayLogo = getNHLTeamLogo(awayTeamId, isDark);
  const headerHomeLogo = getNHLTeamLogo(homeTeamId, true);
  const headerAwayLogo = getNHLTeamLogo(awayTeamId, true);

  // ✅ All hooks before any early returns
  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);

  const {
    score: liveScore,
    details,
    loading,
  } = useHockeyDetails(
    "nhl",
    String(awayEspnId ?? ""),
    String(homeEspnId ?? ""),
    gameDateStr,
  );

  const venue = details?.venue;
  const neutralSite = details?.neutralSite;

  const resolvedVenue = useMemo(
    () =>
      resolveVenue({
        espnVenue: venue,
        homeTeam,
        isNeutralSite: neutralSite,
        league: "NHL",
      }),
    [venue, homeTeam, neutralSite],
  );
  const { weather, weatherError, weatherLoading } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateStr,
  );

  useLayoutEffect(() => {
    if (!liveScore || !homeTeam || !awayTeam) {
      navigation.setOptions({ header: () => null });
      return;
    }
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamId={homeTeamId}
          awayTeamId={awayTeamId}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          homeLogo={headerHomeLogo}
          awayLogo={headerAwayLogo}
          isNeutralSite={neutralSite}
          league="NHL"
        />
      ),
    });
  }, [navigation, liveScore, homeCode, awayCode, neutralSite]);

  // ✅ Early returns AFTER all hooks
  if (!parsedGame?.id || !homeTeam || !awayTeam) return null;

  if (loading || !liveScore) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  // Derived values (no hooks below this point)
  const broadcastText = getBroadcastDisplay(details?.broadcasts);
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const plays = liveScore?.plays;
  const lastPlay = liveScore?.lastPlay;
  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const seriesSummary = details?.seriesSummary?.summary;
  const period = liveScore?.period;
  const displayClock = liveScore?.displayClock ?? "0:00";
  const homeScore = liveScore?.home?.total ?? parsedGame?.scores?.home ?? 0;
  const awayScore = liveScore?.away?.total ?? parsedGame?.scores?.away ?? 0;
  const homeRecord = details?.records?.home.overall ?? "0-0";
  const awayRecord = details?.records?.away.overall ?? "0-0";
  const homeTimeouts = liveScore?.timeouts?.home ?? 0;
  const awayTimeouts = liveScore?.timeouts?.away ?? 0;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

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
          headlineText={headlineText}
          seriesSummary={seriesSummary}
          home={homeTeam}
          away={awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          isDark={isDark}
          period={period}
          displayClock={displayClock}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        <View style={styles.innerContainer}>
          {!dontShowDetails && (
            <>
              {!isFinal && !isScheduled && <LastPlay lastPlay={lastPlay} />}

              {!isFinal && (
                <FanPredictionVote
                  gameId={String(gameId)}
                  awayTeam={{
                    id: awayTeamId,
                    code: awayCode,
                    logo: headerAwayLogo,
                    color: awayTeam.color,
                  }}
                  homeTeam={{
                    id: homeTeamId,
                    code: homeCode,
                    logo: headerHomeLogo,
                    color: homeTeam.color,
                  }}
                />
              )}

              {lineScore && (
                <LineScore
                  linescore={lineScore}
                  homeCode={homeCode}
                  awayCode={awayCode}
                  league="NHL"
                  isDark={isDark}
                />
              )}

              {!isScheduled && (
                <ShotChart
                  plays={plays}
                  homeTeamId={String(homeEspnId)}
                  awayTeamId={String(awayEspnId)}
                  isDark={isDark}
                />
              )}

              <GameSummary plays={plays ?? []} isDark={isDark} />
              <HighlightVideoList highlights={highlights} isDark={isDark} />

              <NHLInjuries
                injuries={injuries}
                loading={loading}
                error={null}
                homeTeamId={String(homeEspnId)}
                awayTeamId={String(awayEspnId)}
                isDark={isDark}
              />

              <Officials
                officials={officials}
                loading={loading}
                error={null}
                isDark={isDark}
              />

              <GameLocation
                venueImage={resolvedVenue.image}
                venueName={resolvedVenue.name}
                location={resolvedVenue.city ?? resolvedVenue.name}
                address={resolvedVenue.address}
                venueCapacity={String(resolvedVenue.capacity ?? "")}
                venueAttendance={undefined}
                loading={weatherLoading}
                weather={weather}
                error={weatherError}
                isDark={isDark}
              />
            </>
          )}
        </View>
      </ScrollView>

      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={String(gameId)} />
      </Animated.View>
    </>
  );
}
