import GameHeader from "@/components/Sports/Soccer/GameDetails/GameHeader";
import GameTeamStats from "@/components/Sports/Soccer/GameDetails/GameTeamStats";
import SoccerShotMap from "@/components/Sports/Soccer/GameDetails/SoccerField";
import SoccerKeyEvents from "@/components/Sports/Soccer/GameDetails/SoccerKeyEvents";
import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useSoccerGameDetails } from "@/hooks/SoccerHooks/useSoccerGameDetails";
import { useLiveVotes } from "@/hooks/useLiveVotes";
import { useVenue } from "@/hooks/useVenue";
import { SoccerGameCardProps } from "@/types/soccer/soccer";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
  shouldShowGameChat,
} from "@/utils/dateUtils";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import CustomActivityIndicator from "../../../components/CustomActivityIndicator";
import { CustomHeader } from "../../../components/CustomHeader";
import LastPlay from "../../../components/Sports/Baseball/GameDetails/LastPlay";
import {
  FanPrediction,
  GameLiveChatOverlay,
  GameLocation,
  Highlights,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
} from "../../../components/Sports/Basketball/GameDetails";
import { Colors } from "../../../constants/styles";
import { usePreferences } from "../../../contexts/PreferencesContext";
import { useScrollFade } from "../../../hooks/useScrollFade";
import { useWeather } from "../../../hooks/useWeather";
import { gameDetailsScreenStyles } from "../../../styles/GameDetailStyles/GameDetailsScreenStyles";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "../../../utils/games";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type SoccerGame = SoccerGameCardProps["game"];

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

function parseGameParam(value?: string | string[]): SoccerGame | undefined {
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
    return JSON.parse(decodedValue) as SoccerGame;
  } catch {
    return undefined;
  }
}

export default function GameDetailsScreen(
  props: Partial<SoccerGameCardProps> = {},
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

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game?.date]);

  const LEAGUE = game?.league?.code ?? "epl";
  const gameId = game?.id ?? 0;

  const { details, score } = useSoccerGameDetails(LEAGUE, gameId);
  const gameDate = safeDate(score?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);
  const showGameChat = shouldShowGameChat(gameDateObj);

  const home = score?.home;
  const away = score?.away;

  const homeId = Number(home?.id ?? 0);
  const awayId = Number(away?.id ?? 0);

  const homeTeam = getSOCCTeam(homeId);
  const awayTeam = getSOCCTeam(awayId);

  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);
  const awayColor = useMemo(
    () => awayTeam?.color ?? Colors.midTone,
    [awayTeam?.color],
  );
  const homeColor = useMemo(
    () => homeTeam?.color ?? Colors.midTone,
    [homeTeam?.color],
  );

  const isHomeNational = useMemo(
    () => homeTeam?.isNational,
    [homeTeam?.isNational],
  );
  const isHomeAllStar = useMemo(
    () => homeTeam?.isAllStar,
    [homeTeam?.isAllStar],
  );

  const isAwayNational = useMemo(
    () => awayTeam?.isNational,
    [awayTeam?.isNational],
  );
  const isAwayAllStar = useMemo(
    () => awayTeam?.isAllStar,
    [awayTeam?.isAllStar],
  );

  const homeLogo = getSOCCTeamLogo(homeId, isDark);
  const awayLogo = getSOCCTeamLogo(awayId, isDark);

  const homeHeaderLogo = getSOCCTeamLogo(homeId, true);
  const awayHeaderLogo = getSOCCTeamLogo(awayId, true);

  const { votes: liveVotes, castVote: castLiveVote } = useLiveVotes(gameId);
  const homeLastGames = useLastFiveGames(homeId, "soccer", LEAGUE).games;
  const awayLastGames = useLastFiveGames(awayId, "soccer", LEAGUE).games;

  const headline = details?.headline ?? holidayLabel;
  const isLoading = !score || !details || !homeLastGames || !awayLastGames;
  const broadcasts = getBroadcastDisplay(details?.broadcasts);
  const gameStatusDescription = score?.status.gameStatusDescription ?? "";
  const gameStatusDetail = score?.status.gameStatusDetail ?? "";
  const state = score?.status?.state ?? "";
  const homeScore = score?.home?.score ?? 0;
  const awayScore = score?.away?.score ?? 0;
  const homeRecord = home?.record ?? "0—0-0";
  const awayRecord = away?.record ?? "0—0-0";
  const homeWins = score?.home?.winner;
  const awayWins = score?.away?.winner;
  const isTie = awayWins === homeWins;
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isDelayed || isCanceled || isPostponed || isSuspended || isForfeited;
  const teamStats = score?.teamStats;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;
  const period = formatPeriod({ period: score?.status.period, isSOCC: true });
  const clock = score?.status.displayClock ?? "00'";
  const lastPlay = score?.lastPlay;
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const shotMap = score?.shotMap ?? [];
  const keyEvents = score?.keyEvents ?? [];
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const neutralSite = details?.neutralSite;
  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue({ sport: "soccer", id: venueId });
  const { weather } = useWeather({
    lat: Number(venue?.latitude),
    lon: Number(venue?.longitude),
    location: venue?.city,
    date: gameDateObj,
  });

  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName;
  const venueAddress = venue?.address ?? baseVenueAddress;
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image ?? baseVenue?.images[0]?.href;
  const venueAttendance = details?.attendance || null;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  useLayoutEffect(() => {
    if (isLoading || !score || !details || !home || !away) {
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
    details,
    score,
    away,
    awayId,
    awayCode,
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

  if (!score || !details || !homeTeam || !awayTeam) return <View />;

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
          // Game details
          headline={headline}
          league={LEAGUE}
          state={state}
          date={formattedDate}
          time={formattedTime}
          broadcast={broadcasts}
          isDark={isDark}
          // Away team
          awayId={awayId}
          awayName={awayCode}
          awayLogo={awayLogo}
          awayRank={null}
          awayScore={awayScore}
          awayRecord={awayRecord}
          awayWins={awayWins}
          isAwayAllStar={isAwayAllStar}
          isAwayNational={isAwayNational}
          // Home team
          homeId={homeId}
          homeName={homeCode}
          homeLogo={homeLogo}
          homeRank={null}
          homeScore={homeScore}
          homeRecord={homeRecord}
          homeWins={homeWins}
          isHomeAllStar={isHomeAllStar}
          isHomeNational={isHomeNational}
          // Live game state
          clock={clock}
          period={period}
          isTie={isTie}
          // Status
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            <LastPlay
              lastPlay={lastPlay}
              homeId={homeId}
              awayId={awayId}
              state={state}
              league={LEAGUE}
            />

            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              isDark={isDark}
              state={state}
              league={"soccer"}
            />

            <FanPrediction
              votes={liveVotes}
              castVote={castLiveVote}
              gameId={gameId}
              awayId={awayId}
              awayCode={awayCode}
              awayLogo={awayLogo}
              awayColor={awayColor}
              homeId={homeId}
              homeCode={homeCode}
              homeLogo={homeLogo}
              homeColor={homeColor}
              state={state}
            />

            <MatchupPredictor
              homeId={homeId}
              homeCode={homeCode}
              homeLogo={homeLogo}
              homeHeaderLogo={homeHeaderLogo}
              homeChance={homeChance}
              homeColor={homeColor}
              awayId={awayId}
              awayCode={awayCode}
              awayLogo={awayLogo}
              awayHeaderLogo={awayHeaderLogo}
              awayChance={awayChance}
              awayColor={awayColor}
              size={180}
              isDark={isDark}
              state={state}
            />

            <GameTeamStats
              stats={teamStats}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              homeCode={homeCode}
              awayCode={awayCode}
              awayColor={awayColor}
              homeColor={homeColor}
              isDark={isDark}
              state={state}
            />

            <SoccerShotMap
              shots={shotMap}
              awayId={awayId}
              homeId={homeId}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              homeCode={homeCode}
              awayCode={awayCode}
              awayColor={awayColor}
              homeColor={homeColor}
              isDark={isDark}
              state={state}
            />

            <SoccerKeyEvents
              keyEvents={keyEvents}
              awayId={awayId}
              homeId={homeId}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayCode={awayCode}
              homeCode={homeCode}
              isDark={isDark}
              gameStatusDescription={gameStatusDescription}
            />

            <Highlights highlights={highlights} isDark={isDark} />

            <Officials
              officials={officials ?? []}
              isDark={isDark}
              state={state}
            />

            <LastFiveGames
              homeId={homeId}
              awayId={awayId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeGames={homeLastGames}
              awayGames={awayLastGames}
              league={"soccer"}
              state={state}
              isDark={isDark}
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
