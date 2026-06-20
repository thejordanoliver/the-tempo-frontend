import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useSoccerGameDetails } from "@/hooks/SoccerHooks/useSoccerGameDetails";
import { useVenue } from "@/hooks/useVenue";
import { useWeather } from "@/hooks/useWeather";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { SoccerGame } from "@/types/soccer";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/styles";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getHolidayLabel } from "utils/dateUtils";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "utils/games";
import { snapPoints } from "utils/modalUtils";
import { CenterInfo } from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  visible: boolean;
  game: SoccerGame;
  onClose: () => void;
};

export default function SoccerGamePreviewModal({
  visible,
  game,
  onClose,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.present());
    } else {
      requestAnimationFrame(() => sheetRef.current?.dismiss());
    }
  }, [visible]);

  function isValidDate(date: Date) {
    return !Number.isNaN(date.getTime());
  }

  const gameDateObj = game?.date ? new Date(game.date) : null;
  const formattedDate =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })
      : "TBD";

  const formattedTime =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "TBD";

  const gameId = game.id;
  const LEAGUE = game?.league?.code ?? "epl";

  const { details, score } = useSoccerGameDetails(LEAGUE, gameId);

  const homeId = Number(game.home?.id);
  const awayId = Number(game.away?.id);

  const homeTeam = getSOCCTeam(homeId);
  const awayTeam = getSOCCTeam(awayId);

  const homeCode = homeTeam?.code || game.home?.name;
  const awayCode = awayTeam?.code || game.away?.name;
  const homeName = homeTeam?.fullName ?? "";
  const awayName = awayTeam?.fullName ?? "";

  const homeLogo = getSOCCTeamLogo(homeId, true);
  const awayLogo = getSOCCTeamLogo(awayId, true);

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const headlineText = game?.headline;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText || holidayLabel;
  const isChampionship = headline?.includes("Final");
  const styles = gamePreviewModalStyle(isChampionship);

  const isGameLoading = !score || !details || !homeTeam || !awayTeam;
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const period = formatPeriod({ period: game.status.period, isSOCC: true });
  const clock = game.status.clock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status.shortDetail;
  const state = game.status.state;
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

  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue("soccer", venueId);
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
  const venueImage = venue?.image ?? "";
  const venueAttendance = baseVenue?.attendance || null;
  const venueLocation = `${venue?.city}, ${venue?.state}`;

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
                  gameStatusShortDescription={gameStatusDetail}
                  state={state}
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
                  state={state}
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
