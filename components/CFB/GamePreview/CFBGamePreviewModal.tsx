//./CFB/GamePreview/CFBGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import CFBSeriesHistory from "components/CFB/GameDetails/CFBSeriesHistory";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { GameLocation, LastFiveGamesSwitcher } from "components/GameDetails";
import LineScore from "components/GameDetails/LineScore";
import Officials from "components/GameDetails/Officials";
import GameLeaders from "components/NFL/GameDetails/GameLeaders";
import TeamDrives from "components/NFL/GameDetails/TeamDrives";
import { getRivalryHeadline, neutralStadiums, teams } from "constants/teamsCFB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCFBGameDetails } from "hooks/CFBHooks/useCFBGameDetails";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBMatchup } from "hooks/CFBHooks/useCFBMatchup";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useFootballVenues } from "hooks/CFBHooks/useFootballVenues";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useLastFiveGames } from "hooks/CFBHooks/useLastFiveGames";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModalStyles";
import { CFBGame, emptyAwayTeam, emptyHomeTeam } from "types/cfb";
import {
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";
import { CFBCenterInfo } from "./CenterInfo";
import TeamInfo from "./TeamInfo";
type Props = {
  game: CFBGame; // ✅ normalized type, consistent with NBA + Summer League
  visible: boolean;
  onClose: () => void;
};

export default function CFBGamePreviewModal({ game, visible, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);
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
  const home = game.teams.home;
  const away = game.teams.away;
  const scores = game.scores;

  // Ensure timestamp is a number
  const timestampNum = Number(gameInfo.date.timestamp);
  const apiDateStr = new Date(timestampNum * 1000).toISOString().split("T")[0]; // ✅ for API hooks
  const displayDateStr = new Date(timestampNum * 1000).toLocaleDateString(
    "en-us",
    {
      month: "short",
      day: "numeric",
    }
  ); // ✅ for UI
  const displayTimeStr = new Date(timestampNum * 1000).toLocaleTimeString(
    "en-us",
    {
      hour: "numeric",
      minute: "numeric",
    }
  );

  const gameStatus = gameInfo.status.long;

  // Linescore
  const linescore = useMemo(() => {
    const homePeriods = [
      scores.home?.quarter_1,
      scores.home?.quarter_2,
      scores.home?.quarter_3,
      scores.home?.quarter_4,
    ];
    const awayPeriods = [
      scores.away?.quarter_1,
      scores.away?.quarter_2,
      scores.away?.quarter_3,
      scores.away?.quarter_4,
    ];
    if (scores.home?.overtime != null) homePeriods.push(scores.home.overtime);
    if (scores.away?.overtime != null) awayPeriods.push(scores.away.overtime);
    return {
      home: homePeriods.map((v) => (v != null ? String(v) : "-")),
      away: awayPeriods.map((v) => (v != null ? String(v) : "-")),
    };
  }, [scores]);

  const findTeam = (id: number | string | undefined, fallback: any) => {
    const match = teams.find((t) => String(t.id) === String(id));
    return {
      ...fallback,
      ...match,
      id: match?.id ?? fallback.id,
      espnID: match?.espnID ?? fallback.espnID,
      name: match?.name ?? fallback.name,
      shortName: match?.shortName ?? fallback.shortName,
      code: match?.code ?? fallback.code,
      fullName: match?.fullName ?? fallback.fullName,
      logo: match?.logo ?? fallback.logo,
      logoLight: match?.logoLight ?? fallback.logoLight,
      city: match?.city ?? fallback.city,
      address: match?.address ?? fallback.address,
      venue: match?.venue ?? fallback.venue,
      venueCapacity: match?.venueCapacity ?? fallback.venueCapacity,
      venueImage: match?.venueImage ?? fallback.venueImage,
      latitude: match?.latitude ?? fallback.latitude,
      longitude: match?.longitude ?? fallback.longitude,
    };
  };

  const awayTeamData = findTeam(away?.id, emptyAwayTeam);
  const homeTeamData = findTeam(home?.id, emptyHomeTeam);

  const homeLastGames = useLastFiveGames(Number(homeTeamData?.id || 0));
  const awayLastGames = useLastFiveGames(Number(awayTeamData?.id || 0));

  // Snap points
  const snapPoints = useMemo(() => ["60%", "80%", "88%", "94%"], []);

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  // Colors for CFBGameCenterInfo
  const colorsRecord = useMemo(
    () => ({
      text: "",
      record: "",
      score: "",
      winnerScore: "",
    }),
    []
  );

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  // --- Team records ---
  const awayEspnId = getTeamById(away?.id)?.espnID;
  const homeEspnId = getTeamById(home?.id)?.espnID;

  const { record: awayRecord } = useCFBTeamRecord(
    awayEspnId ? Number(awayEspnId) : undefined
  );
  const { record: homeRecord } = useCFBTeamRecord(
    homeEspnId ? Number(homeEspnId) : undefined
  );

  // ✅ Load both CFP and AP rankings
  const cfpTop25 = useCFPTop25();
  const apTop25 = useAPTop25();

  // ✅ Get ranking, falling back to AP poll if CFP is missing
  // Check if CFP rankings are active (after they’ve been released)
  const isCFPActive = cfpTop25 && cfpTop25.length > 0;

  // Main helper to get rank with conditional fallback
  const getTeamRank = (id: number | string) => {
    if (isCFPActive) {
      // ✅ Use CFP ranking if rankings are active
      return getTeamRankFromCFPById(id, cfpTop25) ?? "";
    }
    // 🕓 Early season — fallback to AP Top 25
    return getTeamRankFromAPById(id, apTop25) ?? "";
  };

  const formatPeriod = (raw: string | number | undefined | null) => {
    if (!raw) return "";
    const map: Record<string, string> = {
      1: "1st",
      2: "2nd",
      3: "3rd",
      4: "4th",
      OT: "OT",
      HT: "Halftime",
      FT: "Final",
    };

    // If it matches keys (Q1..OT) use map
    if (typeof raw === "string" && map[raw]) {
      return map[raw];
    }

    // If it’s a number, format with ordinal suffix
    if (typeof raw === "number") {
      const suffix =
        raw === 1 ? "st" : raw === 2 ? "nd" : raw === 3 ? "rd" : "th";
      return `${raw}${suffix}`;
    }

    return String(raw);
  };

  const {
    officials,
    neutralSite,
    scoringPlays,
    previousDrives,
    currentDrives,
    venue,
    highlights,
    broadcast,
  } = useCFBGameDetails(
    String(awayEspnId || emptyAwayTeam.espnID),
    String(homeEspnId || emptyHomeTeam.espnID),
    gameDateStr
  );

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

  const {
    possessionTeamId,
    downDistanceText,
    lastPlay,
    lineScore,
    redzone,
    displayClock,
    period,
    score,
    homeTimeouts,
    gameStatusDescription,
    gameStatusShortDetail,
    awayTimeouts,
    loading: possessionLoading,
  } = useCFBGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr);

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
    matchedVenue?.venue ??
    venue?.name ??
    homeTeamData?.venue ??
    "Unknown Stadium";

  let resolvedVenueCity =
    matchedVenue?.city ?? homeTeamData?.city ?? "Unknown City";

  let resolvedVenueAddress =
    matchedVenue?.address ?? homeTeamData?.address ?? "";

  let resolvedVenueCapacity =
    matchedVenue?.venue_capacity ??
    homeTeamData?.venueCapacity?.toString() ??
    "";

  let resolvedVenueImage =
    matchedVenue?.venue_image ??
    venue?.image ??
    homeTeamData?.venueImage ??
    null;

  let lat = matchedVenue?.latitude ?? homeTeamData?.latitude ?? null;

  let lon = matchedVenue?.longitude ?? homeTeamData?.longitude ?? null;

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
    awayTeamData?.name ?? awayTeamData.code,
    homeTeamData?.name ?? homeTeamData.code
  );

  const { headlineText } = useGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  // Determine fallback rivalry name
  const rivalryHeadline = useMemo(() => {
    return getRivalryHeadline(Number(homeEspnId), Number(awayEspnId));
  }, [homeEspnId, awayEspnId]);

  // Choose headline → rivalry → empty string
  const headLine =
    headlineText && headlineText.trim().length > 0
      ? headlineText
      : rivalryHeadline ?? "";

  const displayAwayScore = score?.away ?? game?.scores?.away?.total ?? 0;
  const displayHomeScore = score?.home ?? game?.scores?.home?.total ?? 0;

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
            isChampionship
              ? ["#DFBD69", "#CDA765"]
              : [awayTeamData.color, homeTeamData.color]
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
              {headLine && (
                <>
                  {headLine && (
                    <Text style={styles.headlineText}>{headLine}</Text>
                  )}
                </>
              )}

              {/* Teams + Center Info */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  team={awayTeamData}
                  teamName={
                    awayTeamData.code ??
                    awayTeamData.shortName ??
                    awayTeamData.name ??
                    "Away"
                  }
                  rank={
                    getTeamRank(awayEspnId ?? "") != null
                      ? Number(getTeamRank(awayEspnId ?? ""))
                      : undefined
                  }
                  score={displayAwayScore}
                  opponentScore={displayHomeScore} // 👈 add this
                  record={awayRecord?.overall ?? "0-0"}
                  isDark={isDark}
                  gameStatusDescription={gameStatusDescription || gameStatus}
                  possessionTeamId={
                    possessionTeamId !== undefined
                      ? String(possessionTeamId)
                      : undefined
                  }
                  side="away"
                  timeouts={awayTimeouts ?? 0} // ✅ fallback to 0
                  lighter
                />

                <CFBCenterInfo
                  week={gameInfo?.week ?? "0"} // fallback
                  status={gameStatus}
                  date={displayDateStr}
                  time={displayTimeStr}
                  period={formatPeriod(period ?? gameInfo.status.short ?? "")}
                  clock={displayClock ?? gameInfo?.status?.timer ?? ""}
                  isDark={isDark}
                  homeTeam={homeTeamData}
                  awayTeam={awayTeamData}
                  colors={colorsRecord}
                  lighter
                  apiDate={apiDateStr}
                  downAndDistance={downDistanceText ?? ""}
                  broadcasts={broadcast ?? ""}
                  gameStatusDescription={gameStatusDescription ?? gameStatus}
                  gameStatusShortDetail={gameStatusShortDetail ?? ""}
                  redzone={redzone ?? false}
                />

                <TeamInfo
                  team={homeTeamData}
                  teamName={
                    homeTeamData.code ??
                    homeTeamData.shortName ??
                    homeTeamData.name ??
                    "Home"
                  }
                  rank={
                    getTeamRank(homeEspnId ?? "") != null
                      ? Number(getTeamRank(homeEspnId ?? ""))
                      : undefined
                  }
                  score={displayHomeScore}
                  opponentScore={displayAwayScore} // 👈 add this
                  record={homeRecord?.overall ?? "0-0"}
                  isDark={isDark}
                  gameStatusDescription={gameStatusDescription || gameStatus}
                  possessionTeamId={
                    possessionTeamId !== undefined
                      ? String(possessionTeamId)
                      : undefined
                  }
                  side="home"
                  timeouts={homeTimeouts ?? 0}
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
                  {homeTeamData &&
                    awayTeamData &&
                    gameStatus !== "Scheduled" && (
                      <>
                        <LineScore
                          linescore={linescore}
                          homeCode={homeTeamData.code ?? "HOM"}
                          awayCode={awayTeamData.code ?? "AWY"}
                          lighter
                        />

                        <GameLeaders
                          gameId={String(gameInfo.id)}
                          homeTeamId={String(homeTeamData.id)}
                          awayTeamId={String(awayTeamData.id)}
                          lighter
                          league="CFB"
                        />
                      </>
                    )}

                  <TeamDrives
                    previousDrives={previousDrives ?? []}
                    currentDrives={currentDrives ?? []}
                    homeTeamId={Number(homeEspnId)}
                    awayTeamId={Number(awayEspnId)}
                    league="CFB"
                    lighter
                  />

                  <LastFiveGamesSwitcher
                    isDark={true}
                    lighter
                    home={{
                      teamCode: homeTeamData?.code ?? "",
                      teamLogo: homeTeamData?.logo,
                      teamLogoLight: homeTeamData?.logoLight, // 👈 leave undefined if missing
                      games: homeLastGames.games,
                    }}
                    away={{
                      teamCode: awayTeamData?.code ?? "",
                      teamLogo: awayTeamData?.logo,
                      teamLogoLight: awayTeamData?.logoLight, // 👈 leave undefined
                      games: awayLastGames.games,
                    }}
                    league="CFB"
                  />

                  {matchup.data && (
                    <CFBSeriesHistory
                      team1Name={awayTeamData.code}
                      team2Name={homeTeamData.code}
                      team1Wins={matchup.data.team1Wins}
                      team2Wins={matchup.data.team2Wins}
                      team1Logo={awayTeamData.logoLight || awayTeamData.logo}
                      team2Logo={homeTeamData.logoLight || homeTeamData.logo}
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
