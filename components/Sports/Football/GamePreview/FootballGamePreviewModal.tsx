// ./NFL/GamePreview/NFLGamePreviewModal.tsx
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { useFootballGameDetails } from "@/hooks/FootballHooks/useFootballGameDetails";
import { useLastFiveGames } from "@/hooks/FootballHooks/useLastFiveGames";
import useTeamDetails from "@/hooks/useTeams";
import { useVenue } from "@/hooks/useVenue";
import { useWeather } from "@/hooks/useWeather";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { FootballGame } from "@/types/football/football";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "@/utils/games";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Colors } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  formatDate,
  formatTime,
  getFootballSeason,
  getHolidayLabel,
  safeDate,
} from "utils/dateUtils";
import { snapPoints } from "utils/modalUtils";
import { CenterInfo } from "../GameDetails/CenterInfo";
import { TeamRow } from "../GameDetails/TeamRow";
import GamePreviewContent from "./GamePreviewContent";

type Props = {
  game: FootballGame;
  isNFL: boolean;
  isCFB: boolean;
  visible: boolean;
  onClose: () => void;
};

export default function FootballGamePreviewModal({
  game,
  isNFL,
  isCFB,
  visible,
  onClose,
}: Props) {
  const currentSeason = getFootballSeason();
  const sheetRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.present());
    } else {
      requestAnimationFrame(() => sheetRef.current?.dismiss());
    }
  }, [visible]);

  const gameDateObj = new Date(game.date);
  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = game.headline || holidayLabel;

  const gameId = game.id;
  const LEAGUE = game?.league?.code ?? "nfl";

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;

  const homeTeam = isNFL
    ? getNFLTeam(homeId)
    : isCFB
      ? getCFBTeam(homeId)
      : getUFLTeam(homeId);
  const awayTeam = isNFL
    ? getNFLTeam(awayId)
    : isCFB
      ? getCFBTeam(awayId)
      : getUFLTeam(awayId);

  const homeCode = homeTeam?.code ?? "";
  const awayCode = awayTeam?.code ?? "";

  const homeLogo = isNFL
    ? getNFLTeamLogo(homeId, true)
    : isCFB
      ? getCFBTeamLogo(homeId, true)
      : getUFLTeamLogo(homeId, true);
  const awayLogo = isNFL
    ? getNFLTeamLogo(awayId, true)
    : isCFB
      ? getCFBTeamLogo(awayId, true)
      : getUFLTeamLogo(awayId, true);

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const homeName = homeTeam?.fullName ?? "";
  const awayName = awayTeam?.fullName ?? "";

  const { score, details } = useFootballGameDetails(LEAGUE, gameId);
  const homeLastGames = useLastFiveGames(homeId, LEAGUE, currentSeason).games;
  const awayLastGames = useLastFiveGames(awayId, LEAGUE, currentSeason).games;

  const { teamDetails: homeTeamDetails } = useTeamDetails(LEAGUE, homeId);
  const { teamDetails: awayTeamDetails } = useTeamDetails(LEAGUE, awayId);

  const homeCoach = homeTeamDetails?.coach;
  const awayCoach = awayTeamDetails?.coach;

  const state = score?.status?.state;
  const gameStatusDescription = score?.status.gameStatusDescription ?? "";
  const gameStatusDetail = score?.status.gameStatusDetail ?? "";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const dontShowDetails = isDelayed || isCanceled || isPostponed || isForfeited;
  const clock = score?.status?.displayClock;
  const period = formatPeriod({ period: game.status.period });
  const isRedzone = game?.situation.isRedZone;
  const broadcasts = details?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const downDistanceText = game.situation.downDistanceText;
  const possessionTeamId = game.situation.possession;
  const homeRecord = score?.home.record;
  const awayRecord = score?.away.record;
  const homeTimeouts = score?.home.timeouts ?? 0;
  const awayTimeouts = score?.away.timeouts ?? 0;
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const officials = details?.officials ?? [];
  const homeScore = game.home.score ?? 0;
  const awayScore = game.away.score ?? 0;
  const homeRank = game.home.rank ?? null;
  const awayRank = game.away.rank ?? null;
  const isChampionship =
    game?.headline?.includes("Super Bowl") ??
    game?.headline?.includes("Championship");
  const styles = gamePreviewModalStyle(isChampionship);
  const homeHasPossession = inProgress && possessionTeamId === homeTeam?.espnId;
  const awayHasPossession = inProgress && possessionTeamId === awayTeam?.espnId;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isTie = awayScore === homeScore;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;
  const teamStats = score?.teamStats ?? [];
  const leaders = score?.leaders ?? [];
  const highlights = details?.highlights ?? [];
  const injuries = details?.injuries ?? [];
  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue({ sport: "football", id: venueId });
  const { weather } = useWeather({
    lat: Number(venue?.latitude),
    lon: Number(venue?.longitude),
    location: venue?.city,
    date: gameDateObj,
  });
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName;
  const venueAddress = venue?.address ?? baseVenueAddress;
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image;
  const venueAttendance = game?.attendance || null;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");
  const venueSurface = baseVenue?.grass;

  const isLoading = !!details;

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
              ? [Colors.dark.gold, Colors.dark.gold]
              : [awayColor, awayColor, homeColor, homeColor]
          }
          locations={isChampionship ? undefined : [0, 0.4, 0.6, 1]}
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
          {!isLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
            </View>
          ) : (
            <>
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* HEADER */}
              <View style={styles.gameHeaderContainer}>
                <TeamRow
                  id={awayId}
                  name={awayCode}
                  logo={awayLogo}
                  rank={awayRank}
                  score={awayScore}
                  record={awayRecord}
                  isWinner={awayWins}
                  isTie={isTie}
                  timeouts={awayTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  hasPossession={awayHasPossession}
                  league={LEAGUE}
                  isHome={false}
                  isDark
                />

                <CenterInfo
                  date={formattedDate}
                  time={formattedTime}
                  period={period}
                  clock={clock}
                  broadcast={broadcast}
                  downDistance={downDistanceText}
                  gameStatusShortDetail={gameStatusDetail}
                  gameStatusDescription={gameStatusDescription}
                  redzone={isRedzone}
                  isDark
                />

                <TeamRow
                  id={homeId}
                  name={homeCode}
                  logo={homeLogo}
                  rank={homeRank}
                  score={homeScore}
                  record={homeRecord}
                  isWinner={homeWins}
                  isTie={isTie}
                  timeouts={homeTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  hasPossession={homeHasPossession}
                  league={LEAGUE}
                  isHome={true}
                  isDark
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  state={state}
                  homeId={homeId}
                  awayId={awayId}
                  homeColor={homeColor}
                  homeName={homeName}
                  homeLogo={homeLogo}
                  awayLogo={awayLogo}
                  awayCode={awayCode}
                  awayColor={awayColor}
                  awayName={awayName}
                  homeCode={homeCode}
                  homeChance={homeChance}
                  awayChance={awayChance}
                  homeCoach={homeCoach}
                  awayCoach={awayCoach}
                  lineScore={lineScore}
                  teamStats={teamStats}
                  injuries={injuries}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  officials={officials}
                  highlights={highlights}
                  venueImage={venueImage}
                  venueLocation={venueLocation}
                  venueName={venueName}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  venueSurface={venueSurface}
                  leaders={leaders}
                  weather={weather}
                  league={LEAGUE}
                  isChampionship={isChampionship}
                />
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
