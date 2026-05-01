import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import GameHeader from "components/Sports/MLB/GameDetails/GameHeader";
import GameSummary from "components/Sports/MLB/GameDetails/GameSummary";
import LastPlay from "components/Sports/MLB/GameDetails/LastPlay";
import MLBInjuries from "components/Sports/MLB/GameDetails/MLBInjuries";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import GameLiveChatOverlay from "components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import { getNeutralStadium } from "constants/neutralVenues";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { useLastFiveGames } from "hooks/MLBHooks/useLastFiveGames";
import usePlayersByTeam from "hooks/MLBHooks/usePlayersByTeam";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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
  const gameId = String(parsedGame?.id);
  const homeTeam = getMLBTeam(homeId);
  const awayTeam = getMLBTeam(awayId);
  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);
  const homeLogo = getMLBTeamLogo(homeId, isDark);
  const awayLogo = getMLBTeamLogo(awayId, isDark);
  const headerHomeLogo = getMLBTeamLogo(home.id, true);
  const headerAwayLogo = getMLBTeamLogo(away.id, true);
  const homeEspnId = awayTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

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

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

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
  const homeScore =
    liveScore?.home?.total ?? parsedGame?.scores?.home?.total ?? 0;
  const awayScore =
    liveScore?.away?.total ?? parsedGame?.scores?.away?.total ?? 0;
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
  const homeTeamPlayersData = usePlayersByTeam(String(homeId));
  const awayTeamPlayersData = usePlayersByTeam(String(awayId));

  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const neutralVenue = getNeutralStadium(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address ||
      `${baseVenue?.address.city} ${baseVenue?.address.state}, ${baseVenue?.address.zipCode} ${baseVenue?.address.country}`;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images[0]?.href
    : homeTeam?.venueImage || baseVenue?.images[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);
  const venueAttendance = baseVenue?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, gameDateStr);

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
          homeLogo={headerHomeLogo}
          awayLogo={headerAwayLogo}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          isNeutralSite={neutralSite}
          league="MLB"
        />
      ),
    });
  }, [navigation, isLoading, liveScore, homeCode, awayCode, neutralSite]);

  if (isLoading || !liveScore) {
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
            <FanPredictionVote
              gameId={gameId}
              awayTeam={{
                id: awayTeamId,
                code: awayCode,
                logo: headerAwayLogo,
                color: awayTeam?.color,
              }}
              homeTeam={{
                id: homeTeamId,
                code: homeCode,
                logo: headerHomeLogo,
                color: homeTeam?.color,
              }}
            />
          )}
          {!isScheduled && (
            <LineScore
              linescore={lineScore}
              homeCode={homeTeam.code}
              awayCode={awayTeam.code}
              league="MLB"
              isDark={isDark}
            />
          )}

          {isScheduled && (
            <MatchupPredictor
              home={{
                name: homeCode,
                logo: homeLogo,
                chance: homeChance,
                color: isDark ? homeTeam?.secondaryColor : homeTeam?.color,
              }}
              away={{
                name: awayCode,
                logo: awayLogo,
                chance: awayChance,
              }}
              size={180}
              isDark={isDark}
            />
          )}

          <GameSummary plays={plays ?? []} />

          <LastFiveGames
            isDark={isDark}
            home={{
              teamId: homeTeamId,
              teamCode: homeCode,
              games: homeLastGames.games,
            }}
            away={{
              teamId: awayTeamId,
              teamCode: awayCode,
              games: awayLastGames.games,
            }}
            league="MLB"
          />

          <HighlightVideoList highlights={highlights} isDark={isDark} />

          <MLBInjuries
            injuries={injuries}
            loading={false}
            isDark={isDark}
            teamPlayersMap={teamPlayersMap}
          />

          <Officials officials={officials ?? []} isDark={isDark} />

          <GameLocation
            venueImage={venueImage}
            venueName={venueImage}
            location={venueLocation}
            address={venueAddress}
            venueCapacity={String(venueCapacity)}
            venueAttendance={venueAttendance}
            weather={weather}
            isDark={isDark}
          />
        </View>
      </ScrollView>

      <GameLiveChatOverlay
        gameId={String(parsedGame?.id)}
        opacityAnim={opacityAnim}
      />
    </>
  );
}
