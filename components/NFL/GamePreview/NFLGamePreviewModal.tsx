// ./NFL/GamePreview/NFLGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { GameLocation, LastFiveGamesSwitcher } from "components/GameDetails";
import LineScore from "components/GameDetails/LineScore";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import Officials from "components/GameDetails/Officials";
import { NFLCenterInfo } from "components/NFL/GamePreview/CenterInfo";
import {
  getNFLTeamsLogo,
  getTeamInfo,
  neutralStadiums,
  teams,
} from "constants/teamsNFL";
import { NFLTeam } from "types/nfl";
import GameLeaders from "../GameDetails/GameLeaders";
import NFLInjuries from "../GameDetails/NFLInjuries";
import NFLSeriesHistory from "../GameDetails/NFLSeriesHistory";
import NFLTeamDrives from "../GameDetails/TeamDrives";
import TeamInfo from "./TeamInfo";

import { useNFLMatchup } from "hooks/NFLHooks/useNFLMatchup";
import { transformNFLSeriesGames } from "utils/NFLUtils/transformSeriesGame";

import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useLastFiveGames } from "hooks/NFLHooks/useLastFiveGames";
import { useNFLGameDetails } from "hooks/NFLHooks/useNFLGameDetails";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { useWeatherForecast } from "hooks/useWeather";

import { getGameDate, getNFLGameStatus } from "utils/nflGameCardUtils";

import CustomActivityIndicator from "components/CustomActivityIndicator";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModalStyles";
import { emptyNFLAwayTeam, emptyNFLHomeTeam, Game } from "types/nfl";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";

// --------------------------------------------------------------
// 🧠 MATCHED LOGIC FROM NFLGameCard
// --------------------------------------------------------------

const formatPeriod = (raw: string | number | undefined | null) => {
  if (!raw) return "";

  // 🔥 FIX: if raw is "5" or "6", convert to number
  if (typeof raw === "string" && /^\d+$/.test(raw)) {
    raw = Number(raw);
  }

  // ----- STRING CASES -----
  if (typeof raw === "string") {
    const upper = raw.toUpperCase();

    if (upper === "OT" || upper === "OVERTIME") return "OT";
    if (upper === "HT") return "Halftime";
    if (upper === "FT") return "Final";

    if (upper.includes("END")) {
      const quarterNum = upper.match(/(\d)/)?.[1];
      if (quarterNum) {
        return `End ${
          quarterNum === "1"
            ? "1st"
            : quarterNum === "2"
            ? "2nd"
            : quarterNum === "3"
            ? "3rd"
            : "4th"
        }`;
      }
      return "End";
    }

    if (upper.startsWith("Q")) {
      const num = parseInt(upper.replace("Q", ""));
      return num === 1
        ? "1st"
        : num === 2
        ? "2nd"
        : num === 3
        ? "3rd"
        : num === 4
        ? "4th"
        : `${num}OT`;
    }

    return raw;
  }

  // ----- NUMBER CASES -----
  if (typeof raw === "number") {
    if (raw >= 1 && raw <= 4) {
      return raw === 1 ? "1st" : raw === 2 ? "2nd" : raw === 3 ? "3rd" : "4th";
    }

    const ot = raw - 4;
    return ot === 1 ? "OT" : `${ot}OT`;
  }

  return String(raw);
};

function mapNFLStatus(
  statusObj: any
):
  | "Final"
  | "Halftime"
  | "Scheduled"
  | "Canceled"
  | "Delayed"
  | "Postponed"
  | "In Progress" {
  const long = statusObj?.long?.toLowerCase?.() ?? "";
  const short = String(statusObj?.short ?? "").toUpperCase();

  if (
    long.includes("final") ||
    short === "F" ||
    short === "FT" ||
    short === "FINAL"
  )
    return "Final";

  if (long.includes("halftime") || short === "HT") return "Halftime";
  if (long.includes("in") && long.includes("play")) return "In Progress";
  if (long.includes("scheduled")) return "Scheduled";
  if (long.includes("canceled")) return "Canceled";
  if (long.includes("delayed")) return "Delayed";
  if (long.includes("postponed")) return "Postponed";

  if (["Q1", "Q2", "Q3", "Q4", "OT"].includes(short)) return "In Progress";

  // Default fallback
  return "Scheduled";
}

// --------------------------------------------------------------
// 🚀 MODAL COMPONENT
// --------------------------------------------------------------
export default function NFLGamePreviewModal({
  game,
  visible,
  onClose,
}: {
  game: Game;
  visible: boolean;
  onClose: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const sheetRef = useRef<BottomSheetModal>(null);

  const gameInfo = game.game;
  const scores = game.scores;

  const isChampionship = gameInfo.week?.includes("Super Bowl");
  const styles = gamePreviewModalStyle(isChampionship);

  // --------------------------------------------------------------
  // 🕒 DATE (MATCHING CARD LOGIC)
  // --------------------------------------------------------------
  const {
    iso: apiDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(gameInfo.date.timestamp);

  // --------------------------------------------------------------
  // TEAM DATA (MATCHING CARD STYLE)
  // --------------------------------------------------------------
  const homeId = game.teams.home.id ?? emptyNFLHomeTeam.id;
  const awayId = game.teams.away.id ?? emptyNFLAwayTeam.id;

  const foundHome = teams.find((t) => t.id === homeId);
  const foundAway = teams.find((t) => t.id === awayId);

  const homeTeamData: NFLTeam = {
    ...emptyNFLHomeTeam,
    ...(foundHome || {}),
    espnID: foundHome?.espnID ?? emptyNFLHomeTeam.espnID,
    logo: getNFLTeamsLogo(foundHome?.code, false),
    logoLight: getNFLTeamsLogo(foundHome?.code, true),
  };

  const awayTeamData: NFLTeam = {
    ...emptyNFLAwayTeam,
    ...(foundAway || {}),
    espnID: foundAway?.espnID ?? emptyNFLAwayTeam.espnID,
    logo: getNFLTeamsLogo(foundAway?.code, false),
    logoLight: getNFLTeamsLogo(foundAway?.code, true),
  };

  // --------------------------------------------------------------
  // 🧠 STATUS MAPPING (SAME AS GAME CARD)
  // --------------------------------------------------------------
  const statusObj = getNFLGameStatus(game);
  const mappedStatus = mapNFLStatus(statusObj);

  // Possession hook (MATCHED)
  const possession = useFootballGamePossession(
    homeTeamData.espnID,
    awayTeamData.espnID,
    apiDateStr,
    "nfl"
  );

  const possessionLoading = possession.loading;
  const liveText = (possession?.gameStatusDescription ?? "").toLowerCase();
  const gameStatusDescription = possession?.gameStatusDescription;
  const gameStatusShortDetail = possession?.gameStatusShortDetail;

  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const isLive = gameStatusDescription === "In Progress";

  // --------------------------------------------------------------
  // SCORE
  // --------------------------------------------------------------

  const homeScore = possession.score?.home ?? 0;
  const awayScore = possession.score?.away ?? 0;

  const period = possession?.period;
  const displayClock = possession?.displayClock ?? "";

  // --------------------------------------------------------------
  // HEADLINE + HOLIDAY
  // --------------------------------------------------------------
  const gameDate = new Date(apiDateStr);

  const { headlineText } = useGameInfo(
    Number(homeTeamData.espnID),
    Number(awayTeamData.espnID),
    apiDateStr,
    "nfl"
  );

  const isChristmas = gameDate.getMonth() === 11 && gameDate.getDate() === 25;
  const isNewYear = gameDate.getMonth() === 0 && gameDate.getDate() === 1;

  const holidayLabel = isChristmas
    ? "Christmas Day"
    : isNewYear
    ? "New Year's Day"
    : null;

  const headline = headlineText || holidayLabel;

  // --------------------------------------------------------------
  // RECORDS
  // --------------------------------------------------------------
  const homeRecord = useNFLTeamRecord(String(homeId)).record.overall ?? "0-0";
  const awayRecord = useNFLTeamRecord(String(awayId)).record.overall ?? "0-0";

  // --------------------------------------------------------------
  // LAST 5 GAMES
  // --------------------------------------------------------------
  const homeLastGames = useLastFiveGames(Number(homeId));
  const awayLastGames = useLastFiveGames(Number(awayId));

  // --------------------------------------------------------------
  // GAME DETAILS (DRIVES, OFFICIALS, INJURIES)
  // --------------------------------------------------------------
  const {
    officials,
    injuries,
    previousDrives,
    currentDrives,
    venue,
    neutralSite,
    highlights = [], // <-- default to empty array here
  } = useNFLGameDetails(
    String(homeTeamData.espnID),
    String(awayTeamData.espnID),
    apiDateStr
  );

  const { data: details, loading: gameDetailsLoading } = useFootballGameDetails(
    String(homeTeamData.espnID),
    String(awayTeamData.espnID),
    apiDateStr,
    "nfl"
  );


  const { broadcasts } = useNFLGameBroadcasts(
    homeTeamData.espnID,
    awayTeamData.espnID,
    apiDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts); // --------------------------------------------------------------
  // WEATHER
  // --------------------------------------------------------------
  // --- Neutral Site Detection Using neutralStadiums ---
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralStadiumEntry = Object.entries(neutralStadiums).find(
    ([stadiumName]) => stadiumName.trim().toLowerCase() === normalizedVenueName
  );

  // Stadium-lookup detection (fallback only)
  const isNeutralStadiumMatch = !!neutralStadiumEntry;

  // Safely extract stadium override data
  const neutralStadiumData = isNeutralStadiumMatch
    ? neutralStadiumEntry![1]
    : null;
  const neutralStadiumName = isNeutralStadiumMatch
    ? neutralStadiumEntry![0]
    : null;

  // --- Final Venue Resolution ---
  let resolvedVenueName =
    venue?.name ?? homeTeamData?.venue ?? "Unknown Stadium";
  let resolvedVenueCity = homeTeamData?.city ?? "Unknown City";
  let resolvedVenueAddress = homeTeamData?.address ?? "";
  let resolvedVenueCapacity = homeTeamData?.venueCapacity?.toString() ?? "";
  let resolvedVenueImage = isNeutralStadiumMatch
    ? venue?.image
    : homeTeamData.venueImage ?? venue?.image;
  let lat = homeTeamData?.latitude ?? null;
  let lon = homeTeamData?.longitude ?? null;

  if (neutralSite && neutralStadiumData) {
    resolvedVenueName = neutralStadiumName ?? resolvedVenueName;
    resolvedVenueCity = neutralStadiumData.city ?? resolvedVenueCity;
    resolvedVenueAddress = neutralStadiumData.address ?? resolvedVenueAddress;
    resolvedVenueCapacity =
      neutralStadiumData.venueCapacity?.toString() ?? resolvedVenueCapacity;
    resolvedVenueImage = neutralStadiumData.venueImage ?? resolvedVenueImage;
    lat = neutralStadiumData.latitude ?? lat;
    lon = neutralStadiumData.longitude ?? lon;
  }
  const isNeutralSite =
    gameInfo?.venue?.name &&
    ![homeTeamData?.venue, awayTeamData?.venue].includes(gameInfo.venue.name);

  const stadiumData = isNeutralSite
    ? neutralStadiums[gameInfo?.venue?.name ?? ""]
    : homeTeamData;

  const { weather } = useWeatherForecast(
    lat,
    lon,
    apiDateStr,
    stadiumData?.city ?? ""
  );

  const displayWeather = weather
    ? { ...weather, cityName: stadiumData?.city ?? "Unknown" }
    : null;

  // --------------------------------------------------------------
  // SERIES HISTORY
  // --------------------------------------------------------------
  const { data: matchup } = useNFLMatchup(homeTeamData.code, awayTeamData.code);

  const seriesGames = useMemo(() => {
    if (!matchup?.games) return [];
    return transformNFLSeriesGames(matchup.games);
  }, [matchup]);

  // --------------------------------------------------------------
  // LINESCORE
  // --------------------------------------------------------------
  const linescore = useMemo(() => {
    const homeP = [
      scores.home?.quarter_1,
      scores.home?.quarter_2,
      scores.home?.quarter_3,
      scores.home?.quarter_4,
    ];
    const awayP = [
      scores.away?.quarter_1,
      scores.away?.quarter_2,
      scores.away?.quarter_3,
      scores.away?.quarter_4,
    ];

    if (scores.home?.overtime != null) homeP.push(scores.home.overtime);
    if (scores.away?.overtime != null) awayP.push(scores.away.overtime);

    return {
      home: homeP.map((v) => (v != null ? String(v) : "-")),
      away: awayP.map((v) => (v != null ? String(v) : "-")),
    };
  }, [scores]);

  // --------------------------------------------------------------
  // SHEET VISIBILITY
  // --------------------------------------------------------------
  const snapPoints = useMemo(() => ["60%", "80%", "92%"], []);

  useEffect(() => {
    visible ? sheetRef.current?.present() : sheetRef.current?.dismiss();
  }, [visible]);

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
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* HEADER */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  team={awayTeamData}
                  teamName={awayTeamData.code}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  isDark={isDark}
                  isGameOver={isFinal}
                  hasStarted={!isScheduled}
                  possessionTeamId={possession?.possessionTeamId}
                  side="away"
                  timeouts={possession?.awayTimeouts ?? 0}
                />

                <NFLCenterInfo
                  broadcasts={broadcastText}
                  week={gameInfo.week}
                  date={formattedDate}
                  time={formattedTime}
                  period={formatPeriod(period) ?? ""}
                  clock={displayClock}
                  homeTeam={homeTeamData}
                  awayTeam={awayTeamData}
                  apiDate={apiDateStr}
                  downAndDistance={possession?.downDistanceText ?? ""}
                  redzone={possession?.redzone ?? false}
                  gameStatusShortDetail={gameStatusShortDetail ?? ""}
                  status={mappedStatus} // ← use mapped string here
                  gameStatusDescription={gameStatusDescription ?? ""} // ← default to empty string
                />

                <TeamInfo
                  team={homeTeamData}
                  teamName={homeTeamData.code}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  isDark={isDark}
                  isGameOver={isFinal}
                  hasStarted={!isScheduled}
                  possessionTeamId={possession?.possessionTeamId}
                  side="home"
                  timeouts={possession?.homeTimeouts ?? 0}
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
                      linescore={linescore}
                      homeCode={homeTeamData.code}
                      awayCode={awayTeamData.code}
                      lighter
                    />
                  )}
                  {!isScheduled && (
                    <GameLeaders
                      gameId={String(gameInfo.id)}
                      homeTeamId={String(homeTeamData.id)}
                      awayTeamId={String(awayTeamData.id)}
                      lighter
                      league="NFL"
                    />
                  )}

                  <NFLTeamDrives
                    previousDrives={previousDrives}
                    currentDrives={currentDrives}
                    homeTeamId={Number(homeTeamData.espnID)}
                    awayTeamId={Number(awayTeamData.espnID)}
                    lighter
                  />

                  <LastFiveGamesSwitcher
                    isDark={isDark}
                    home={{
                      teamCode: homeTeamData.code,
                      teamLogo: homeTeamData.logo,
                      teamLogoLight: homeTeamData.logoLight,
                      games: homeLastGames.games,
                    }}
                    away={{
                      teamCode: awayTeamData.code,
                      teamLogo: awayTeamData.logo,
                      teamLogoLight: awayTeamData.logoLight,
                      games: awayLastGames.games,
                    }}
                    league="NFL"
                    lighter
                  />

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
                      awayTeamId={awayTeamData.espnID}
                      homeTeamId={homeTeamData.espnID}
                      awayTeamAbbr={awayTeamData.code}
                      homeTeamAbbr={homeTeamData.code}
                      lighter
                    />
                  )}

                  <Officials
                    officials={officials}
                    loading={false}
                    error={null}
                    lighter
                  />

                  {highlights.length > 0 && (
                    <HighlightVideoList highlights={highlights} lighter />
                  )}
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
