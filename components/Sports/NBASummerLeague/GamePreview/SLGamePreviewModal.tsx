import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { getNeutralVenue } from "constants/neutralVenues";
import { getTeamBySummerId } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BasketballGame } from "types/basketball";
import { getHolidayLabel } from "utils/dateUtils";
import { getBroadcastDisplay } from "utils/games";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";
type Props = {
  visible: boolean;
  game: BasketballGame;
  onClose: () => void;
};

export default function SummerLeagueGamePreviewModal({
  visible,
  game,
  onClose,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);
  const dateObj = new Date(game.date);
  const styles = gamePreviewModalStyle();
  /* ---------------- League ---------------- */

  const isLasVegas = game.league.name === "NBA - Las Vegas Summer League";

  /* ---------------- Teams ---------------- */

  const homeTeamId = Number(game?.teams?.home?.id);
  const awayTeamId = Number(game?.teams?.away?.id);

  const homeTeam = getTeamBySummerId(homeTeamId);
  const awayTeam = getTeamBySummerId(awayTeamId);

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const homeEspnId = homeTeam?.espnID ?? 0;
  const awayEspnId = awayTeam?.espnID ?? 0;

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const gameDateISO = dateObj.toISOString();
  const gameDateYMD = gameDateISO.split("T")[0];

  /* ---------------- Hooks ---------------- */
  const detailsLeague = isLasVegas ? "summerVegas" : "summerUtah";

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateYMD,
  );

  const isLoadingGame =
    !liveScore ||
    !details ||
    liveScore.home?.total == null ||
    liveScore.away?.total == null;

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const period = liveScore?.period ?? 0;
  const displayClock = liveScore?.displayClock;
  const fouls = liveScore?.fouls;
  const awayBonus = fouls?.away?.bonusState;
  const homeBonus = fouls?.home?.bonusState;
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const gameStats = liveScore?.teamStats;
  const headlineText = details?.headline;
  const holidayLabel = getHolidayLabel(dateObj);
  const headline = headlineText || holidayLabel;
  const officials = details?.officials ?? [];
  const neutralSite = details?.neutralSite;
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const homeTimeouts = liveScore?.timeouts.home ?? 0;
  const awayTimeouts = liveScore?.timeouts.away ?? 0;

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address ||
      `${baseVenue?.address.city} ${baseVenue?.address.state}, ${baseVenue?.address.zipCode} ${baseVenue?.address.country}`;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images[0]?.href
    : homeTeam?.venueImage || baseVenue?.images[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);
  const venueAttendance = details?.attendance || null;
  const { weather, weatherError, weatherLoading } = useWeatherForecast(
    venueLat,
    venueLon,
    gameDateISO,
  );

  /* ---------------- Status / linescore ---------------- */

  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;

  // --- Period scores / line score ---
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

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
          colors={[awayColor, awayColor, homeColor, homeColor]}
          locations={[0, 0.4, 0.6, 1]}
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
          {!isLoadingGame ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
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
                  team={awayTeam}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  side="away"
                  timeouts={awayTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  bonusState={awayBonus}
                />

                <CenterInfo
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
                  team={homeTeam}
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
                  gameStatusDescription={gameStatusDescription}
                  game={game}
                  home={homeTeam}
                  away={awayTeam}
                  lineScore={lineScore}
                  gameStats={gameStats}
                  officials={officials}
                  venueImage={venueImage}
                  venueName={venueName}
                  venueCity={venueLocation}
                  venueAddress={venueAddress}
                  venueAttendance={venueAttendance}
                  venueCapacity={venueCapacity}
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
