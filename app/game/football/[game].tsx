import GameLeaders from "@/components/Sports/Football/GameDetails/GameLeaders";
import TeamDrives from "@/components/Sports/Football/GameDetails/InjuryReport/TeamDrives";
import TeamInjuries from "@/components/Sports/Football/GameDetails/InjuryReport/TeamInjuries";
import PlayByPlayField from "@/components/Sports/Football/GameDetails/PlayByPlayField";
import TeamScoringSummary from "@/components/Sports/Football/GameDetails/TeamScoringSummary";
import {
  FanPredictionVote,
  GameLocation,
  HighlightVideoList,
  LastFiveGames,
  LineScore,
  Officials,
} from "@/components/Sports/NBA/GameDetails";
import GameLiveChatOverlay from "@/components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { useFootballGameDetails } from "@/hooks/FootballHooks/useFootballGameDetails";
import { formatVenueAddress } from "@/utils/games";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import NFLGameHeader from "components/Sports/Football/GameDetails/GameHeader";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { router, useLocalSearchParams } from "expo-router";
import { useLastFiveGames } from "hooks/FootballHooks/useLastFiveGames";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { FootballGameCardProps } from "types/football";
import { getFootballSeason, getHolidayLabel } from "utils/dateUtils";
import { getVenue } from "../../../constants/venues";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type FootballGame = FootballGameCardProps["game"];

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

function parseGameParam(value?: string | string[]): FootballGame | undefined {
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
    return JSON.parse(decodedValue) as FootballGame;
  } catch {
    return undefined;
  }
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export default function GameDetailsScreen(
  props: Partial<FootballGameCardProps> = {},
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

  const currentSeason = getFootballSeason();
  const LEAGUE = game?.league?.code ?? "nfl";
  const isCFB = LEAGUE === "cfb";
  const isUFL = LEAGUE === "ufl";
  const gameDateObj = game?.date ? new Date(game.date) : null;
  const gameId = game?.id ?? 0;

  const home = game?.home;
  const away = game?.away;

  const homeId = home?.id ?? 0;
  const awayId = away?.id ?? 0;

  const homeTeam = isUFL
    ? getUFLTeam(homeId)
    : isCFB
      ? getCFBTeam(homeId)
      : getNFLTeam(homeId);

  const awayTeam = isUFL
    ? getUFLTeam(awayId)
    : isCFB
      ? getCFBTeam(awayId)
      : getNFLTeam(awayId);

  const homeEspnId = homeTeam?.espnId;
  const awayEspnId = awayTeam?.espnId;

  const homeLogo = isUFL
    ? getUFLTeamLogo(homeId, isDark)
    : isCFB
      ? getCFBTeamLogo(homeId, isDark)
      : getNFLTeamLogo(homeId, isDark);

  const awayLogo = isUFL
    ? getUFLTeamLogo(awayId, isDark)
    : isCFB
      ? getCFBTeamLogo(awayId, isDark)
      : getNFLTeamLogo(awayId, isDark);

  const homeHeaderLogo = isUFL
    ? getUFLTeamLogo(homeId, true)
    : isCFB
      ? getCFBTeamLogo(homeId, true)
      : getNFLTeamLogo(homeId, true);

  const awayHeaderLogo = isUFL
    ? getUFLTeamLogo(awayId, true)
    : isCFB
      ? getCFBTeamLogo(awayId, true)
      : getNFLTeamLogo(awayId, true);

  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);
  const awayColor = useMemo(() => awayTeam?.color, [awayTeam?.color]);
  const homeColor = useMemo(() => homeTeam?.color, [homeTeam?.color]);

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

  const homeLastGames = useLastFiveGames(homeId, LEAGUE, currentSeason);
  const awayLastGames = useLastFiveGames(awayId, LEAGUE, currentSeason);
  const { score, playersByCategory, details } = useFootballGameDetails(
    LEAGUE,
    gameId,
  );

  const isLoading = !score || !details || !homeLastGames || !awayLastGames;
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isCanceled || isDelayed || isPostponed || isForfeited;
  const clock = score?.displayClock ?? "0:00";
  const period = score?.period;
  const redzone = score?.possession?.isRedZone;
  const headlineText = details?.headline;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel;
  const broadcast = details?.broadcast ?? "";
  const currentDrives = score?.drives?.current;
  const previousDrives = score?.drives?.previous;
  const scoringPlays = score?.scoringPlays;
  const downDistance = score?.possession.downDistanceText;
  const possessionTeamId = score?.possession.teamId;
  const homeHasPossesion = possessionTeamId === home?.espnId;
  const awayHasPossesion = possessionTeamId === away?.espnId;
  const homeTimeouts = score?.possession.homeTimeouts;
  const awayTimeouts = score?.possession.awayTimeouts;
  const homeRecord = details?.records?.home?.overall;
  const awayRecord = details?.records?.away?.overall;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;
  const homeRank = home?.rank;
  const awayRank = away?.rank;
  const lastPlay = score?.lastPlay ?? "";
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];

  const neutralSite = details?.neutralSite;
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venue = getVenue(baseVenue?.fullName);
  const venueName = venue?.name || baseVenue?.fullName;
  const venueAddress = venue?.address || homeTeam?.address || baseVenueAddress;
  const venueCapacity = venue?.venueCapacity || homeTeam?.venueCapacity || null;
  const venueImage =
    venue?.venueImage || homeTeam?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = venue?.city || homeTeam?.city;
  const venueLat = venue?.latitude || homeTeam?.latitude || null;
  const venueLon = venue?.longitude || homeTeam?.longitude || null;
  const venueAttendance = baseVenue?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, formattedDate);

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
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <NFLGameHeader
          headline={headline}
          homeId={homeId}
          awayId={awayId}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeName={homeCode}
          awayName={awayCode}
          homeRank={homeRank}
          awayRank={awayRank}
          homePossesion={homeHasPossesion}
          awayPossesion={awayHasPossesion}
          awayScore={awayScore}
          homeScore={homeScore}
          homeWins={homeWins}
          awayWins={awayWins}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          clock={clock}
          period={period}
          downDistance={downDistance}
          isDark={isDark}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          broadcast={broadcast}
          date={formattedDate}
          time={formattedTime}
          gameStatusShortDetail={gameStatusDetail}
          gameStatusDescription={gameStatusDescription}
          redzone={redzone}
          league={LEAGUE}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
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
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
              league={LEAGUE}
            />

            <PlayByPlayField
              lastPlay={lastPlay}
              firstDownYardLine={undefined}
              possessionTeamId={possessionTeamId}
              homeTeamId={Number(homeTeam.id)}
              awayTeamId={Number(awayTeam.id)}
              gameStatusDescription={gameStatusDescription}
            />

            <GameLeaders
              playersByCategory={playersByCategory}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayCode={awayCode}
              homeCode={homeCode}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <TeamDrives
              previousDrives={previousDrives ?? []}
              currentDrives={currentDrives ?? []}
              awayTeamId={awayId}
              homeTeamId={homeId}
              awayTeamEspnId={awayEspnId}
              homeTeamEspnId={homeEspnId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              league={LEAGUE}
              isDark={isDark}
              gameStatusDescription={score?.gameStatusDescription ?? ""}
            />

            <TeamScoringSummary
              scoringPlays={scoringPlays ?? []}
              homeTeamId={Number(homeTeam?.espnId)}
              awayTeamId={Number(awayTeam?.espnId)}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
              league={LEAGUE}
            />

            <LastFiveGames
              home={{
                teamId: homeId,
                teamCode: homeCode,
                games: homeLastGames.games,
              }}
              away={{
                teamId: awayId,
                teamCode: awayCode,
                games: awayLastGames.games,
              }}
              isDark={isDark}
              league={LEAGUE.toUpperCase()}
              gameStatusDescription={gameStatusDescription}
            />

            <HighlightVideoList highlights={highlights} isDark={isDark} />

            <TeamInjuries
              injuries={details?.injuries}
              loading={false}
              error={null}
              awayTeamId={awayTeam.espnId}
              homeTeamId={homeTeam.espnId}
              awayTeamAbbr={awayTeam.code}
              homeTeamAbbr={homeTeam.code}
              isDark
            />

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
              grass={baseVenue?.grass}
              surface={"football"}
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
