// ./NFL/GamePreview/NFLGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  LastFiveGamesSwitcher,
  TeamLocationSection,
} from "components/GameDetails";
import LineScore from "components/GameDetails/LineScore";
import Weather from "components/GameDetails/Weather";

import Officials from "components/GameDetails/Officials";
import { NFLCenterInfo } from "components/NFL/GamePreview/CenterInfo";
import {
  getNFLTeamsLogo,
  getTeamInfo,
  neutralStadiums,
  teams,
  venueImages,
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
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { useWeatherForecast } from "hooks/useWeather";

import { getGameDate, getNFLGameStatus } from "utils/nflGameCardUtils";

import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModal";
import { emptyNFLAwayTeam, emptyNFLHomeTeam, Game } from "types/nfl";

// --------------------------------------------------------------
// 🧠 MATCHED LOGIC FROM NFLGameCard
// --------------------------------------------------------------

function detectEndOfPeriod(statusText?: string) {
  const text = (statusText ?? "").toLowerCase();
  return (
    text.includes("end of") &&
    (text.includes("quarter") || text.includes("qtr"))
  );
}

function getESPNPeriodCode(period?: number) {
  if (!period) return undefined;
  if (period <= 4) return `Q${period}`;
  const ot = period - 4;
  return ot === 1 ? "OT" : `${ot}OT`;
}

function mapNFLStatus(statusObj: any): string {
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
  if (long.includes("in") && long.includes("play")) return "In Play";
  if (long.includes("scheduled")) return "Scheduled";
  if (long.includes("canceled")) return "Canceled";
  if (long.includes("delayed")) return "Delayed";
  if (long.includes("postponed")) return "Postponed";

  if (["Q1", "Q2", "Q3", "Q4", "OT"].includes(short)) return "In Play";

  return "Scheduled";
}

function formatNFLPeriod(period?: number | string) {
  if (!period) return "Live";

  const num = Number(period);

  if (num <= 4) return ["1st", "2nd", "3rd", "4th"][num - 1] ?? `${num}`;

  // Overtime logic
  const ot = num - 4;
  return ot === 1 ? "OT" : `${ot}OT`;
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

  // Determine live
  const prelimLive =
    mappedStatus === "In Play" ||
    statusObj?.isLive ||
    String(statusObj?.short).toUpperCase() === "LIVE";

  function normalizePeriod(period: string | number | undefined): number | null {
    if (period == null) return null;
    const n = Number(period);
    return isNaN(n) ? null : n;
  }

  // Possession hook (MATCHED)
  const possession = prelimLive
    ? useNFLGamePossession(homeTeamData.name, awayTeamData.name, apiDateStr)
    : null;

  const liveText = (possession?.gameStatusDescription ?? "").toLowerCase();
  const endOfPeriod = detectEndOfPeriod(liveText);

  const effectiveStatus = endOfPeriod
    ? "EndOfPeriod"
    : liveText.includes("final")
    ? "Final"
    : liveText.includes("halftime")
    ? "Halftime"
    : liveText.includes("qtr") ||
      liveText.includes("quarter") ||
      liveText.includes("in progress")
    ? "In Play"
    : mappedStatus;

  const isScheduled = effectiveStatus === "Scheduled";
  const isFinal = effectiveStatus === "Final";
  const isLive = effectiveStatus === "In Play";

  // --------------------------------------------------------------
  // SCORE
  // --------------------------------------------------------------
  const score = possession?.score ?? {
    home: { total: scores?.home?.total ?? 0 },
    away: { total: scores?.away?.total ?? 0 },
  };

  const period = possession?.period;
  const displayClock = possession?.displayClock ?? "";

  // --------------------------------------------------------------
  // HEADLINE + HOLIDAY
  // --------------------------------------------------------------
  const gameDate = new Date(apiDateStr);

  const isChristmas = gameDate.getMonth() === 11 && gameDate.getDate() === 25;
  const isNewYear = gameDate.getMonth() === 0 && gameDate.getDate() === 1;

  const holidayLabel = isChristmas
    ? "Christmas Day"
    : isNewYear
    ? "New Year's Day"
    : null;

  const { headlineText } = useGameInfo(
    Number(homeTeamData.espnID),
    Number(awayTeamData.espnID),
    apiDateStr,
    "nfl"
  );

  const headline = headlineText || holidayLabel;

  // --------------------------------------------------------------
  // RECORDS
  // --------------------------------------------------------------
  const { record: homeRecord } = useNFLTeamRecord(String(homeId));
  const { record: awayRecord } = useNFLTeamRecord(String(awayId));

  // --------------------------------------------------------------
  // LAST 5 GAMES
  // --------------------------------------------------------------
  const homeLastGames = useLastFiveGames(Number(homeId));
  const awayLastGames = useLastFiveGames(Number(awayId));

  // --------------------------------------------------------------
  // GAME DETAILS (DRIVES, OFFICIALS, INJURIES)
  // --------------------------------------------------------------
  const { officials, injuries, previousDrives, currentDrives, venue } =
    useNFLGameDetails(homeTeamData.espnID, awayTeamData.espnID, apiDateStr);

  // --------------------------------------------------------------
  // WEATHER
  // --------------------------------------------------------------
  const isNeutralSite =
    gameInfo.venue?.name &&
    ![homeTeamData.venue, awayTeamData.venue].includes(
      gameInfo.venue?.name ?? ""
    );

  const stadiumData = isNeutralSite
    ? neutralStadiums[gameInfo.venue?.name ?? ""]
    : homeTeamData;

  const { weather } = useWeatherForecast(
    stadiumData.latitude ?? 0,
    stadiumData.longitude ?? 0,
    apiDateStr,
    stadiumData.city
  );

  const displayWeather = weather
    ? { ...weather, cityName: stadiumData.city }
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
          {headline && <Text style={styles.headlineText}>{headline}</Text>}

          {/* HEADER */}
          <View style={styles.gameHeaderContainer}>
            <TeamInfo
              team={awayTeamData}
              teamName={awayTeamData.code}
              score={score.away.total}
              opponentScore={score.home.total}
              record={awayRecord?.overall ?? "0-0"}
              isDark={isDark}
              isGameOver={isFinal}
              hasStarted={!isScheduled}
              possessionTeamId={possession?.possessionTeamId}
              side="away"
              timeouts={possession?.awayTimeouts ?? 0}
            />

            <NFLCenterInfo
              status={
                effectiveStatus === "In Play" ? "In Progress" : effectiveStatus
              }
              week={gameInfo.week}
              date={formattedDate}
              time={formattedTime}
              period={getESPNPeriodCode(possession?.period) || ""}
              clock={displayClock}
              isDark={isDark}
              homeTeam={homeTeamData}
              awayTeam={awayTeamData}
              colors={{ text: "", record: "", score: "", winnerScore: "" }}
              lighter
              apiDate={apiDateStr}
              downAndDistance={possession?.downDistanceText ?? ""}
              isPlayoff={isChampionship}
            />

            <TeamInfo
              team={homeTeamData}
              teamName={homeTeamData.code}
              score={score.home.total}
              opponentScore={score.away.total}
              record={homeRecord?.overall ?? "0-0"}
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
              <LineScore
                linescore={linescore}
                homeCode={homeTeamData.code}
                awayCode={awayTeamData.code}
                lighter
              />

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

              <NFLInjuries
                injuries={injuries}
                loading={false}
                error={null}
                awayTeamAbbr={awayTeamData.code}
                homeTeamAbbr={homeTeamData.code}
                lighter
              />

              {!isScheduled && (
                <Officials
                  officials={officials}
                  loading={false}
                  error={null}
                  lighter
                />
              )}

              <TeamLocationSection
                venueImage={
                  isNeutralSite
                    ? venueImages[gameInfo.venue?.name ?? ""] ||
                      venueImages[gameInfo.venue?.city ?? ""]
                    : homeTeamData.venueImage
                }
                venueName={
                  isNeutralSite
                    ? neutralStadiums[gameInfo?.venue?.name ?? ""]?.name
                    : homeTeamData.venue
                }
                location={
                  isNeutralSite ? gameInfo.venue?.city : homeTeamData.location
                }
                address={
                  isNeutralSite
                    ? neutralStadiums[gameInfo.venue?.name ?? ""]?.address ?? ""
                    : homeTeamData.address ?? ""
                }
                venueCapacity={
                  isNeutralSite
                    ? neutralStadiums[gameInfo.venue?.name ?? ""]
                        ?.venueCapacity ?? ""
                    : homeTeamData.venueCapacity
                }
                surface="football"
                grass={venue?.grass ?? true}
                loading={false}
                error={null}
                lighter
              />

              {!isScheduled && (
                <Weather
                  weather={displayWeather}
                  address={stadiumData.city}
                  loading={false}
                  error={null}
                  lighter
                />
              )}
            </View>
          </BottomSheetScrollView>
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
