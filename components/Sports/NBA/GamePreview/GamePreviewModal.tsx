import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { getNeutralVenue } from "constants/neutralVenues";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useGameLeaders } from "hooks/NBAHooks/useGameLeaders";
import { useLastFiveGames } from "hooks/NBAHooks/useLastFiveGames";
import usePlayersByTeam from "hooks/NBAHooks/usePlayersByTeam";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { Game } from "types/nba";
import { getHolidayLabel } from "utils/dateUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  visible: boolean;
  game: Game;
  onClose: () => void;
};

const LEAGUE = "nba";

const isChampionshipDate = (date: Date) =>
  date.getMonth() === 5 && date.getDate() >= 5 && date.getDate() <= 22;

const formatVenueAddress = (address?: {
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}) => {
  if (!address) return undefined;

  return [address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(" ");
};

export default function GamePreviewModal({ visible, game, onClose }: Props) {
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

  const isChampionship = isChampionshipDate(dateObj);
  const styles = gamePreviewModalStyle(isChampionship);

  // --- Teams ---
  const home = getNBATeam(game.home?.id);
  const away = getNBATeam(game.away?.id);

  const homeId = Number(home?.id) || 0;
  const awayId = Number(away?.id) || 0;

  const homeEspnId = Number(home?.espnID) || 0;
  const awayEspnId = Number(away?.espnID) || 0;

  const homeName = home?.code ?? home?.name;
  const awayName = away?.code ?? away?.name;

  const homeLogo = getTeamLogo(homeId, true);
  const awayLogo = getTeamLogo(awayId, true);

  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";

  // --- Handle modal visibility safely ---
  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.present());
    } else {
      requestAnimationFrame(() => sheetRef.current?.dismiss());
    }
  }, [visible]);

  const { gameLeaders, gameLeadersLoading, gameLeadersError } = useGameLeaders(
    game?.id,
    homeId,
    awayId,
  );
  const { score: liveScore, details } = useGameDetails(
    LEAGUE,
    home?.espnID?.toString(),
    away?.espnID?.toString(),
    new Date(game.date).toISOString().split("T")[0],
  );

  // --- Status ---
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const period = liveScore?.period ?? game.status?.short;
  const displayClock = liveScore?.displayClock ?? game.status?.clock;

  // --- Score and game details ---
  const homeTimeouts = liveScore?.timeouts?.home ?? 0;
  const awayTimeouts = liveScore?.timeouts?.away ?? 0;
  const fouls = liveScore?.fouls;
  const awayBonus = fouls?.away?.bonusState;
  const homeBonus = fouls?.home?.bonusState;
  const injuries = details?.injuries ?? [];
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const officials = details?.officials ?? [];
  const headlineText = details?.headline;
  const headline = headlineText || getHolidayLabel(dateObj);
  const homeRecord = details?.records?.home?.overall ?? "0-0";
  const awayRecord = details?.records?.away?.overall ?? "0-0";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;

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

  const homeTeamPlayersData = usePlayersByTeam(String(homeId));
  const awayTeamPlayersData = usePlayersByTeam(String(awayId));

  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

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

  const homeLastGames = useLastFiveGames(homeId);
  const awayLastGames = useLastFiveGames(awayId);

  const isGameLoading = !liveScore || !gameLeaders || !home || !away;
  const homeScore =
    liveScore?.home.total ?? game.scores?.home?.points ?? game.homeScore;
  const awayScore =
    liveScore?.away.total ?? game.scores?.away?.points ?? game.awayScore;

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
                  team={away}
                  logo={awayLogo}
                  name={awayName}
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
                />

                <TeamInfo
                  team={home}
                  logo={homeLogo}
                  name={homeName}
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
                  home={home}
                  away={away}
                  homeChance={homeChance}
                  awayChance={awayChance}
                  lineScore={lineScore}
                  teamStats={teamStats}
                  playerStats={playerStats}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  injuries={injuries}
                  gameLeaders={gameLeaders}
                  loading={gameLeadersLoading}
                  error={gameLeadersError}
                  teamPlayersMap={teamPlayersMap}
                  officials={officials}
                  venueImage={venueImage}
                  venueLocation={venueLocation}
                  venueName={venueName}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  weather={weather}
                />
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
