import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import LastPlay from "components/Sports/MLB/GameDetails/LastPlay";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import GameHeader from "components/Sports/NHL/GameDetails/GameHeader";
import GameSummary from "components/Sports/NHL/GameDetails/GameSummary";
import NHLInjuries from "components/Sports/NHL/GameDetails/NHLInjuries";
import ShotChart from "components/Sports/NHL/GameDetails/ShotChart";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useHockeyDetails } from "hooks/NHLHooks/useHockeyGameDetails";
import { useScrollFade } from "hooks/useScrollFade";
import { useLayoutEffect, useMemo } from "react";
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

  const { home, away } = parsedGame;

  const timestamp = parsedGame?.timestamp;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);

  const homeId = home?.id ?? parsedGame?.teams?.home?.id;
  const awayId = away?.id ?? parsedGame?.teams?.away?.id;

  if (!homeId || !awayId) return null;
  const homeTeam = getNHLTeam(homeId);
  const awayTeam = getNHLTeam(awayId);
  const homeTeamId = homeTeam?.id;
  const awayTeamId = awayTeam?.id;
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);
  const homeLogo = getNHLTeamLogo(home?.id, isDark);
  const awayLogo = getNHLTeamLogo(away?.id, isDark);
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  if (!homeTeam || !awayTeam) return null;

  const {
    score: liveScore,
    details,
    loading,
  } = useHockeyDetails(
    "nhl",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const neutralSite = details?.neutralSite;
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
  const clock = liveScore?.displayClock ?? "0:00";
  const homeScore =
    liveScore?.home?.total ?? parsedGame?.scores?.home?.total ?? 0;
  const awayScore =
    liveScore?.away?.total ?? parsedGame?.scores?.away?.total ?? 0;
  const homeRecord = details?.records?.home.overall ?? "0-0";
  const awayRecord = details?.records?.away.overall ?? "0-0";
  const homeTimeouts = liveScore?.timeouts.home ?? 0;
  const awayTimeouts = liveScore?.timeouts.away ?? 0;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const venue = details?.venue;

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
        league: "NHL",
      }),
    [venue, homeTeam, neutralSite],
  );

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (loading || !liveScore || !homeTeam || !awayTeam) {
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
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          isNeutralSite={neutralSite}
          league="NHL"
        />
      ),
    });
  }, [navigation, loading, liveScore, homeCode, awayCode, neutralSite]);

  if (loading || !liveScore) {
    return (
      <View style={styles.loadingContainer}>
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
          headlineText={headlineText}
          seriesSummary={seriesSummary}
          home={homeTeam}
          away={awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          isDark={isDark}
          period={period}
          displayClock={clock}
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

              {lineScore && (
                <LineScore
                  linescore={lineScore}
                  homeCode={homeCode}
                  awayCode={awayCode}
                  league="NHL"
                />
              )}

              {!isScheduled && (
                <ShotChart
                  plays={plays}
                  homeTeamId={String(homeEspnId)}
                  awayTeamId={String(awayEspnId)}
                />
              )}

              <GameSummary plays={plays ?? []} />

              <HighlightVideoList highlights={highlights} />

              <NHLInjuries
                injuries={injuries}
                loading={loading}
                error={null}
                awayTeamAbbr={awayTeam.code}
                homeTeamAbbr={homeTeam.code}
              />

              <Officials
                officials={officials ?? []}
                loading={loading}
                error={null}
              />
              <GameLocation
                venueImage={resolvedVenue.image}
                venueName={resolvedVenue.name}
                location={
                  resolvedVenue.city
                    ? `${resolvedVenue.city}`
                    : resolvedVenue.name
                }
                address={resolvedVenue.address}
                venueCapacity={String(resolvedVenue.capacity ?? "")}
                venueAttendance={undefined}
                loading={false}
                error={null}
              />
            </>
          )}
        </View>
      </ScrollView>

      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={parsedGame.id} />
      </Animated.View>
    </>
  );
}
