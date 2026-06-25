import { getCBBTeam, getCBBTeamLogo } from "@/constants/teamsCBB";
import { getWNBATeam, getWNBATeamLogo } from "@/constants/teamsWNBA";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useBasketballGameDetails } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import { useVenue } from "@/hooks/useVenue";
import { useWeather } from "@/hooks/useWeather";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BasketballGame } from "@/types/basketball";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
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
import CenterInfo from "../../NBA/GamePreview/CenterInfo";
import TeamInfo from "../../NBA/GamePreview/TeamInfo";
import GamePreviewContent from "./GamePreviewContent";

type Props = {
  visible: boolean;
  game: BasketballGame;
  onClose: () => void;
  isCBB: boolean;
  isWCBB: boolean;
  isWNBA: boolean;
};

export default function GamePreviewModal({
  visible,
  game,
  onClose,
  isCBB,
  isWCBB,
  isWNBA,
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
  const LEAGUE = game?.league?.code ?? "cbb";

  const { details, score } = useBasketballGameDetails(LEAGUE, gameId);

  const home = game?.home;
  const away = game?.away;
  const homeId = isWCBB ? (home.wid ?? 0) : home?.id;
  const awayId = isWCBB ? (away.wid ?? 0) : away?.id;
  const homeEspnId = game.home.espnId;
  const awayEspnId = game.away.espnId;

  const homeCode = home?.code || game.home?.shortName;
  const awayCode = away?.code || game.away?.shortName;

  const homeTeam = isCBB
    ? getCBBTeam(homeId)
    : isWCBB
      ? getCBBTeam(homeId, isWCBB)
      : isWNBA
        ? getWNBATeam(homeId)
        : getNBATeam(homeId);

  const awayTeam = isCBB
    ? getCBBTeam(awayId)
    : isWCBB
      ? getCBBTeam(awayId, isWCBB)
      : isWNBA
        ? getWNBATeam(awayId)
        : getNBATeam(awayId);

  const homeName = homeTeam?.name || game.home?.name;
  const awayName = awayTeam?.name || game.away?.name;

  const homeLogo = isCBB
    ? getCBBTeamLogo(homeId, true)
    : isWCBB
      ? getCBBTeamLogo(homeId, true, true)
      : isWNBA
        ? getWNBATeamLogo(homeId, true)
        : getTeamLogo(homeId, true);

  const awayLogo = isCBB
    ? getCBBTeamLogo(awayId, true)
    : isWCBB
      ? getCBBTeamLogo(awayId, true, true)
      : isWNBA
        ? getWNBATeamLogo(awayId, true)
        : getTeamLogo(awayId, true);

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const headlineText = game?.headline;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText || holidayLabel;
  const isChampionship =
    headline?.includes("NBA Summer League - Final") ||
    headline?.includes(
      "Men's Basketball Championship - National Championship",
    ) ||
    headline?.includes(
      "Women's Basketball Championship - National Championship",
    );

  const styles = gamePreviewModalStyle(isChampionship);

  const isLoading = !!details;
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const period = formatPeriod({ period: game.status.period, isCBB: isCBB });
  const clock = game.status.clock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status.shortDetail;
  const state = game.status.state;
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
  const leaders = score?.leaders ?? [];
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

  const homeLastGames = useLastFiveGames(homeId, "basketball", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "basketball", LEAGUE);

  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue({ sport: "basketball", id: venueId });
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
  const venueImage = venue?.image ?? baseVenue?.images[0]?.href;
  const venueAttendance = game?.attendance || null;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");
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
          {!isLoading ? (
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
                  state={state}
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
                  officials={officials}
                  venueImage={venueImage}
                  venueLocation={venueLocation}
                  venueName={venueName}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  leaders={leaders}
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
