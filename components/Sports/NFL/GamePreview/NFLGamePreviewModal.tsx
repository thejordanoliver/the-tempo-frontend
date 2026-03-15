// ./NFL/GamePreview/NFLGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import CompetitorInfo from "components/CompetitorInfo";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CenterInfo } from "components/Sports/CFB/GamePreview/CenterInfo";
import {
  GameLocation,
  LastFiveGamesSwitcher,
} from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import {
  getNFLTeamLogo,
  getTeamInfo,
  neutralStadiums,
} from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFootballVenues } from "hooks/CFBHooks/useFootballVenues";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { useLastFiveGames } from "hooks/NFLHooks/useLastFiveGames";
import { useNFLMatchup } from "hooks/NFLHooks/useNFLMatchup";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { emptyAwayTeam, emptyHomeTeam } from "types/cfb";
import { Game } from "types/nfl";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import { transformNFLSeriesGames } from "utils/NFLUtils/transformSeriesGame";
import GameLeaders from "../GameDetails/GameLeaders";
import NFLInjuries from "../GameDetails/NFLInjuries";
import NFLSeriesHistory from "../GameDetails/NFLSeriesHistory";
import NFLTeamDrives from "../GameDetails/TeamDrives";
import TeamScoringSummary from "../GameDetails/TeamScoringSummary";

type Props = {
  game: Game;
  visible: boolean;
  onClose: () => void;
};

export default function NFLGamePreviewModal({ game, visible, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  // --------------------------------------------------------------
  // SHEET VISIBILITY
  // --------------------------------------------------------------
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

  const gameInfo = game.game;
  const isChampionship = gameInfo.week?.includes("Super Bowl");
  const isChristmas = gameDate?.getMonth() === 11 && gameDate.getDate() === 25;
  const isNewYear = gameDate?.getMonth() === 0 && gameDate.getDate() === 1;
  const holidayLabel = isChristmas
    ? "Christmas Day"
    : isNewYear
      ? "New Year's Day"
      : null;

  const styles = gamePreviewModalStyle(isChampionship);

  const week = gameInfo.week;
  const away = game.teams.away || emptyAwayTeam.color;
  const home = game.teams.home || emptyHomeTeam.color;
  const awayId = away.id || emptyAwayTeam.id;
  const homeId = home.id || emptyHomeTeam.id;
  const awayEspnId = game.teams.away.espnID;
  const homeEspnId = game.teams.home.espnID;
  const awayColor = away?.color ?? emptyAwayTeam.color;
  const homeColor = home?.color ?? emptyHomeTeam.color;
  const homeLogo = getNFLTeamLogo(homeId, true);
  const awayLogo = getNFLTeamLogo(awayId, true);
  const awayName = away.code || emptyAwayTeam.code;
  const homeName = home.code || emptyHomeTeam.code;
  const timestampNum = Number(gameInfo.date.timestamp);
  const gameStatus = gameInfo.status.long;

  const displayDateStr = new Date(timestampNum * 1000).toLocaleDateString(
    "en-us",
    {
      month: "short",
      day: "numeric",
    },
  );
  const displayTimeStr = new Date(timestampNum * 1000).toLocaleTimeString(
    "en-us",
    {
      hour: "numeric",
      minute: "numeric",
    },
  );

  // --- Possession & Score ---
  const possession = useFootballGamePossession(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
    "nfl",
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

  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";

  const { data, loading: gameDetailsLoading } = useFootballGameDetails(
    String(awayEspnId || emptyAwayTeam.espnID),
    String(homeEspnId || emptyHomeTeam.espnID),
    gameDateStr,
    "nfl",
  );
  const possessionTeam = possessionTeamId ? possessionTeamId : null;
  const officials = data?.officials ?? [];
  const currentDrives = data?.currentDrives;
  const previousDrives = data?.previousDrives;
  const venue = data?.venue;
  const headline = data?.headline || holidayLabel;
  const broadcast = data?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcast);
  const scoringPlays = data?.scoringPlays;
  const homeRecord = data?.homeRecords?.total?.summary ?? "";
  const awayRecord = data?.awayRecords?.total?.summary ?? "";
  const displayAwayScore = score?.away ?? game?.scores?.away?.total ?? 0;
  const displayHomeScore = score?.home ?? game?.scores?.home?.total ?? 0;
  const injuries = data?.injuries;
  const highlights = data?.highlights ?? [];
  const clock = displayClock || gameInfo?.status?.timer;

  // --------------------------------------------------------------
  // LAST 5 GAMES
  // --------------------------------------------------------------
  const homeLastGames = useLastFiveGames(Number(homeId));
  const awayLastGames = useLastFiveGames(Number(awayId));
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
        (v) => normalizeVenueName(v.venue) === normalizedGameVenue,
      ) || null
    );
  }, [venue?.name, footballVenues]);

  // --- Neutral Site Detection Using neutralStadiums ---
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralStadiumEntry = Object.entries(neutralStadiums).find(
    ([stadiumName]) => stadiumName.trim().toLowerCase() === normalizedVenueName,
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

  let lat = matchedVenue?.latitude ?? home?.latitude ?? null;

  let lon = matchedVenue?.longitude ?? home?.longitude ?? null;

  // --- Weather data ---
  const { weather } = useWeatherForecast(
    lat,
    lon,
    gameDateStr ?? null,
    resolvedVenueCity,
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
  // --------------------------------------------------------------
  // SERIES HISTORY
  // --------------------------------------------------------------
  const { data: matchup } = useNFLMatchup(homeName, awayName);

  const seriesGames = useMemo(() => {
    if (!matchup?.games) return [];
    return transformNFLSeriesGames(matchup.games);
  }, [matchup]);

  const homeColorTransparent = homeColor + "80"; // CC ≈ 80% opacity
  const awayColorTransparent = awayColor + "80"; // CC ≈ 80% opacity

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
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
          {possessionLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator lighter />
            </View>
          ) : (
            <>
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* HEADER */}
              <View style={styles.gameHeaderContainer}>
                <CompetitorInfo
                  team={away}
                  logo={awayLogo}
                  name={awayName}
                  score={displayAwayScore}
                  opponentScore={displayHomeScore}
                  record={awayRecord}
                  possessionTeamId={possessionTeam}
                  gameStatusDescription={gameStatusDescription ?? gameStatus}
                  side="away"
                  timeouts={awayTimeouts}
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

                <CompetitorInfo
                  team={home}
                  logo={homeLogo}
                  name={homeName}
                  score={displayHomeScore}
                  opponentScore={displayAwayScore}
                  record={homeRecord}
                  possessionTeamId={possessionTeam}
                  gameStatusDescription={gameStatusDescription ?? gameStatus}
                  side="home"
                  timeouts={homeTimeouts}
                />
              </View>

              {/* BODY */}
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainerStyle}
              >
                <View style={styles.bottomSheetScrollViewWrapper}>
                  {!isScheduled && (
                    <LineScore
                      linescore={lineScore}
                      homeCode={home.code}
                      awayCode={awayName}
                      lighter
                    />
                  )}

                  {!isScheduled && (
                    <GameLeaders
                      gameId={String(gameInfo.id)}
                      homeTeamId={String(homeId)}
                      awayTeamId={String(awayId)}
                      lighter
                      league="NFL"
                    />
                  )}

                  <NFLTeamDrives
                    previousDrives={previousDrives}
                    currentDrives={currentDrives}
                    homeTeamId={Number(homeEspnId)}
                    awayTeamId={Number(awayEspnId)}
                    lighter
                  />

                  <TeamScoringSummary
                    scoringPlays={scoringPlays ?? []}
                    homeTeamId={Number(homeEspnId)}
                    awayTeamId={Number(awayEspnId)}
                    league="NFL"
                    lighter={true}
                  />

                  <LastFiveGamesSwitcher
                    isDark={isDark}
                    home={{
                      teamId: homeId,
                      teamCode: home.code,
                      games: homeLastGames.games,
                    }}
                    away={{
                      teamId: awayId,
                      teamCode: away.code,
                      games: awayLastGames.games,
                    }}
                    lighter
                    league="NFL"
                  />
                  
                  {highlights.length > 0 && (
                    <HighlightVideoList highlights={highlights} lighter />
                  )}
                  {matchup && (
                    <NFLSeriesHistory
                      team2Code={
                        getTeamInfo(matchup?.teams.team2.id)?.code ?? "UNK"
                      }
                      team1Code={
                        getTeamInfo(matchup?.teams.team1.id)?.code ?? "UNK"
                      }
                      team1Full={matchup?.teams.team1.fullName ?? ""}
                      team2Full={matchup?.teams.team2.fullName ?? ""}
                      team1Wins={matchup?.series.winsA ?? 0}
                      team2Wins={matchup?.series.winsB ?? 0}
                      ties={matchup?.series.ties ?? 0}
                      games={seriesGames}
                      team1Logo={getTeamInfo(matchup?.teams.team1.id)?.logo}
                      team2Logo={getTeamInfo(matchup?.teams.team2.id)?.logo}
                      team1LogoLight={
                        getTeamInfo(matchup?.teams.team1.id)?.logoLight
                      }
                      team2LogoLight={
                        getTeamInfo(matchup?.teams.team2.id)?.logoLight
                      }
                      lighter
                    />
                  )}

                  {!isFinal && (
                    <NFLInjuries
                      injuries={injuries}
                      loading={false}
                      error={null}
                      awayTeamId={awayEspnId}
                      homeTeamId={homeEspnId}
                      awayTeamAbbr={awayName}
                      homeTeamAbbr={homeName}
                      lighter
                    />
                  )}

                  <Officials
                    officials={officials}
                    loading={false}
                    error={null}
                    lighter
                  />

                  <GameLocation
                    venueImage={resolvedVenueImage}
                    venueName={resolvedVenueName}
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
                    weather={displayWeather}
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
