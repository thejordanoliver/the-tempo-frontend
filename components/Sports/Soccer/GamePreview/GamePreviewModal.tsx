import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useSoccerGameDetails } from "@/hooks/SoccerHooks/useSoccerGameDetails";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BasketballGame } from "@/types/basketball";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { getNeutralVenue } from "constants/neutralVenues";
import { Colors } from "constants/styles";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getHolidayLabel } from "utils/dateUtils";
import {
  formatQuarter,
  formatVenueAddress,
  getBroadcastDisplay,
} from "utils/games";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  visible: boolean;
  game: BasketballGame;
  onClose: () => void;
};

export default function GamePreviewModal({ visible, game, onClose }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.present());
    } else {
      requestAnimationFrame(() => sheetRef.current?.dismiss());
    }
  }, [visible]);

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);
  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime =
    gameDate?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const gameId = game.id;
   const LEAGUE = game?.league?.code ?? "epl";

  const { details, score } = useSoccerGameDetails(LEAGUE, gameId);

  const homeId = Number(game.home?.id);
  const awayId = Number(game.away?.id);

  const home = getSOCCTeam(homeId);
  const away = getSOCCTeam(awayId);

  const homeCode = home?.code || game.home?.shortName;
  const awayCode = away?.code || game.away?.shortName;
  const homeName = home?.fullName ?? "";
  const awayName = away?.fullName ?? "";

  const homeLogo = getSOCCTeamLogo(homeId, true);
  const awayLogo = getSOCCTeamLogo(awayId, true);

  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";

  const headlineText = game?.headline;
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = headlineText || holidayLabel;
  const isChampionship = headline?.includes("Final");
  const styles = gamePreviewModalStyle(isChampionship);

  const isGameLoading = !score || !details || !home || !away;
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const period = formatQuarter(game.status.period);
  const clock = game.status.clock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status.shortDetail;
  const isSuspended = gameStatusDescription === "Suspended";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";

  const dontShowDetails =
    isForfeited || isPostponed || isDelayed || isCanceled || isSuspended;
  const homeRecord = game.home.record ?? "0-0";
  const awayRecord = game.away.record ?? "0-0";
  const teamStats = score?.teamStats ?? [];
  const officials = details?.officials ?? [];

  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const homeLastGames = useLastFiveGames(homeId, "soccer", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "soccer", LEAGUE);

  /* ---------------- Neutral site / venue ---------------- */
  const neutralSite = details?.neutralSite;
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : home?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : home?.address || baseVenueAddress;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : home?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images?.[0]?.href
    : home?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : home?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (home?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (home?.longitude ?? 0);
  const venueAttendance = details?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, game.date);

  const homeScore = score?.home.total;
  const awayScore = score?.away.total;

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
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, .8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <BlurView
          intensity={100}
          tint={"systemUltraThinMaterialDark"}
          style={styles.blurViewContainer}
        >
          {isGameLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
            </View>
          ) : (
            <>
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* --- Header Section --- */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  logo={awayLogo}
                  name={awayCode}
                  rank={null}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  gameStatusDescription={gameStatusDescription}
                />

                <CenterInfo
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcast={broadcast}
                  period={period}
                  clock={clock}
                  time={formattedTime}
                  date={formattedDate}
                />

                <TeamInfo
                  side="home"
                  logo={homeLogo}
                  name={homeCode}
                  rank={null}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  gameStatusDescription={gameStatusDescription}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  gameStatusDescription={gameStatusDescription}
                  homeTeamId={homeId}
                  awayTeamId={awayId}
                  homeColor={homeColor}
                  homeName={homeName}
                  homeLogo={homeLogo}
                  awayLogo={awayLogo}
                  awayCode={awayCode}
                  awayColor={awayColor}
                  awayName={awayName}
                  homeCode={homeCode}
                  lineScore={lineScore}
                  teamStats={teamStats}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  officials={officials}
                  venueImage={venueImage}
                  venueLocation={venueLocation}
                  venueName={venueName}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  weather={weather}
                  league={LEAGUE}
                />
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
