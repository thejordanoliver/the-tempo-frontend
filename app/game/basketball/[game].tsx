import BoxScore from "@/components/Sports/Basketball/GameDetails/BoxScore";
import GameLeaders from "@/components/Sports/Basketball/GameDetails/GameLeaders";
import GameTeamStats from "@/components/Sports/Basketball/GameDetails/GameTeamStats";
import PlayersOnCourt from "@/components/Sports/Basketball/GameDetails/PlayersOnCourt";
import { getWNBATeam, getWNBATeamLogo } from "@/constants/teamsWNBA";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  GameHeader,
  GameLocation,
  LastPlay,
  LineScore,
  TeamInjuries,
} from "components/Sports/NBA/GameDetails";

import { useLastFiveGames } from "@/hooks/BasketballHooks/useLastFiveGames";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import GameLiveChatOverlay from "components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import GameSummary from "components/Sports/NBA/GameDetails/GameSummary";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import PlayersInFoulTrouble from "components/Sports/NBA/GameDetails/PlayersInFoulTrouble";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import { getNeutralVenue } from "constants/neutralVenues";
import { Colors } from "constants/styles";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import type { BasketballGame } from "types/basketball";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter, getBroadcastDisplay } from "utils/games";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseGameDate(raw: unknown) {
  if (!raw) return new Date();

  const parsed =
    typeof raw === "number" ? new Date(raw * 1000) : new Date(String(raw));

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  /* ---------------- Parse Game ---------------- */

  const gameObj: BasketballGame | null = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch (e) {
      console.warn("Failed to parse game param", e);
      return null;
    }
  }, [game]);

  const isWCBB =
    String(gameObj?.league?.id) === "423" ||
    gameObj?.league?.name === "Women's College Basketball";

  const isWNBA =
    String(gameObj?.league?.id) === "13" || gameObj?.league?.name === "WNBA";

  const LEAGUE = isWNBA ? "WNBA" : isWCBB ? "WCBB" : "CBB";
  const homeId = gameObj?.teams?.home?.id ?? 0;
  const awayId = gameObj?.teams?.away?.id ?? 0;
  const home = isWNBA ? getWNBATeam(homeId) : getCBBTeam(homeId, isWCBB);
  const away = isWNBA ? getWNBATeam(awayId) : getCBBTeam(awayId, isWCBB);
  const homeCode = home?.code ?? gameObj?.teams?.home.name ?? "";
  const awayCode = away?.code ?? gameObj?.teams?.away.name ?? "";
  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;
  const awayName = away?.fullName ?? "";
  const homeName = home?.fullName ?? "";
  const awayColor = away?.color ?? Colors.midTone;
  const homeColor = home?.color ?? Colors.midTone;

  const homeLogo = isWNBA
    ? getWNBATeamLogo(homeId, isDark)
    : getCBBTeamLogo(homeId, isDark, isWCBB);
  const awayLogo = isWNBA
    ? getWNBATeamLogo(awayId, isDark)
    : getCBBTeamLogo(awayId, isDark, isWCBB);
  const homeHeaderLogo = isWNBA
    ? getWNBATeamLogo(homeId, true)
    : getCBBTeamLogo(homeId, true, isWCBB);
  const awayHeaderLogo = isWNBA
    ? getWNBATeamLogo(awayId, true)
    : getCBBTeamLogo(awayId, true, isWCBB);

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
  const detailsLeague = isWNBA ? "wnba" : isWCBB ? "wcbb" : "cbb";

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    homeEspnId ? String(homeEspnId) : undefined,
    awayEspnId ? String(awayEspnId) : undefined,
    gameObj ? gameDateYMD : undefined,
  );

  const isLoadingGame =
    !liveScore ||
    !details ||
    liveScore.home?.total == null ||
    liveScore.away?.total == null;

  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const period = formatQuarter(liveScore?.period ?? 0, isWCBB);
  const clock = liveScore?.displayClock ?? "0:00";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;
  const plays = liveScore?.plays ?? [];
  const highlights = details?.highlights ?? [];
  const injuries = details?.injuries ?? [];
  const officials = details?.officials ?? [];
  const leaders = liveScore?.leaders ?? [];
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const lastPlay = liveScore?.lastPlay ?? "";
  const headlineText = details?.headline;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const broadcast = getBroadcastDisplay(details?.broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

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

  // Pass `isWCBB` flag to useLastFiveGames
  const { games: homeLastGames } = useLastFiveGames(homeId, isWCBB);
  const { games: awayLastGames } = useLastFiveGames(awayId, isWCBB);

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const neutralSite = details?.neutralSite;
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const baseVenueAddress = baseVenue?.address;
  const baseVenueAddressDisplay = [
    baseVenueAddress?.city,
    baseVenueAddress?.state,
    baseVenueAddress?.zipCode,
    baseVenueAddress?.country,
  ]
    .filter(Boolean)
    .join(" ");
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : home?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : home?.address || baseVenueAddressDisplay;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : home?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images?.[0]?.href
    : home?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : home?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? null)
    : (home?.latitude ?? null);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? null)
    : (home?.longitude ?? null);
  const venueAttendance = details?.attendance || null;
  const { weather } = useWeatherForecast(
    venueLat,
    venueLon,
    gameObj ? gameDateISO : null,
  );

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const homeTeamPlayersData = useRoster(homeId, LEAGUE);
  const awayTeamPlayersData = useRoster(awayId, LEAGUE);

  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

  useLayoutEffect(() => {
    if (isLoadingGame || !home || !away) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeLogo={homeHeaderLogo}
          awayLogo={awayHeaderLogo}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          homeColor={homeColor}
          awayColor={awayColor}
          isNeutralSite={!!neutralSite}
          league={LEAGUE}
        />
      ),
    });
  }, [
    LEAGUE,
    awayCode,
    awayColor,
    awayHeaderLogo,
    away,
    awayId,
    homeCode,
    homeColor,
    homeHeaderLogo,
    home,
    homeId,
    isLoadingGame,
    navigation,
    neutralSite,
  ]);

  /* ---------------- Vote Team shaping ---------------- */

  if (!gameObj) return null;

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
          headline={headline}
          homeId={homeId}
          awayId={awayId}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeName={homeCode}
          awayName={awayCode}
          homeScore={homeScore}
          awayScore={awayScore}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeRank={homeRank}
          awayRank={awayRank}
          homeWins={homeWins}
          awayWins={awayWins}
          clock={clock}
          period={period}
          date={formattedDate}
          time={formattedTime}
          broadcast={broadcast}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
          isDark={isDark}
          league={LEAGUE}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            <LastPlay
              lastPlay={lastPlay}
              homeTeamId={homeId}
              awayTeamId={awayId}
              gameStatusDescription={gameStatusDescription}
              league={LEAGUE}
            />

            <LineScore
              linescore={lineScore}
              awayCode={awayCode}
              homeCode={homeCode}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <FanPredictionVote
              gameId={String(gameObj.id)}
              awayId={awayId}
              awayCode={awayCode}
              awayLogo={awayHeaderLogo}
              awayColor={awayColor}
              homeId={homeId}
              homeCode={homeCode}
              homeLogo={homeHeaderLogo}
              homeColor={homeColor}
              gameStatusDescription={gameStatusDescription}
            />

            <MatchupPredictor
              homeCode={homeCode}
              homeLogo={homeLogo}
              homeChance={homeChance}
              homeColor={homeColor}
              awayCode={awayCode}
              awayLogo={awayLogo}
              awayChance={awayChance}
              awayColor={awayColor}
              size={180}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <GameLeaders
              leaders={leaders}
              homeCode={homeCode}
              homeLogo={homeLogo}
              awayCode={awayCode}
              awayLogo={awayLogo}
              homeTeamId={Number(homeEspnId)}
              awayTeamId={Number(awayEspnId)}
              league={detailsLeague}
              gameStatusDescription={gameStatusDescription}
              isDark={isDark}
            />

            <PlayersInFoulTrouble
              awayId={String(awayEspnId)}
              awayCode={awayCode}
              awayLogo={awayLogo}
              awayPlayers={awayFoulPlayers}
              homeId={String(homeEspnId)}
              homeCode={homeCode}
              homeLogo={homeLogo}
              homePlayers={homeFoulPlayers}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <ShotChart
              plays={plays}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
              neutralSite={neutralSite}
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <GameSummary
              plays={plays ?? []}
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <GameTeamStats
              stats={teamStats}
              awayName={awayCode}
              awayLogo={awayLogo}
              awayColor={awayColor}
              homeName={homeCode}
              homeLogo={homeLogo}
              homeColor={homeColor}
              gameStatusDescription={gameStatusDescription}
              isDark={isDark}
            />

            <BoxScore
              playerStats={playerStats}
              awayTeamId={Number(awayEspnId)}
              awayLogo={awayLogo}
              awayName={awayName}
              homeTeamId={Number(homeEspnId)}
              homeLogo={homeLogo}
              homeName={homeName}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <PlayersOnCourt
              playerStats={playerStats}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayCode={awayCode}
              homeCode={homeCode}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <LastFiveGames
              away={{
                teamId: awayId,
                teamCode: awayCode,
                games: awayLastGames,
              }}
              home={{
                teamId: homeId,
                teamCode: homeCode,
                games: homeLastGames,
              }}
              isDark={isDark}
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <TeamInjuries
              injuries={injuries}
              teamPlayersMap={teamPlayersMap}
              league={"WNBA"}
              isDark={isDark}
            />

            <HighlightVideoList highlights={highlights} isDark={isDark} />

            <Officials
              officials={officials}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <GameLocation
              venueImage={venueImage}
              venueName={venueName}
              location={venueLocation}
              address={venueAddress}
              venueCapacity={venueCapacity}
              venueAttendance={venueAttendance}
              weather={weather}
              isDark={isDark}
            />
          </View>
        )}
      </ScrollView>

      {!dontShowDetails && (
        <GameLiveChatOverlay
          gameId={String(gameObj.id)}
          opacityAnim={opacityAnim}
          gameStatusDescription={gameStatusDescription}
        />
      )}
    </>
  );
}
