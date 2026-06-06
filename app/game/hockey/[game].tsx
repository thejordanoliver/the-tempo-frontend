import { useHockeyGameDetails } from "@/hooks/HockeyHooks/useHockeyGameDetails";
import { HockeyGameCardProps } from "@/types/hockey";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LastPlay from "components/Sports/Baseball/GameDetails/LastPlay";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import GameLiveChatOverlay from "components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameHeader from "components/Sports/NHL/GameDetails/GameHeader";
import GameSummary from "components/Sports/NHL/GameDetails/GameSummary";
import NHLInjuries from "components/Sports/NHL/GameDetails/NHLInjuries";
import ShotChart from "components/Sports/NHL/GameDetails/ShotChart";
import { getNeutralVenue } from "constants/neutralVenues";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { usePreferences } from "contexts/PreferencesContext";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { formatVenueAddress } from "utils/CBBUtils/cbbGameUtils";
import { getBroadcastDisplay } from "utils/games";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type HockeyGame = HockeyGameCardProps["game"];

function getFirstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseGameParam(value?: string | string[]): HockeyGame | undefined {
  const rawValue = getFirstParam(value);

  if (!rawValue || rawValue === "undefined" || rawValue === "null") {
    return undefined;
  }

  const decodedValue = safeDecode(rawValue).trim();

  // Dynamic route params are often just the game id.
  // Only JSON strings should be parsed into a full game object.
  if (!decodedValue.startsWith("{")) {
    return undefined;
  }

  try {
    return JSON.parse(decodedValue) as HockeyGame;
  } catch {
    return undefined;
  }
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export default function GameDetailsScreen(
  props: Partial<HockeyGameCardProps> = {},
) {
  const styles = gameDetailsScreenStyles;
  const params = useLocalSearchParams<RouteParams>();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  const game = useMemo(() => {
    return (
      props.game ?? parseGameParam(params.data) ?? parseGameParam(params.game)
    );
  }, [params.data, params.game, props.game]);

  const leagueId = Number(
    getFirstParam(params.leagueId) ??
      getFirstParam(params.league) ??
      game?.league?.id ??
      0,
  );

  const gameDateObj = game?.date ? new Date(game.date) : null;

  const formattedDate =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })
      : "TBD";

  const formattedTime =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "TBD";

  const LEAGUE = game?.league?.code ?? "nhl";
  const isNHL = leagueId === 90;
  const isMCH = leagueId === 91;
  const gameId = game?.id;

  const home = game?.home;
  const away = game?.away;

  const homeId = Number(home?.id ?? 0);
  const awayId = Number(away?.id ?? 0);
  const homeTeam = getNHLTeam(home?.id ?? 0) ?? null;
  const awayTeam = getNHLTeam(away?.id ?? 0) ?? null;

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const homeLogo = getNHLTeamLogo(homeId, isDark);
  const awayLogo = getNHLTeamLogo(awayId, isDark);
  const homeHeaderLogo = getNHLTeamLogo(homeId, true);
  const awayHeaderLogo = getNHLTeamLogo(awayId, true);
  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);

  const awayColor = useMemo(() => awayTeam?.color, [awayTeam?.color]);
  const homeColor = useMemo(() => homeTeam?.color, [homeTeam?.color]);

  const { details, score } = useHockeyGameDetails(LEAGUE, gameId);

  const isLoading = !score || !details;
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const plays = score?.plays;
  const lastPlay = score?.lastPlay;
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headline = details?.headline ?? "";
  const broadcast = getBroadcastDisplay(details?.broadcasts);
  const period = score?.period ?? "";
  const clock = score?.displayClock ?? "0:00";
  const homeScore = score?.home?.total ?? 0;
  const awayScore = score?.away?.total ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const homeRecord = details?.records?.home.overall ?? "0-0";
  const awayRecord = details?.records?.away.overall ?? "0-0";
  const homeTimeouts = score?.timeouts?.home ?? 0;
  const awayTimeouts = score?.timeouts?.away ?? 0;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const neutralSite = details?.neutralSite;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address || baseVenueAddress;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images?.[0]?.href
    : homeTeam?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);

  const { weather } = useWeatherForecast(venueLat, venueLon, "");

  useLayoutEffect(() => {
    if (isLoading || !game || !home || !away) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={() => router.back()}
          homeLogo={homeHeaderLogo}
          awayLogo={awayHeaderLogo}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          homeColor={homeColor}
          awayColor={awayColor}
          isNeutralSite={neutralSite}
        />
      ),
    });
  }, [
    LEAGUE,
    away,
    awayId,
    awayCode,
    game,
    awayHeaderLogo,
    homeHeaderLogo,
    home,
    homeId,
    homeCode,
    awayColor,
    homeColor,
    isLoading,
    navigation,
    neutralSite,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (!game || !homeTeam || !awayTeam) return <View />;

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
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
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
              gameStatusDescription={gameStatusDescription}
            />

            <FanPredictionVote
              gameId={String(gameId)}
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

            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <ShotChart
              plays={plays}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
              isDark={isDark}
            />

            <GameSummary plays={plays ?? []} isDark={isDark} />

            <NHLInjuries
              injuries={injuries}
              loading={isLoading}
              error={null}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
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
              venueAttendance={undefined}
              weather={weather}
              isDark={isDark}
            />
          </View>
        )}
      </ScrollView>

      <GameLiveChatOverlay
        gameId={String(game.id)}
        opacityAnim={opacityAnim}
        gameStatusDescription={gameStatusDescription}
      />
    </>
  );
}
