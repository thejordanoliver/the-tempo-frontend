import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { neutralVenues, teams, venueImages } from "constants/teams";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameDetails } from "hooks/CBBHooks/useGameDetails";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameInfo } from "hooks/useGameInfo";
import { useGameScores } from "hooks/useGameScores";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useLastFiveGames } from "hooks/useLastFiveGames";
import { useFetchPlayoffGames } from "hooks/usePlayoffSeries";
import { useTeamRecord } from "hooks/useTeamRecords";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModal";
import { Game } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  visible: boolean;
  game: Game;
  onClose: () => void;
};

export default function GamePreviewModal({ visible, game, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);
  const dateObj = new Date(game.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const isChampionship =
    dateObj.getMonth() === 5 &&
    dateObj.getDate() >= 5 &&
    dateObj.getDate() <= 22;

  const styles = gamePreviewModalStyle(isChampionship);

  // --- Safeguard ---
  if (!game) return null;

  // --- Fetch playoff info ---
  const home = teams.find((t) => String(t.id) === String(game.home?.id));
  const away = teams.find((t) => String(t.id) === String(game.away?.id));
  const homeId = Number(home?.id) || 0;
  const awayId = Number(away?.id) || 0;
  const { games: playoffGames } = useFetchPlayoffGames(homeId, awayId, 2025);

  const currentPlayoffGame = useMemo(
    () => playoffGames?.find((g) => g.id === game.id),
    [playoffGames, game]
  );
  const seriesSummary = currentPlayoffGame?.seriesSummary;
  const gameNumberLabel = currentPlayoffGame?.gameNumber
    ? `Game ${currentPlayoffGame.gameNumber}`
    : undefined;

  // --- Team stats, weather, details ---
  const { data: gameStats } = useGameStatistics(game?.id ?? 0);

  const { record: homeRecord } = useTeamRecord(home?.espnID);
  const { record: awayRecord } = useTeamRecord(away?.espnID);

  const { headlineText } = useGameInfo(
    Number(home?.espnID),
    Number(away?.espnID),
    new Date(game.date).toISOString()
  );

  // --- Weather + Broadcasts ---
  const neutralVenueData = neutralVenues[game?.venue?.name ?? ""];
  const lat = neutralVenueData?.latitude ?? home?.latitude ?? null;
  const lon = neutralVenueData?.longitude ?? home?.longitude ?? null;
  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    new Date(game.date).toISOString()
  );
  const { broadcasts } = useGameBroadcasts(
    home?.name ?? "",
    away?.name ?? "",
    new Date(game.date).toISOString()
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  // --- Snap points ---
  const snapPoints = useMemo(() => ["60%", "80%", "88%", "94%"], []);

  // --- Handle modal visibility safely ---
  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.present());
    } else {
      requestAnimationFrame(() => sheetRef.current?.dismiss());
    }
  }, [visible]);

  // --- Game states ---
  const isFinal = game?.status?.long === "Finished";
  const isCanceled = game?.status?.long === "Canceled";
  const showLiveInfo =
    game?.status?.long !== "Scheduled" && game?.status?.long !== "Finished";

  // --- Live scores + LineScore logic ---
  const { score: liveScore } = useGameScores(
    "nba",
    home?.espnID?.toString(),
    away?.espnID?.toString(),
    new Date(game.date).toISOString().split("T")[0]
  );

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : game?.linescore?.home?.length
    ? {
        home: game.linescore.home.map((v) => v.toString()),
        away: game.linescore.away.map((v) => v.toString()),
      }
    : undefined;

  // --- Colors + Venue memoization ---
  const {
    homeColor,
    awayColor,
    resolvedVenueImage,
    resolvedVenueName,
    resolvedVenueCity,
    resolvedVenueAddress,
    resolvedVenueCapacity,
  } = useMemo(() => {
    const cleanedVenueName = game?.venue?.name
      ?.replace(/\s*\(.*?\)/, "")
      .trim();
    const resolvedVenueName = cleanedVenueName || home?.venueName || "";
    const resolvedVenueCity = game?.venue?.city ?? home?.location ?? "";
    const resolvedVenueAddress =
      neutralVenueData?.address || home?.address || "";
    const resolvedVenueCapacity =
      neutralVenueData?.venueCapacity || home?.venueCapacity || "";
    const resolvedVenueImage =
      neutralVenueData?.venueImage ||
      venueImages[game?.venue?.name ?? ""] ||
      venueImages[game?.venue?.city ?? ""] ||
      venueImages[home?.code ?? ""] ||
      home?.venueImage;

    const getTeamColor = (team?: (typeof teams)[number]) => {
      if (!team) return "#444";
      const { code, color, secondaryColor } = team;
      if (code === "SAS") return secondaryColor || "#fff";
      return color || "#444";
    };

    return {
      homeColor: getTeamColor(home),
      awayColor: getTeamColor(away),
      resolvedVenueImage,
      resolvedVenueName,
      resolvedVenueCity,
      resolvedVenueAddress,
      resolvedVenueCapacity,
    };
  }, [game, home, neutralVenueData]);

  const totalPeriodsPlayed =
    game.linescore?.home?.length ??
    game.linescore?.away?.length ??
    game.periods?.current;

  const homeLastGames = useLastFiveGames(homeId);
  const awayLastGames = useLastFiveGames(awayId);

  const {
    officials,
    injuries,
    highlights,
    loading: officialsLoading,
    error: officialsError,
  } = useGameDetails(
    "nba",
    home?.espnID,
    away?.espnID,
    new Date(game.date).toISOString().split("T")[0]
  );

  // --- Clock display ---
  const displayClock = liveScore?.displayClock ?? game.status?.clock;
  const displayPeriod = liveScore?.period ?? game.status?.short;

  // --- Quarter / period label + halftime flag ---
  const getQuarterLabel = (
    currentPeriod: number,
    totalPeriods: number = 4,
    statusText?: string
  ) => {
    if (statusText?.toLowerCase() === "halftime")
      return { label: "Halftime", halftime: true };

    switch (currentPeriod) {
      case 1:
        return { label: "1st", halftime: false };
      case 2:
        return { label: "2nd", halftime: false };
      case 3:
        return { label: "3rd", halftime: false };
      case 4:
        return { label: "4th", halftime: false };
      default:
        const otNumber = currentPeriod - totalPeriods;
        return { label: `OT${otNumber}`, halftime: false };
    }
  };

  const { label: quarterLabel, halftime } = getQuarterLabel(
    displayPeriod,
    4,
    liveScore?.statusText
  );

  const homeScore =
    liveScore?.home.total ?? game.scores?.home?.points ?? game.homeScore;
  const awayScore =
    liveScore?.away.total ?? game.scores?.visitors?.points ?? game.awayScore;

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableContentPanningGesture
      enableHandlePanningGesture
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
        {/* Background gradients */}
        <LinearGradient
          colors={
            isChampionship
              ? ["#DFBD69", "#CDA765"]
              : [awayColor, awayColor, homeColor, homeColor]
          }
          locations={isChampionship ? undefined : [0, 0.4, 0.6, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={
            isDark
              ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]
              : ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, .8)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <BlurView
          intensity={100}
          tint={"systemUltraThinMaterialDark"}
          style={styles.blurViewContainer}
        >
          <>
            {headlineText && (
              <>
                {headlineText && (
                  <Text style={styles.headlineText}>{headlineText}</Text>
                )}
              </>
            )}

            {/* --- Header Section --- */}
            <View style={styles.gameHeaderContainer}>
              <TeamInfo
                team={away}
                teamName={away?.code ?? ""}
                score={awayScore}
                opponentScore={homeScore}
                record={awayRecord?.overall ?? "-"}
                isDark={isDark}
                isGameOver={isFinal}
                isScheduled={game.status.long === "Scheduled"}
                side="away"
              />

              <CenterInfo
                isChampionship={isChampionship}
                isFinal={isFinal}
                isCanceled={isCanceled}
                isHalftime={halftime} // ✅ default to false
                broadcastNetworks={broadcastText}
                showLiveInfo={showLiveInfo}
                period={quarterLabel}
                endOfPeriod={game.periods?.endOfPeriod ?? false}
                totalPeriodsPlayed={totalPeriodsPlayed}
                time={game.time}
                clock={liveScore?.displayClock}
                formattedDate={formattedDate}
                isDark={isDark}
                gameNumberLabel={gameNumberLabel}
                seriesSummary={seriesSummary}
                isPlayoffs={!!seriesSummary}
                lighter
              />

              <TeamInfo
                team={home}
                teamName={home?.code ?? ""}
                score={homeScore}
                opponentScore={awayScore}
                record={homeRecord?.overall ?? "-"}
                isDark={isDark}
                isGameOver={isFinal}
                isScheduled={game.status.long === "Scheduled"}
                side="home"
              />
            </View>

            {/* --- Scrollable Content --- */}
            <GamePreviewContent
              game={game}
              home={home}
              away={away}
              lineScore={lineScore}
              homeLastGames={homeLastGames}
              awayLastGames={awayLastGames}
              injuries={injuries}
              gameStats={gameStats}
              officials={officials}
              resolvedVenueImage={resolvedVenueImage}
              resolvedVenueName={resolvedVenueName}
              resolvedVenueCity={resolvedVenueCity}
              resolvedVenueAddress={resolvedVenueAddress}
              resolvedVenueCapacity={resolvedVenueCapacity}
              weather={weather}
              weatherLoading={weatherLoading}
              weatherError={weatherError}
              isDark={isDark}
            />
          </>
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
