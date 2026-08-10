import GameHeader from "@/components/Sports/Soccer/GameDetails/GameHeader";
import GameTeamStats from "@/components/Sports/Soccer/GameDetails/GameTeamStats";
import SoccerShotMap from "@/components/Sports/Soccer/GameDetails/SoccerField";
import SoccerKeyEvents from "@/components/Sports/Soccer/GameDetails/SoccerKeyEvents";
import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useSoccerGameDetails } from "@/hooks/SoccerHooks/useSoccerGameDetails";
import { useVenue } from "@/hooks/useVenue";
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
  FanPredictionVote,
  GameLiveChatOverlay,
  GameLocation,
  Highlights,
  LastFiveGames,
  LineScore,
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

function getFirstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const params = useLocalSearchParams<RouteParams>();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  const routeGameId = getFirstParam(params.game);
  const routeLeague =
    getFirstParam(params.league) ?? getFirstParam(params.leagueId);

  const gameId = routeGameId ?? "";
  const LEAGUE = routeLeague ?? "epl";

  const { details, score } = useSoccerGameDetails(LEAGUE, gameId);

  const gameDateObj = useMemo(() => {
    return score?.date ? new Date(score?.date) : null;
  }, [score?.date]);

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

  const homeLastGames = useLastFiveGames(homeId, "soccer", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "soccer", LEAGUE);

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
          headline={headline}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeName={homeCode}
          awayName={awayCode}
          homeScore={homeScore}
          awayScore={awayScore}
          isDark={isDark}
          date={formattedDate}
          time={formattedTime}
          broadcast={broadcasts}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeWins={homeWins}
          awayWins={awayWins}
          isTie={isTie}
          homeRank={null}
          awayRank={null}
          isHomeAllStar={isHomeAllStar}
          isHomeNational={isHomeNational}
          isAwayAllStar={isAwayAllStar}
          isAwayNational={isAwayNational}
          homeId={homeId}
          awayId={awayId}
          state={state}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
          period={period}
          clock={clock}
          league={LEAGUE}
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

            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              isDark={isDark}
              state={state}
              league={"soccer"}
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
              state={state}
              isDark={isDark}
              league={"socc"}
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
