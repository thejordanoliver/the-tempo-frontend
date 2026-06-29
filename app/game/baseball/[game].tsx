import BoxScore from "@/components/Sports/Baseball/GameDetails/BoxScore";
import GameTeamStats from "@/components/Sports/Baseball/GameDetails/GameTeamStats";
import TeamInjuries from "@/components/Sports/Baseball/GameDetails/InjuryReport/TeamInjuries";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { useVenue } from "@/hooks/useVenue";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import CustomActivityIndicator from "../../../components/CustomActivityIndicator";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import GameHeader from "../../../components/Sports/Baseball/GameDetails/GameHeader";
import LastPlay from "../../../components/Sports/Baseball/GameDetails/LastPlay";
import {
  FanPredictionVote,
  GameLocation,
  HighlightVideoList,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
} from "../../../components/Sports/NBA/GameDetails";
import GameLiveChatOverlay from "../../../components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { Colors } from "../../../constants/styles";
import { getCBTeam, getCBTeamLogo } from "../../../constants/teamsCB";
import { getMLBTeam, getMLBTeamLogo } from "../../../constants/teamsMLB";
import { getSBTeam, getSBTeamLogo } from "../../../constants/teamsSB";
import { usePreferences } from "../../../contexts/PreferencesContext";
import { useBaseballGameDetails } from "../../../hooks/BaseballHooks/useBaseballGameDetails";
import { useLastFiveGames } from "../../../hooks/BaseballHooks/useLastFiveGames";
import { useScrollFade } from "../../../hooks/useScrollFade";
import { useWeather } from "../../../hooks/useWeather";
import { gameDetailsScreenStyles } from "../../../styles/GameDetailStyles/GameDetailsScreenStyles";
import { BaseballGameCardProps } from "../../../types/baseball";
import { formatVenueAddress, getBroadcastDisplay } from "../../../utils/games";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type BaseballGame = BaseballGameCardProps["game"];

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

function parseGameParam(value?: string | string[]): BaseballGame | undefined {
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
    return JSON.parse(decodedValue) as BaseballGame;
  } catch {
    return undefined;
  }
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export default function GameDetailsScreen(
  props: Partial<BaseballGameCardProps> = {},
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

  const LEAGUE = game?.league?.code ?? "mlb";
  const normalizedLeague = LEAGUE.toLowerCase();
  const isMLB = normalizedLeague === "mlb";
  const isCB = leagueId === 14;
  const isSB = leagueId === 102;

  const gameDateObj = game?.date ? new Date(game.date) : null;
  const gameId = game?.id;

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

  const home = game?.home;
  const away = game?.away;

  const homeId = Number(home?.id ?? 0);
  const awayId = Number(away?.id ?? 0);
  const homeEspnId = home?.espnId ?? 0;
  const awayEspnId = away?.espnId ?? 0;

  const homeTeam = isSB
    ? getSBTeam(homeId)
    : isCB
      ? getCBTeam(homeId)
      : getMLBTeam(homeId);

  const awayTeam = isSB
    ? getSBTeam(awayId)
    : isCB
      ? getCBTeam(awayId)
      : getMLBTeam(awayId);

  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);
  const awayName = useMemo(
    () => awayTeam?.fullName ?? "",
    [awayTeam?.fullName],
  );
  const homeName = useMemo(
    () => homeTeam?.fullName ?? "",
    [homeTeam?.fullName],
  );

  const awayColor = useMemo(
    () => awayTeam?.color ?? Colors.midTone,
    [awayTeam?.color],
  );

  const homeColor = useMemo(
    () => homeTeam?.color ?? Colors.midTone,
    [homeTeam?.color],
  );

  const homeLogo = isSB
    ? getSBTeamLogo(homeId, isDark)
    : isCB
      ? getCBTeamLogo(homeId, isDark)
      : getMLBTeamLogo(homeId, isDark);

  const awayLogo = isSB
    ? getSBTeamLogo(awayId, isDark)
    : isCB
      ? getCBTeamLogo(awayId, isDark)
      : getMLBTeamLogo(awayId, isDark);

  const homeHeaderLogo = isSB
    ? getSBTeamLogo(homeId, true)
    : isCB
      ? getCBTeamLogo(homeId, true)
      : getMLBTeamLogo(homeId, true);

  const awayHeaderLogo = isSB
    ? getSBTeamLogo(awayId, isDark)
    : isCB
      ? getCBTeamLogo(awayId, true)
      : getMLBTeamLogo(awayId, true);

  const homeLastGames = useLastFiveGames(homeId, "baseball", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "baseball", LEAGUE);
  const { details, score } = useBaseballGameDetails(LEAGUE, gameId);

  const broadcasts = getBroadcastDisplay(game?.broadcasts);
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const state = game?.status.state ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";

  const dontShowDetails =
    isDelayed || isCanceled || isPostponed || isSuspended || isForfeited;

  const homeChance = Number(details?.predictor) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const homeHits = game?.home.hits;
  const homeErrors = game?.home.errors;
  const awayHits = game?.away.hits;
  const awayErrors = game?.away.errors;
  const homeRuns = game?.home.score;
  const awayRuns = game?.away.score;

  const outs = score?.outs ?? 0;

  const bases = {
    onFirst: score?.bases.onFirst ?? false,
    onSecond: score?.bases.onSecond ?? false,
    onThird: score?.bases?.onThird ?? false,
  };

  const homeRecord = home?.record ?? "0—0";
  const awayRecord = away?.record ?? "0—0";
  const homeRank = home?.homeRank;
  const awayRank = away?.awayRank;
  const isTopInning = gameStatusDetail.includes("Top");
  const headline = game?.headline ?? "";
  const lastPlay = score?.lastPlay;
  const teamStats = score?.teamStats ?? [];
  const playerStats = score?.playerStats ?? [];
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const injuries = details?.injuries ?? [];

  const neutralSite = details?.neutralSite;
  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue({ sport: "baseball", id: venueId });
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
  const venueAttendance = game?.attendance || null;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  const homeTeamPlayersData = useRoster(homeId, LEAGUE);
  const awayTeamPlayersData = useRoster(awayId, LEAGUE);
  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

  const isLoading = !score || !details || !homeLastGames || !awayLastGames;

  useLayoutEffect(() => {
    if (isLoading) {
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
    awayCode,
    game,
    awayHeaderLogo,
    homeHeaderLogo,
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

  if (!game) return <View />;

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
          homeRank={homeRank}
          awayRank={awayRank}
          homeId={homeId}
          awayId={awayId}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
          isTopInning={isTopInning}
          outs={outs}
          bases={bases}
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

            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              homeHits={homeHits}
              awayHits={awayHits}
              homeRuns={homeRuns}
              awayRuns={awayRuns}
              awayErrors={awayErrors}
              homeErrors={homeErrors}
              isDark={isDark}
              state={state}
              league={LEAGUE}
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

            <BoxScore
              awayTeamId={awayId}
              homeTeamId={homeId}
              awayName={awayName}
              homeName={homeName}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              playerStats={playerStats}
              state={state}
              isDark={isDark}
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
              league={LEAGUE}
              state={state}
              isDark={isDark}
            />

            <TeamInjuries
              injuries={injuries}
              teamPlayersMap={teamPlayersMap}
              league={isMLB}
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

      {!dontShowDetails && (
        <GameLiveChatOverlay
          gameId={String(game.id)}
          opacityAnim={opacityAnim}
          state={state}
        />
      )}
    </>
  );
}
