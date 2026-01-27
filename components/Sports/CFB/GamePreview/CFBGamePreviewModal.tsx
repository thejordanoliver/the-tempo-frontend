//./CFB/GamePreview/CFBGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import CFBSeriesHistory from "components/Sports/CFB/GameDetails/CFBSeriesHistory";
import {
  GameLocation,
  LastFiveGamesSwitcher,
} from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameLeaders from "components/Sports/NFL/GameDetails/GameLeaders";
import TeamDrives from "components/Sports/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/Sports/NFL/GameDetails/TeamScoringSummary";
import {
  getRivalryHeadline,
  getTeamById,
  neutralStadiums,
} from "constants/teamsCFB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCFBMatchup } from "hooks/CFBHooks/useCFBMatchup";
import { useFootballVenues } from "hooks/CFBHooks/useFootballVenues";
import { useLastFiveGames } from "hooks/CFBHooks/useLastFiveGames";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModalStyles";
import { emptyAwayTeam, emptyHomeTeam, Game } from "types/cfb";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { CenterInfo } from "./CenterInfo";
import TeamInfo from "./TeamInfo";

type Props = {
  game: Game;
  visible: boolean;
  onClose: () => void;
};

export default function CFBGamePreviewModal({ game, visible, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%", "80%", "88%", "94%"], []);
  useEffect(() => {
    visible ? sheetRef.current?.present() : sheetRef.current?.dismiss();
  }, [visible]);

  // --- Compute game date ---
  const gameDate = useMemo(() => {
    return game?.game?.date?.timestamp
      ? new Date(game.game.date.timestamp * 1000)
      : null;
  }, [game?.game?.date?.timestamp]);
  const gameDateStr = gameDate?.toISOString();

  const isChampionship: boolean = useMemo(() => {
    if (!gameDate) return false;
    return (
      gameDate.getFullYear() === 2026 &&
      gameDate.getMonth() === 0 &&
      gameDate.getDate() === 19
    );
  }, [gameDate]);

  const styles = gamePreviewModalStyle(isChampionship);
  const gameInfo = game.game;
  const week = gameInfo.week;
  const away = game.teams.away;
  const home = game.teams.home;
  const awayId = away.id || emptyAwayTeam.id;
  const homeId = home.id || emptyHomeTeam.id;
  const homeTeam = getTeamById(homeId) || emptyAwayTeam;
  const awayTeam = getTeamById(awayId) || emptyHomeTeam;
  const awayEspnId = awayTeam?.espnID;
  const homeEspnId = homeTeam?.espnID;
  const awayColor = awayTeam?.color ?? emptyAwayTeam.color ?? "";
  const homeColor = homeTeam?.color ?? emptyHomeTeam.color ?? "";
  const awayName = awayTeam?.code || emptyAwayTeam.code;
  const homeName = homeTeam?.code || emptyHomeTeam.code;
  const timestampNum = Number(gameInfo.date.timestamp);

  const displayDateStr = new Date(timestampNum * 1000).toLocaleDateString(
    "en-us",
    {
      month: "short",
      day: "numeric",
    }
  );
  const displayTimeStr = new Date(timestampNum * 1000).toLocaleTimeString(
    "en-us",
    {
      hour: "numeric",
      minute: "numeric",
    }
  );

  const gameStatus = gameInfo.status.long;

  const homeLastGames = useLastFiveGames(homeId);
  const awayLastGames = useLastFiveGames(awayId);

  // --- Possession & Score ---
  const possession = useFootballGamePossession(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const {
    loading: possessionLoading,
    gameStatusShortDetail,
    gameStatusDescription,
    period,
    score,
    possessionTeamId,
    homeTimeouts,
    awayTimeouts,
    displayClock,
    lineScore,
    downDistanceText,
    redzone: isRedzone,
  } = possession;

  const { data, loading: gameDetailsLoading } = useFootballGameDetails(
    String(awayEspnId || emptyAwayTeam.espnID),
    String(homeEspnId || emptyHomeTeam.espnID),
    gameDateStr,
    "cfb"
  );
  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const possessionTeam = possessionTeamId ? possessionTeamId : null;
  const officials = data?.officials ?? [];
  const currentDrives = data?.currentDrives;
  const previousDrives = data?.previousDrives;
  const venue = data?.venue;
  const headline = data?.headline;
  const broadcast = data?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcast);
  const scoringPlays = data?.scoringPlays;
  const homeRank = data?.homeRank;
  const awayRank = data?.awayRank;
  const homeRecord = data?.homeRecords?.total?.summary ?? "";
  const awayRecord = data?.awayRecords?.total?.summary ?? "";
  const displayAwayScore = score?.away ?? game?.scores?.away?.total ?? 0;
  const displayHomeScore = score?.home ?? game?.scores?.home?.total ?? 0;
  const highlights = data?.highlights ?? [];
  const clock = displayClock || gameInfo?.status?.timer;

  const { data: footballVenues } = useFootballVenues();

  const normalizeVenueName = (name?: string | null) =>
    name
      ?.toLowerCase()
      .replace(/stadium|field|arena|center|centre/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim() ?? "";

  const matchedVenue = useMemo(() => {
    if (!venue?.name || !footballVenues.length) return null;

    const normalizedGameVenue = normalizeVenueName(venue.name);

    return (
      footballVenues.find(
        (v) => normalizeVenueName(v.venue) === normalizedGameVenue
      ) || null
    );
  }, [venue?.name, footballVenues]);

  // --- Neutral Site Detection Using neutralStadiums ---
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralStadiumEntry = Object.entries(neutralStadiums).find(
    ([stadiumName]) => stadiumName.trim().toLowerCase() === normalizedVenueName
  );

  const isNeutralSite = !!neutralStadiumEntry;
  const neutralStadiumData = isNeutralSite ? neutralStadiumEntry[1] : null;
  const neutralStadiumName = isNeutralSite ? neutralStadiumEntry[0] : null;

  // --- Final Venue Resolution ---
  let resolvedVenueName =
    matchedVenue?.venue ?? venue?.name ?? home?.venue ?? "Unknown Stadium";

  let resolvedVenueCity = matchedVenue?.city ?? home?.city ?? "Unknown City";

  let resolvedVenueAddress = matchedVenue?.address ?? home?.address ?? "";

  let resolvedVenueCapacity =
    matchedVenue?.venue_capacity ?? home?.venueCapacity?.toString() ?? "";

  let resolvedVenueImage =
    matchedVenue?.venue_image ?? venue?.image ?? home?.venueImage ?? null;

  let lat = matchedVenue?.latitude ?? homeTeam?.latitude ?? null;

  let lon = matchedVenue?.longitude ?? homeTeam?.longitude ?? null;

  // --- Weather data ---
  const { weather } = useWeatherForecast(
    lat,
    lon,
    gameDateStr ?? null,
    resolvedVenueCity
  );

  const displayWeather = weather
    ? { ...weather, cityName: resolvedVenueCity }
    : null;

  if (isNeutralSite && neutralStadiumData) {
    resolvedVenueName = neutralStadiumName ?? resolvedVenueName;
    resolvedVenueCity = neutralStadiumData.city ?? resolvedVenueCity;
    resolvedVenueAddress = neutralStadiumData.address ?? resolvedVenueAddress;
    resolvedVenueCapacity =
      neutralStadiumData.venueCapacity?.toString() ?? resolvedVenueCapacity;
    resolvedVenueImage = neutralStadiumData.venueImage ?? resolvedVenueImage;
    lat = neutralStadiumData.latitude ?? lat;
    lon = neutralStadiumData.longitude ?? lon;
  }

  const matchup = useCFBMatchup(
    away?.name ?? away.code,
    home?.name ?? home.code
  );

  // Determine fallback rivalry name
  const rivalryHeadline = useMemo(() => {
    return getRivalryHeadline(Number(homeEspnId), Number(awayEspnId));
  }, [homeEspnId, awayEspnId]);

  // Choose headline → rivalry → empty string
  const headLine =
    headline && headline.trim().length > 0 ? headline : rivalryHeadline ?? "";

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableDynamicSizing={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      backgroundStyle={styles.backgroundStyle}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={
            isChampionship ? ["#DFBD69", "#CDA765"] : [awayColor, homeColor]
          }
          locations={isChampionship ? undefined : [0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <BlurView
          intensity={100}
          tint={"systemUltraThinMaterialDark"}
          style={styles.blurViewContainer}
        >
          {gameDetailsLoading || possessionLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator lighter />
            </View>
          ) : (
            <>
              {headLine && (
                <>
                  <Text style={styles.headlineText}>{headLine}</Text>
                </>
              )}

              {/* Teams + Center Info */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  team={awayTeam}
                  teamName={awayName}
                  rank={awayRank}
                  score={displayAwayScore}
                  opponentScore={displayHomeScore}
                  record={awayRecord}
                  isDark={isDark}
                  gameStatusDescription={gameStatusDescription || gameStatus}
                  possessionTeamId={possessionTeam}
                  side="away"
                  timeouts={awayTimeouts}
                  lighter
                />

                <CenterInfo
                  week={week}
                  date={displayDateStr}
                  time={displayTimeStr}
                  period={period}
                  clock={clock}
                  isDark={isDark}
                  downAndDistance={downDistanceText}
                  broadcast={broadcastText}
                  gameStatusDescription={gameStatusDescription ?? gameStatus}
                  gameStatusShortDetail={gameStatusShortDetail}
                  redzone={isRedzone}
                />

                <TeamInfo
                  team={homeTeam}
                  teamName={homeName}
                  rank={homeRank}
                  score={displayHomeScore}
                  opponentScore={displayAwayScore}
                  record={homeRecord}
                  isDark={isDark}
                  gameStatusDescription={gameStatusDescription || gameStatus}
                  possessionTeamId={possessionTeam}
                  side="home"
                  timeouts={homeTimeouts}
                  lighter
                />
              </View>

              {/* Scrollable Details */}
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainerStyle}
                style={styles.bottomSheetScrollViewContainer}
              >
                <View style={styles.bottomSheetScrollViewWrapper}>
                  {!isScheduled && (
                    <LineScore
                      linescore={lineScore}
                      homeCode={homeName}
                      awayCode={awayName}
                      lighter
                    />
                  )}

                  {!isScheduled && (
                    <GameLeaders
                      gameId={String(gameInfo.id)}
                      homeTeamId={String(home.id)}
                      awayTeamId={String(away.id)}
                      lighter
                      league="CFB"
                    />
                  )}
                  <TeamDrives
                    previousDrives={previousDrives ?? []}
                    currentDrives={currentDrives ?? []}
                    homeTeamId={Number(homeEspnId)}
                    awayTeamId={Number(awayEspnId)}
                    league="CFB"
                    lighter
                  />

                  <TeamScoringSummary
                    scoringPlays={scoringPlays ?? []}
                    homeTeamId={Number(homeEspnId)}
                    awayTeamId={Number(awayEspnId)}
                    league="CFB"
                    lighter={true}
                  />

                  <LastFiveGamesSwitcher
                    isDark={true}
                    lighter
                    home={{
                      teamCode: homeName,
                      teamLogo: homeTeam.logo,
                      teamLogoLight: homeTeam.logoLight,
                      games: homeLastGames.games,
                    }}
                    away={{
                      teamCode: awayName,
                      teamLogo: awayTeam.logo,
                      teamLogoLight: awayTeam.logoLight,
                      games: awayLastGames.games,
                    }}
                    league="CFB"
                  />

                  {highlights.length > 0 && (
                    <HighlightVideoList highlights={highlights} lighter />
                  )}

                  {matchup.data && (
                    <CFBSeriesHistory
                      team1Name={awayTeam.code}
                      team2Name={homeTeam.code}
                      team1Wins={matchup.data.team1Wins}
                      team2Wins={matchup.data.team2Wins}
                      team1Logo={awayTeam.logoLight || awayTeam.logo}
                      team2Logo={homeTeam.logoLight || homeTeam.logo}
                      ties={matchup.data.ties}
                      games={matchup.data.games}
                      lighter
                    />
                  )}

                  <Officials
                    officials={officials}
                    loading={false}
                    error={null}
                  />

                  {/* ✅ Team Location / Venue Section */}
                  <GameLocation
                    venueImage={resolvedVenueImage}
                    venueName={resolvedVenueName}
                    weather={displayWeather}
                    location={resolvedVenueCity}
                    address={resolvedVenueAddress}
                    venueCapacity={resolvedVenueCapacity}
                    venueAttendance={
                      venue?.attendance
                        ? String(venue.attendance)
                        : venue?.capacity
                        ? String(venue.capacity)
                        : "N/A"
                    }
                    loading={false}
                    error={null}
                    lighter
                    surface="football"
                    grass={venue?.grass ?? undefined}
                  />
                </View>
              </BottomSheetScrollView>
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
