import GameHeader from "@/components/Sports/Soccer/GameDetails/GameHeader";
import GameTeamStats from "@/components/Sports/Soccer/GameDetails/GameTeamStats";
import SoccerKeyEvents from "@/components/Sports/Soccer/GameDetails/SoccerKeyEvents";
import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useSoccerGameDetails } from "@/hooks/SoccerHooks/useSoccerGameDetails";
import { useVenue } from "@/hooks/useVenue";
import { SoccerGameCardProps } from "@/types/soccer";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import CustomActivityIndicator from "../../../components/CustomActivityIndicator";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import LastPlay from "../../../components/Sports/Baseball/GameDetails/LastPlay";
import {
  FanPredictionVote,
  GameLocation,
  HighlightVideoList,
  LastFiveGames,
  LineScore,
  Officials,
} from "../../../components/Sports/NBA/GameDetails";
import GameLiveChatOverlay from "../../../components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
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

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
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

  const LEAGUE = game?.league?.code ?? "epl";

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game?.date]);

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

  const gameId = game?.id;
  const home = game?.home;
  const away = game?.away;

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

  const homeLogo = getSOCCTeamLogo(homeId, isDark);
  const awayLogo = getSOCCTeamLogo(awayId, isDark);

  const homeHeaderLogo = getSOCCTeamLogo(homeId, true);
  const awayHeaderLogo = getSOCCTeamLogo(awayId, true);

  const homeLastGames = useLastFiveGames(homeId, "soccer", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "soccer", LEAGUE);
  const { details, score } = useSoccerGameDetails(LEAGUE, gameId);

  const isLoading = !score || !details || !homeLastGames || !awayLastGames;
  const broadcasts = getBroadcastDisplay(game?.broadcasts);
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const state = game?.status.state ?? "";
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const homeWins = game?.home.winner;
  const awayWins = game?.away.winner;
  const isTie = game?.away.winner === game?.home.winner;
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
  const homeRecord = home?.record ?? "0—0-0";
  const awayRecord = away?.record ?? "0—0-0";
  const period = formatPeriod({ period: game?.status.period, isSOCC: true });
  const clock = game?.status.clock;
  const headline = game?.headline ?? "";
  const lastPlay = score?.lastPlay;
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];

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
  const venueImage = venue?.image ?? "";
  const venueAttendance = baseVenue?.attendance || null;
  const venueLocation = `${venue?.city}, ${venue?.state}`;

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
          homeId={homeId}
          awayId={awayId}
          gameStatusDescription={gameStatusDescription}
          state={state}
          gameStatusDetail={gameStatusDetail}
          period={period}
          clock={clock}
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

            <SoccerKeyEvents
              keyEvents={score?.keyEvents}
              awayTeamId={awayId}
              homeTeamId={homeId}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayCode={awayCode}
              homeCode={homeCode}
              isDark={isDark}
              gameStatusDescription={score?.gameStatusDescription}
            />

            <HighlightVideoList highlights={highlights} isDark={isDark} />

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

      <GameLiveChatOverlay
        gameId={String(game.id)}
        opacityAnim={opacityAnim}
        state={state}
      />
    </>
  );
}
