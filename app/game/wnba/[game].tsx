import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/CBB/GameDetails/GameTeamStats";
import LastPlay from "components/Sports/CBB/GameDetails/LastPlay";
import PlayersOnCourt from "components/Sports/CBB/GameDetails/PlayersOnCourt";
import {
  GameLocation,
  GameOddsSection,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import GameLiveChatOverlay from "components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import PlayersInFoulTrouble from "components/Sports/NBA/GameDetails/PlayersInFoulTrouble";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import GameHeader from "components/Sports/WNBA/GameDetails/GameHeader";
import { getNeutralVenue } from "constants/teamsCBB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLastFiveGames } from "hooks/WNBAHooks/useLastFiveGames";
import React, { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { BasketballGame } from "types/basketball";
import { getBroadcastDisplay } from "utils/matchBroadcast";

function parseGameDate(raw: any) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw * 1000);
  return new Date(raw);
}
const LEAGUE = "WNBA";

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

  /* ---------------- Teams ---------------- */

  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);

  const homeTeam = getWNBATeam(homeTeamId);
  const awayTeam = getWNBATeam(awayTeamId);

  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);

  const homeLogo = getWNBATeamLogo(homeTeamId, isDark);
  const awayLogo = getWNBATeamLogo(awayTeamId, isDark);

  const homeName = homeTeam?.code;
  const awayName = awayTeam?.code;

  const homeHeaderLogo = getWNBATeamLogo(homeTeamId, true);
  const awayHeaderLogo = getWNBATeamLogo(awayTeamId, true);

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

  const { score: liveScore, details } = useGameDetails(
    "wnba",
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

  // Pass `` flag to useLastFiveGames
  const { games: homeLastGames } = useLastFiveGames(homeTeamId);
  const { games: awayLastGames } = useLastFiveGames(awayTeamId);

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

  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;
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
          league={LEAGUE}
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
          homeScore={homeScore}
          awayScore={awayScore}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          displayClock={displayClock}
          period={period}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          gameStatusDescription={gameStatusDescription}
          gameStatusShortDescription={gameStatusDetail}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            <LastPlay
              lastPlay={lastPlay}
              homeTeamId={homeEspnId}
              awayTeamId={awayEspnId}
              gameStatusDescription={gameStatusDescription}
            />

            <LineScore
              linescore={lineScore}
              awayCode={awayName}
              homeCode={homeName}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

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
              gameStatusDescription={gameStatusDescription}
            />

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
              gameStatusDescription={gameStatusDescription}
            />

            <GameOddsSection
              date={gameDateISO ?? ""}
              gameDate={formattedDate}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              league={"wnba"}
              gameStatusDescription={gameStatusDescription}
              isDark={isDark}
            />

            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              league={"wnba"}
              gameStatusDescription={gameStatusDescription}
              isDark={isDark}
            />

            <PlayersInFoulTrouble
              homeId={String(homeEspnId)}
              homeCode={homeName}
              homeLogo={homeLogo}
              awayId={String(awayEspnId)}
              awayCode={awayName}
              awayLogo={awayLogo}
              homePlayers={homeFoulPlayers}
              awayPlayers={awayFoulPlayers}
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

            <GameTeamStats
              stats={teamStats}
              gameStatusDescription={gameStatusDescription}
              league={LEAGUE}
              isDark={isDark}
            />

            <BoxScore
              playerStats={playerStats}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <PlayersOnCourt
              playerStats={playerStats}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

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
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <HighlightVideoList highlights={highlights} isDark={isDark} />

            <Officials
              officials={officials ?? []}
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

      {!dontShowDetails && !isFinal && (
        <GameLiveChatOverlay
          gameId={String(gameObj.id)}
          opacityAnim={opacityAnim}
        />
      )}
    </>
  );
}
