import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameHeader from "components/Sports/CBB/GameDetails/GameHeader";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/CBB/GameDetails/GameTeamStats";
import LastPlay from "components/Sports/CBB/GameDetails/LastPlay";
import PlayersOnCourt from "components/Sports/CBB/GameDetails/PlayersOnCourt";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import MemoizedFloatingChatButton from "components/Sports/NBA/GameDetails/GameChat/MemoizedFloatingChatButton";
import GameSummary from "components/Sports/NBA/GameDetails/GameSummary";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import PlayersInFoulTrouble from "components/Sports/NBA/GameDetails/PlayersInFoulTrouble";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import {
  getCBBTeam,
  getCBBTeamLogo,
  getNeutralVenue,
} from "constants/teamsCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect, useMemo } from "react";
import { Animated, ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { BasketballGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";
/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseGameDate(raw: any) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw * 1000);
  return new Date(raw);
}

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { opacityAnim, handleScrollStart, handleScrollEnd, showDetails } =
    useScrollFade();

  /* ---------------- Parse Game ---------------- */

  const gameObj: BasketballGame | null = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch (e) {
      console.warn("Failed to parse game param", e);
      return null;
    }
  }, [game]);

  if (!gameObj) return null;

  /* ---------------- League ---------------- */
  const isWomen =
    String(gameObj?.league?.id) === "423" ||
    gameObj?.league?.name === "Women's College Basketball";
  const league = isWomen ? "WCBB" : "CBB";

  /* ---------------- Teams ---------------- */

  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);
  const homeTeam = getCBBTeam(gameObj.teams.home.id, isWomen);
  const awayTeam = getCBBTeam(gameObj.teams.away.id, isWomen);
  const homeLogo = getCBBTeamLogo(homeTeamId, isDark, isWomen);
  const awayLogo = getCBBTeamLogo(awayTeamId, isDark, isWomen);
  const homeName = homeTeam?.code;
  const awayName = awayTeam?.code;
  const homeHeaderLogo = getCBBTeamLogo(homeTeamId, true, isWomen);
  const awayHeaderLogo = getCBBTeamLogo(awayTeamId, true, isWomen);

  const homeEspnId = homeTeam?.espnID ?? 0;
  const awayEspnId = awayTeam?.espnID ?? 0;

  /* ---------------- Date ---------------- */

  const gameDateObj = useMemo(
    () => parseGameDate((gameObj as any)?.timestamp ?? (gameObj as any)?.date),
    [gameObj],
  );

  const formattedDate = gameDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime = gameDateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const gameDateISO = gameDateObj.toISOString();
  const gameDateYMD = gameDateISO.split("T")[0];

  /* ---------------- Hooks ---------------- */
  const detailsLeague = isWomen ? "wcbb" : "cbb";

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateYMD,
  );

  const isLoadingGame =
    !liveScore ||
    !details ||
    liveScore.home?.total == null ||
    liveScore.away?.total == null;

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const period = liveScore?.period;
  const displayClock = liveScore?.displayClock;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;
  const plays = liveScore?.plays ?? [];
  const headlineText = details?.headline;
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const neutralSite = details?.neutralSite;
  const leaders = liveScore?.leaders ?? [];
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const lastPlay = liveScore?.lastPlay ?? "";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  const homeFoulPlayers =
    liveScore?.foulTrouble
      ?.find((t) => String(t.team?.id) === String(homeEspnId))
      ?.players?.map((p) => ({
        id: p.id,
        teamId: String(homeEspnId),
        name: p.shortName,
        jersey: p.jersey,
        fouls: p.fouls,
        avatarUrl: p.avatar ?? "",
      })) ?? [];

  const awayFoulPlayers =
    liveScore?.foulTrouble
      ?.find((t) => String(t.team?.id) === String(awayEspnId))
      ?.players?.map((p) => ({
        id: p.id,
        teamId: String(awayEspnId),
        name: p.shortName,
        jersey: p.jersey,
        fouls: p.fouls,
        avatarUrl: p.avatar ?? "",
      })) ?? [];
  /* ---------------- Hooks ---------------- */

  // Pass `isWomen` flag to useLastFiveGames
  const { games: homeLastGames } = useLastFiveGames(homeTeamId, isWomen);
  const { games: awayLastGames } = useLastFiveGames(awayTeamId, isWomen);

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
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
  const venueAttendance = details?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, gameDateISO);

  /* ---------------- Status / linescore ---------------- */

  const displayHomeScore = liveScore?.home.total ?? 0;
  const displayAwayScore = liveScore?.away.total ?? 0;

  // --- Period scores / line score ---
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  /* ---------------- Header ---------------- */

  useLayoutEffect(() => {
    // While loading or missing data → NO HEADER
    if (isLoadingGame || !homeTeam || !awayTeam) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    // Once loaded → show custom header
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeLogo={homeHeaderLogo}
          awayLogo={awayHeaderLogo}
          homeTeamId={homeTeamId}
          awayTeamId={awayTeamId}
          homeTeamCode={homeName}
          awayTeamCode={awayName}
          isNeutralSite={!!neutralSite}
          league={league}
        />
      ),
    });
  }, [navigation, isLoadingGame, neutralSite, homeName, awayName]);

  /* ---------------- Vote Team shaping ---------------- */

  if (isLoadingGame) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          headlineText={headlineText ?? ""}
          home={homeTeam}
          away={awayTeam}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          rankHome={homeRank}
          rankAway={awayRank}
          homeScore={displayHomeScore}
          awayScore={displayAwayScore}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          displayClock={displayClock}
          period={period}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          league={isWomen ? "wcbb" : "cbb"} // ✅ FIX
          gameStatusDescription={gameStatusDescription}
          gameStatusShortDescription={gameStatusDetail}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            {!isFinal && !isScheduled && (
              <LastPlay
                lastPlay={lastPlay}
                homeTeamId={homeEspnId}
                awayTeamId={awayEspnId}
              />
            )}

            {!isScheduled && (
              <LineScore
                linescore={lineScore}
                awayCode={awayName ?? ""}
                homeCode={homeName ?? ""}
                league={league} // ✅ FIX
                isDark={isDark}
              />
            )}

            {!isFinal && (
              <FanPredictionVote
                gameId={String(gameObj.id)}
                awayTeam={{
                  id: awayTeamId,
                  code: awayName,
                  logo: awayHeaderLogo,
                  color: awayTeam?.color,
                }}
                homeTeam={{
                  id: homeTeamId,
                  code: homeName,
                  logo: homeHeaderLogo,
                  color: homeTeam?.color,
                }}
              />
            )}

            {isScheduled && (
              <MatchupPredictor
                away={{
                  name: awayTeam?.code,
                  logo: awayLogo,
                  chance: awayChance,
                }}
                home={{
                  name: homeTeam?.code,
                  logo: homeLogo,
                  color: isDark ? homeTeam?.secondaryColor : homeTeam?.color,
                  chance: homeChance,
                }}
                size={180}
                isDark={isDark}
              />
            )}

            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              league={detailsLeague}
              gameStatusDescription={gameStatusDescription}
              isDark={isDark}
            />

            {isHalftime && inProgress && (
              <PlayersInFoulTrouble
                homeId={String(homeEspnId)}
                homeCode={homeName}
                homeLogo={homeLogo}
                awayId={String(awayEspnId)}
                awayCode={awayName}
                awayLogo={awayLogo}
                homePlayers={homeFoulPlayers}
                awayPlayers={awayFoulPlayers}
                league={league}
                isDark={isDark}
              />
            )}

            {(isHalftime || inProgress || isFinal) && (
              <ShotChart
                plays={plays}
                homeTeamId={String(homeEspnId)}
                awayTeamId={String(awayEspnId)}
                neutralSite={neutralSite}
                league={league}
              />
            )}

            {(isHalftime || inProgress || isFinal) && (
              <GameSummary
                plays={plays ?? []}
                league={league}
                isDark={isDark}
              />
            )}

            <GameTeamStats
              stats={teamStats}
              gameStatusDescription={gameStatusDescription}
              league={league}
              isDark={isDark}
            />

            {(isHalftime || inProgress || isFinal) && (
              <BoxScore
                playerStats={playerStats}
                awayTeamId={Number(awayEspnId)}
                homeTeamId={Number(homeEspnId)}
                league={league}
                isDark={isDark}
              />
            )}

            {(isHalftime || inProgress) && (
              <PlayersOnCourt
                playerStats={playerStats}
                awayTeamId={Number(awayEspnId)}
                homeTeamId={Number(homeEspnId)}
                league={league}
                isDark={isDark}
              />
            )}

            <LastFiveGames
              away={{
                teamId: awayTeamId,
                teamCode: awayName,
                games: awayLastGames ?? [],
              }}
              home={{
                teamId: homeTeamId ?? "",
                teamCode: homeName,
                games: homeLastGames ?? [],
              }}
              isDark={isDark}
              league={league}
            />

            {highlights?.length > 0 && (
              <HighlightVideoList highlights={highlights} isDark={isDark} />
            )}

            <Officials
              officials={officials ?? []}
              loading={false}
              error={null}
              isDark={isDark}
            />

            <GameLocation
              venueImage={venueImage}
              venueName={venueName}
              location={venueLocation}
              address={venueAddress}
              venueCapacity={venueCapacity}
              venueAttendance={venueAttendance}
              loading={false}
              error={null}
              weather={weather}
              isDark={isDark}
            />
          </View>
        )}
      </ScrollView>

      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={String(gameObj.id)} />
      </Animated.View>
    </>
  );
}
