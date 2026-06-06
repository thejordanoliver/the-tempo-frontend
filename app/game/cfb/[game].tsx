import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  GameLocation,
  LastFiveGames,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import GameLiveChatOverlay from "components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameHeader from "components/Sports/NFL/GameDetails/GameHeader";
import GameLeaders from "components/Sports/NFL/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/NFL/GameDetails/GameTeamStats";
import TeamDrives from "components/Sports/NFL/GameDetails/InjuryReport/TeamDrives";
import PlayByPlayField from "components/Sports/NFL/GameDetails/PlayByPlayField";
import TeamScoringSummary from "components/Sports/NFL/GameDetails/TeamScoringSummary";
import { getNeutralVenue } from "constants/neutralVenues";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useFootballTeamStats } from "hooks/FootballHooks/useFootballTeamStats";
import { useGameDetails } from "hooks/FootballHooks/useGameDetails";
import { useLastFiveGames } from "hooks/FootballHooks/useLastFiveGames";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { FootballGame } from "types/football";
import { getHolidayLabel } from "utils/dateUtils";

const LEAGUE = "CFB";

export default function CFBGameDetailsScreen() {
  const { game: gameParam } = useLocalSearchParams();
  const parsedGame = useMemo(() => {
    if (typeof gameParam !== "string") return null;

    try {
      return JSON.parse(gameParam) as FootballGame;
    } catch {
      console.warn("Failed to parse game:", gameParam);
      return null;
    }
  }, [gameParam]);

  if (!parsedGame) return null;

  return <CFBGameDetailsContent parsedGame={parsedGame} />;
}

function CFBGameDetailsContent({ parsedGame }: { parsedGame: FootballGame }) {
  const styles = gameDetailsScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();
  const { teams, game } = parsedGame;
  const gameId = String(game.id);
  const homeTeamId = teams?.home?.id ?? 0;
  const awayTeamId = teams?.away?.id ?? 0;
  const homeTeam = getCFBTeam(homeTeamId);
  const awayTeam = getCFBTeam(awayTeamId);
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;
  const homeLogo = getCFBTeamLogo(homeTeamId, isDark);
  const awayLogo = getCFBTeamLogo(awayTeamId, isDark);
  const homeHeaderLogo = getCFBTeamLogo(homeTeamId, true);
  const awayHeaderLogo = getCFBTeamLogo(awayTeamId, true);
  const homeCode = homeTeam?.code;
  const awayCode = awayTeam?.code;
  const awayColor = useMemo(() => awayTeam?.color, [awayTeam?.color]);
  const homeColor = useMemo(() => homeTeam?.color, [homeTeam?.color]);
  const gameDateObj = useMemo(() => {
    if (!game?.date) return null;

    const raw =
      typeof game.date === "object" ? game.date.timestamp * 1000 : game.date;

    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [game?.date]);

  const gameDateStr = gameDateObj?.toISOString() ?? "";

  const formattedDate = gameDateObj?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime =
    gameDateObj?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const { details, score } = useGameDetails(
    "cfb",
    homeEspnId,
    awayEspnId,
    gameDateStr,
  );

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);
  const { stats } = useFootballTeamStats(parsedGame.game.id);
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isCanceled || isDelayed || isPostponed || isForfeited;
  const displayClock = score?.displayClock;
  const period = score?.period;
  const redzone = score?.possession?.isRedZone;

  const isGameLoading = !details || !score;
  const headlineText = details?.headline;
  const broadcast = details?.broadcast ?? "";
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const currentDrives = score?.drives.current;
  const previousDrives = score?.drives.previous;
  const scoringPlays = score?.scoringPlays;
  const lastPlay = score?.lastPlay;
  const downDistanceText = score?.possession.downDistanceText;
  const venue = details?.venue;
  const neutralSite = details?.neutralSite;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const possessionTeamId = score?.possession.teamId;
  const homeTimeouts = score?.possession.homeTimeouts;
  const awayTimeouts = score?.possession.awayTimeouts;
  const homeRecord = details?.records.home.total.summary;
  const awayRecord = details?.records.away.total.summary;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;
  const baseVenue = details?.venue;

  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name
    : homeTeam?.venue || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address ||
      `${baseVenue?.address.city} ${baseVenue?.address.state}, ${baseVenue?.address.zipCode} ${baseVenue?.address.country}`;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueAttendance = details?.attendance;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage
    : homeTeam?.venueImage || baseVenue?.images[1].href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);
  const { weather } = useWeatherForecast(venueLat, venueLon, gameDateStr);

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (isGameLoading || !details || !homeTeam || !awayTeam) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    // Show header once everything is ready
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamId={homeTeamId}
          awayTeamId={awayTeamId}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          homeLogo={homeHeaderLogo}
          awayLogo={awayHeaderLogo}
          homeColor={homeColor}
          awayColor={awayColor}
          isNeutralSite={neutralSite}
          league={LEAGUE}
        />
      ),
    });
  }, [
    navigation,
    isGameLoading,
    details,
    homeCode,
    awayCode,
    homeHeaderLogo,
    awayHeaderLogo,
    homeTeam,
    awayTeam,
    homeTeamId,
    awayTeamId,
    homeColor,
    awayColor,
    neutralSite,
  ]);

  if (!parsedGame || !homeTeam || !awayTeam) return <View />;

  if (isGameLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          headlineText={headline}
          home={homeTeam}
          away={awayTeam}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          awayScore={awayScore}
          homeScore={homeScore}
          possessionTeamId={possessionTeamId}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          period={period}
          displayClock={displayClock}
          possessionText={downDistanceText}
          isDark={isDark}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          broadcast={broadcast}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          gameStatusShortDetail={gameStatusDetail}
          gameStatusDescription={gameStatusDescription}
          redzone={redzone}
          league="cfb"
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            <FanPredictionVote
              gameId={gameId}
              awayId={awayTeamId}
              awayCode={awayCode}
              awayLogo={awayHeaderLogo}
              awayColor={awayColor}
              homeId={homeTeamId}
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
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <PlayByPlayField
              lastPlay={lastPlay}
              firstDownYardLine={undefined}
              possessionTeamId={possessionTeamId}
              homeTeamId={Number(homeTeam.id)}
              awayTeamId={Number(awayTeam.id)}
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <GameLeaders
              gameId={String(parsedGame.game.id)}
              homeTeamId={String(homeTeam.id)}
              awayTeamId={String(awayTeam.id)}
              isDark={isDark}
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <TeamDrives
              previousDrives={previousDrives}
              currentDrives={currentDrives}
              homeTeamId={Number(homeTeam?.espnID)}
              awayTeamId={Number(awayTeam?.espnID)}
              isDark={isDark}
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <TeamScoringSummary
              scoringPlays={scoringPlays ?? []}
              homeTeamId={Number(homeTeam?.espnID)}
              awayTeamId={Number(awayTeam?.espnID)}
              isDark={isDark}
              league={LEAGUE}
              gameStatusDescription={gameStatusDescription}
            />

            <GameTeamStats stats={stats} isDark={isDark} league={LEAGUE} />

            <LastFiveGames
              isDark={isDark}
              home={{
                teamId: homeTeamId,
                teamCode: homeCode,
                games: homeLastGames.games,
              }}
              away={{
                teamId: awayTeamId,
                teamCode: awayCode,
                games: awayLastGames.games,
              }}
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
              grass={venue?.grass ?? undefined}
              isDark={isDark}
              surface="football"
            />
          </View>
        )}
      </ScrollView>

      <GameLiveChatOverlay
        gameId={String(parsedGame.game.id)}
        opacityAnim={opacityAnim}
        gameStatusDescription={gameStatusDescription}
      />
    </>
  );
}
