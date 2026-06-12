import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useBasketballGameDetails } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BasketballGame } from "@/types/basketball";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
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
import { getVenue } from "../../../../constants/venues";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  visible: boolean;
  game: BasketballGame;
  onClose: () => void;
};

const LEAGUE = "NBA";

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

  const homeId = Number(game.home?.id);
  const awayId = Number(game.away?.id);
  const homeEspnId = game.home.espnId;
  const awayEspnId = game.away.espnId;

  const homeTeam = getNBATeam(homeId);
  const awayTeam = getNBATeam(awayId);

  const homeCode = homeTeam?.code || game.home?.shortName;
  const awayCode = awayTeam?.code || game.away?.shortName;
  const homeName = homeTeam?.fullName ?? "";
  const awayName = awayTeam?.fullName ?? "";

  const homeLogo = getTeamLogo(homeId, true);
  const awayLogo = getTeamLogo(awayId, true);

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const headlineText = game?.headline;
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = headlineText || holidayLabel;
  const isChampionship = headline?.includes("NBA Finals");
  const styles = gamePreviewModalStyle(isChampionship);

  const homeLastGames = useLastFiveGames(homeId, "basketball", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "basketball", LEAGUE);
  const { details, score } = useBasketballGameDetails("nba", gameId);

  const isGameLoading = !score || !details || !homeTeam || !awayTeam;

  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const period = formatQuarter(game.status.period);
  const clock = game.status.clock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status.shortDetail;
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails = isForfeited || isPostponed || isDelayed || isCanceled;
  const homeRecord = game.home.record ?? "0-0";
  const awayRecord = game.away.record ?? "0-0";
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;
  const teamStats = score?.teamStats ?? [];
  const playerStats = score?.playerStats ?? [];
  const injuries = details?.injuries ?? [];
  const officials = details?.officials ?? [];

  const homeBonus = score?.fouls?.home?.bonusState;
  const awayBonus = score?.fouls?.away?.bonusState;

  const homeTimeouts = score?.timeouts.home ?? 0;
  const awayTimeouts = score?.timeouts.away ?? 0;

  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const homeTeamPlayersData = useRoster(homeId, LEAGUE);
  const awayTeamPlayersData = useRoster(awayId, LEAGUE);

  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venue = getVenue(baseVenue?.fullName);
  const venueName = venue?.name || baseVenue?.fullName;
  const venueAddress = venue?.address || homeTeam?.address || baseVenueAddress;
  const venueCapacity = venue?.venueCapacity || homeTeam?.venueCapacity || null;
  const venueImage =
    venue?.venueImage || homeTeam?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = venue?.city || homeTeam?.city;
  const venueLat = venue?.latitude || homeTeam?.latitude || null;
  const venueLon = venue?.longitude || homeTeam?.longitude || null;
  const venueAttendance = baseVenue?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, formattedDate);

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
                  timeouts={awayTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  bonusState={awayBonus}
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
                  timeouts={homeTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  bonusState={homeBonus}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  gameStatusDescription={gameStatusDescription}
                  homeTeamId={homeId}
                  awayTeamId={awayId}
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
                  gameLeaders={null}
                  gameLeadersLoading={false}
                  gameLeadersError={null}
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
