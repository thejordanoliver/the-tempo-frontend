import { CustomHeader } from "@/components/CustomHeader";
import TeamInjuries from "@/components/Sports/Baseball/GameDetails/InjuryReport/TeamInjuries";
import {
  FanPredictionVote,
  GameLocation,
  GameTeamStats,
  HighlightVideoList,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
} from "@/components/Sports/Basketball/GameDetails";
import GameLiveChatOverlay from "@/components/Sports/Basketball/GameDetails/GameChat/GameLiveChatOverlay";
import GameLeaders from "@/components/Sports/Football/GameDetails/GameLeaders";
import PlayByPlayField from "@/components/Sports/Football/GameDetails/PlayByPlayField";
import TeamDrives from "@/components/Sports/Football/GameDetails/TeamDrives";
import TeamScoringSummary from "@/components/Sports/Football/GameDetails/TeamScoringSummary";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { useFootballGameDetails } from "@/hooks/FootballHooks/useFootballGameDetails";
import { useVenue } from "@/hooks/useVenue";
import { FootballGameCardProps } from "@/types/football/football";
import { formatPeriod, formatVenueAddress } from "@/utils/games";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import NFLGameHeader from "components/Sports/Football/GameDetails/GameHeader";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLastFiveGames } from "hooks/FootballHooks/useLastFiveGames";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeather } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import {
  formatDate,
  formatTime,
  getFootballSeason,
  getHolidayLabel,
  safeDate,
  shouldShowGameChat,
} from "utils/dateUtils";

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

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game?.date]);

  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const showGameChat = shouldShowGameChat(gameDateObj);
  const holidayLabel = getHolidayLabel(gameDate);

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

  const homeEspnId = homeTeam?.espnId ?? 0;
  const awayEspnId = awayTeam?.espnId ?? 0;

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
  const awayColor = useMemo(() => awayTeam?.color ?? "", [awayTeam?.color]);
  const homeColor = useMemo(() => homeTeam?.color ?? "", [homeTeam?.color]);
  const homeLastGames = useLastFiveGames(homeId, LEAGUE, currentSeason);
  const awayLastGames = useLastFiveGames(awayId, LEAGUE, currentSeason);
  const { score, details } = useFootballGameDetails(LEAGUE, gameId);

  const isLoading = !score || !details || !homeLastGames || !awayLastGames;

  const state = score?.status.state ?? "pre";
  const gameStatusDescription = score?.status.gameStatusDescription ?? "";
  const gameStatusDetail = score?.status.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isDelayed || isCanceled || isPostponed || isSuspended || isForfeited;
  const clock = score?.status.displayClock ?? "0:00";
  const period = formatPeriod({ period: score?.status.period });

  const redzone = score?.possession?.isRedZone;
  const headline = details?.headline ?? holidayLabel;
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
  const homeRecord = score?.home.record;
  const awayRecord = score?.away.record;
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const homeScore = score?.home.score ?? 0;
  const awayScore = score?.away.score ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isTie = homeScore === awayScore;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;
  const homeRank = score?.home?.rank;
  const awayRank = score?.away?.rank;
  const lastPlay = score?.lastPlay ?? "";
  const officials = details?.officials ?? [];
  const highlights = details?.highlights;
  const injuries = details?.injuries ?? [];
  const leaders = score?.leaders;
  const teamStats = score?.teamStats ?? [];
  const neutralSite = details?.neutralSite;
  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue({ sport: "football", id: venueId });
  const { weather } = useWeather({
    lat: Number(venue?.latitude),
    lon: Number(venue?.longitude),
    location: venue?.city,
    date: gameDateObj,
  });
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);

  const venueName = venue?.name ?? baseVenue?.fullName ?? null;
  const venueAddress = venue?.address ?? baseVenueAddress;
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image ?? baseVenue?.images?.[0]?.href ?? null;

  const venueAttendance = game?.attendance ?? null;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;

  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  useLayoutEffect(() => {
    if (isLoading || !game || !home || !away) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Game"
          onBack={goBack}
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
          awayScore={awayScore}
          homeScore={homeScore}
          homeWins={homeWins}
          awayWins={awayWins}
          isTie={isTie}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          homePossesion={homeHasPossesion}
          awayPossesion={awayHasPossesion}
          clock={clock}
          period={period}
          downDistance={downDistance}
          isDark={isDark}
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
            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              isDark={isDark}
              state={state}
              league={LEAGUE}
            />

            <PlayByPlayField
              lastPlay={lastPlay}
              firstDownYardLine={undefined}
              possessionTeamId={possessionTeamId}
              homeTeamId={homeId}
              awayTeamId={awayId}
              state={state}
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
              state={state}
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
              state={state}
            />

            <GameTeamStats
              stats={teamStats}
              awayName={awayCode}
              awayLogo={awayLogo}
              awayColor={awayColor}
              homeName={homeCode}
              homeLogo={homeLogo}
              homeColor={homeColor}
              league={LEAGUE}
              state={state}
              isDark={isDark}
            />

            <GameLeaders
              leaders={leaders}
              awayId={awayId}
              homeId={homeId}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayCode={awayCode}
              homeCode={homeCode}
              isDark={isDark}
              state={state}
              league={LEAGUE}
            />

            <TeamDrives
              previousDrives={previousDrives ?? []}
              currentDrives={currentDrives ?? []}
              awayId={awayId}
              homeId={homeId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              league={LEAGUE}
              isDark={isDark}
              state={state}
            />

            <TeamScoringSummary
              scoringPlays={scoringPlays}
              homeId={homeId}
              awayId={awayId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              isDark={isDark}
              state={state}
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
              state={state}
              league={LEAGUE}
            />

            <HighlightVideoList highlights={highlights} isDark={isDark} />

            <TeamInjuries
              injuries={injuries}
              homeId={homeEspnId}
              awayId={awayEspnId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              isDark={isDark}
              state={state}
              league={LEAGUE}
            />

            <Officials officials={officials} isDark={isDark} state={state} />

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

      {!dontShowDetails && showGameChat && (
        <GameLiveChatOverlay
          gameId={String(gameId)}
          opacityAnim={opacityAnim}
          state={state}
        />
      )}
    </>
  );
}
