import useRoster from "@/hooks/LeagueHooks/useRoster";
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
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { Game } from "types/nba";
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
  game: Game;
  onClose: () => void;
};

const LEAGUE = "NBA";

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

  const home = getNBATeam(game.home?.id);
  const away = getNBATeam(game.away?.id);
  const homeTeam = getNBATeam(home?.id ?? 0);
  const awayTeam = getNBATeam(away?.id ?? 0);
  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;
  const homeEspnId = homeTeam?.espnID ?? 0;
  const awayEspnId = awayTeam?.espnID ?? 0;
  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);
  const awayName = useMemo(
    () => awayTeam?.fullName ?? "",
    [awayTeam?.fullName],
  );
  const homeName = useMemo(
    () => homeTeam?.fullName ?? "",
    [homeTeam?.fullName],
  );
  const awayColor = useMemo(
    () => awayTeam?.color ?? Colors.midTone,
    [awayTeam?.color],
  );
  const homeColor = useMemo(
    () => homeTeam?.color ?? Colors.midTone,
    [homeTeam?.color],
  );
  const homeLogo = getTeamLogo(home?.id, true);
  const awayLogo = getTeamLogo(away?.id, true);

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
    homeTeamId,
    awayTeamId,
  );

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

  const { score: liveScore, details } = useGameDetails(
    "nba",
    home?.espnID?.toString(),
    away?.espnID?.toString(),
    new Date(game.date).toISOString().split("T")[0],
  );

  const isChampionship = details?.headline?.includes("NBA Finals");
  const styles = gamePreviewModalStyle(isChampionship);
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isCanceled || isDelayed || isPostponed || isForfeited;
  const period = formatQuarter(liveScore?.period ?? 0);
  const displayClock = liveScore?.displayClock ?? game.status?.clock;
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
  const braodcast = getBroadcastDisplay(broadcasts);
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

  const homeTeamPlayersData = useRoster(homeTeamId, LEAGUE);
  const awayTeamPlayersData = useRoster(awayTeamId, LEAGUE);

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

  const homeScore =
    liveScore?.home.total ?? game.scores?.home?.points ?? game.homeScore;
  const awayScore =
    liveScore?.away.total ?? game.scores?.away?.points ?? game.awayScore;

  const isGameLoading =
    !liveScore || !details || !gameLeaders || !home || !away;
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
                  timeouts={awayTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  bonusState={awayBonus}
                />

                <CenterInfo
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcast={braodcast}
                  period={period}
                  clock={displayClock}
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
                  timeouts={homeTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  bonusState={homeBonus}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  gameStatusDescription={gameStatusDescription}
                  homeTeamId={homeTeamId}
                  awayTeamId={awayTeamId}
                  homeColor={homeColor}
                  homeEspnId={homeEspnId}
                  homeName={homeName}
                  homeLogo={homeLogo}
                  awayLogo={awayLogo}
                  awayCode={awayCode}
                  awayColor={awayColor}
                  awayEspnId={awayEspnId}
                  awayName={awayName}
                  homeCode={homeCode}
                  homeChance={homeChance}
                  awayChance={awayChance}
                  lineScore={lineScore}
                  teamStats={teamStats}
                  playerStats={playerStats}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  injuries={injuries}
                  gameLeaders={gameLeaders}
                  gameLeadersLoading={gameLeadersLoading}
                  gameLeadersError={gameLeadersError}
                  teamPlayersMap={teamPlayersMap}
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
