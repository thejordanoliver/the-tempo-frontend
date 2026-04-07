import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { neutralVenues } from "constants/neutralVenues";
import { getNBATeam } from "constants/teams";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useLastFiveGames } from "hooks/NBAHooks/useLastFiveGames";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";

import { Game } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";
import { Colors } from "constants/styles";
type Props = {
  visible: boolean;
  game: Game;
  onClose: () => void;
};

export default function SummerLeagueGamePreviewModal({
  visible,
  game,
  onClose,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);
  const dateObj = new Date(game.date);

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime =
    dateObj?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const isChampionship =
    dateObj.getMonth() === 5 &&
    dateObj.getDate() >= 5 &&
    dateObj.getDate() <= 22;

  const isChristmasDay = dateObj.getMonth() === 11 && dateObj.getDate() === 25;
  const isNewYearsDay = dateObj.getMonth() === 0 && dateObj.getDate() === 1;
  const holidayLabel = isChristmasDay
    ? "Christmas Day"
    : isNewYearsDay
      ? "New Year's Day"
      : null;

  const styles = gamePreviewModalStyle(isChampionship);

  // --- Safeguard ---
  if (!game) return null;

  // --- Fetch playoff info ---
  const home = getNBATeam(game.home?.id);
  const away = getNBATeam(game.away?.id);

  const homeId = Number(home?.id) || 0;
  const awayId = Number(away?.id) || 0;

  const homeName = home?.code ?? home?.name ?? "";
  const awayName = away?.code ?? home?.name ?? "";

  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";

  // --- Team stats, weather, details ---
  const { data: gameStats } = useGameStatistics(game?.id ?? 0);

  // --- Weather + Broadcasts ---
  const neutralVenueData = neutralVenues[game?.venue?.name ?? ""];
  const lat = neutralVenueData?.latitude ?? home?.latitude ?? null;
  const lon = neutralVenueData?.longitude ?? home?.longitude ?? null;
  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    new Date(game.date).toISOString(),
  );

  // --- Handle modal visibility safely ---
  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.present());
    } else {
      requestAnimationFrame(() => sheetRef.current?.dismiss());
    }
  }, [visible]);

  // --- Live scores + LineScore logic ---
  const { score: liveScore, details } = useGameDetails(
    "nba",
    home?.espnID?.toString(),
    away?.espnID?.toString(),
    new Date(game.date).toISOString().split("T")[0],
  );
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const homeTimeouts = liveScore?.timeouts.home ?? 0;
  const awayTimeouts = liveScore?.timeouts.away ?? 0;
  const fouls = liveScore?.fouls;
  const awayBonus = fouls?.away?.bonusState;
  const homeBonus = fouls?.home?.bonusState;
  const injuries = details?.injuries ?? [];
  const officials = details?.officials ?? [];
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const headline = headlineText || holidayLabel;

  // Team records
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  // --- Broadcasts ---
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

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

  // --- Venue memoization ---
  const {
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
      neutralVenueData?.venueImage || home?.venueImage || "";
    neutralVenues[game?.venue?.city ?? ""] ||
      neutralVenues[home?.code ?? ""] ||
      home?.venueImage;

    return {
      resolvedVenueImage,
      resolvedVenueName,
      resolvedVenueCity,
      resolvedVenueAddress,
      resolvedVenueCapacity,
    };
  }, [game, home, neutralVenueData]);

  const homeLastGames = useLastFiveGames(homeId);
  const awayLastGames = useLastFiveGames(awayId);

  // --- Clock display ---
  const period = liveScore?.period ?? game.status?.short;
  const displayClock = liveScore?.displayClock ?? game.status?.clock;

  const isLiveScoreReady = !!liveScore;
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
              ? [Colors.dark.gold, Colors.dark.gold]
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
          {!isLiveScoreReady ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator isDark />
            </View>
          ) : (
            <>
              {headline && (
                <>
                  {headline && (
                    <Text style={styles.headlineText}>{headline}</Text>
                  )}
                </>
              )}

              {/* --- Header Section --- */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  team={away}
                  teamName={awayName}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  side="away"
                  timeouts={awayTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  bonusState={awayBonus}
                />

                <CenterInfo
                  isChampionship={isChampionship}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcastNetworks={broadcastText}
                  period={period}
                  clock={displayClock}
                  time={formattedTime}
                  formattedDate={formattedDate}
                  isDark={isDark}
                  lighter
                />

                <TeamInfo
                  team={home}
                  teamName={homeName}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  side="home"
                  timeouts={homeTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  bonusState={homeBonus}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  game={game}
                  home={home}
                  away={away}
                  lineScore={lineScore}
                  gameStats={gameStats}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  injuries={injuries}
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
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
