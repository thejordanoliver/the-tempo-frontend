//./CFB/GamePreview/CFBGamePreviewModal.tsx
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/styles";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useHockeyDetails } from "hooks/NHLHooks/useHockeyGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { NHLGame } from "types/hockey";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import { getGameDate } from "utils/nflGameCardUtils";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";
import { usePreferences } from "contexts/PreferencesContext";
type Props = {
  game: NHLGame; // ✅ normalized type, consistent with NBA + Summer League
  visible: boolean;
  onClose: () => void;
};

export default function NHLGamePreviewModal({ game, visible, onClose }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  const gameInfo = game;
  const home = game.teams.home;
  const away = game.teams.away;
  const awayId = away.id;
  const homeId = home.id;
  const homeTeam = getNHLTeam(homeId);
  const awayTeam = getNHLTeam(awayId);
  const awayEspnId = awayTeam?.espnID;
  const homeEspnId = homeTeam?.espnID;
  const homeLogo = getNHLTeamLogo(homeId, true);
  const awayLogo = getNHLTeamLogo(awayId, true);

  /* ===============================
     DATE / TIME
  =============================== */
  const timestamp = game?.timestamp;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);
  const rawStatus = (
    gameInfo.status.short ||
    gameInfo.status.long ||
    ""
  ).toUpperCase();

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const homeName = homeTeam?.code ?? "";
  const awayName = awayTeam?.code ?? "";
  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const {
    score: liveScore,
    details,
    loading,
  } = useHockeyDetails(
    "nhl",
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
  );
  const isChampionship = game.week === "Final";
  const styles = gamePreviewModalStyle(isChampionship);
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const neutralSite = details?.neutralSite;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const isLiveScoreReady = !liveScore;
  const period = liveScore?.period ?? 0;
  const clock = liveScore?.displayClock ?? "0:00";
  const homeScore = liveScore?.home?.total ?? game?.scores?.home ?? 0;
  const awayScore = liveScore?.away?.total ?? game?.scores?.away ?? 0;
  const homeRecord = details?.records?.home.overall ?? "0-0";
  const awayRecord = details?.records?.away.overall ?? "0-0";
  const officials = details?.officials ?? [];
  const plays = liveScore?.plays;
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const venue = details?.venue;
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const resolvedVenue = useMemo(
    () =>
      resolveVenue({
        espnVenue: venue,
        homeTeam: homeTeam,
        isNeutralSite: neutralSite,
        league: "NHL",
      }),
    [venue, homeTeam, neutralSite],
  );

  const { weather, weatherError, weatherLoading } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateStr,
  );

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
          {isLiveScoreReady ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
            </View>
          ) : (
            <>
              {headlineText && (
                <>
                  {headlineText && (
                    <Text style={styles.headlineText}>{headlineText}</Text>
                  )}
                </>
              )}

              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  team={away}
                  logo={awayLogo}
                  name={awayName}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  gameStatusDescription={gameStatusDescription}
                />

                <CenterInfo
                  isChampionship={isChampionship}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcastNetworks={broadcastText}
                  period={period}
                  clock={clock}
                  time={formattedTime}
                  formattedDate={formattedDate}
                  isDark={isDark}
                  lighter
                />
                <TeamInfo
                  side="home"
                  team={home}
                  logo={homeLogo}
                  name={homeName}
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
                  game={game}
                  away={awayTeam}
                  home={homeTeam}
                  homeChance={homeChance}
                  awayChance={awayChance}
                  lineScore={lineScore}
                  injuries={injuries}
                  highlights={highlights}
                  officials={officials}
                  plays={plays}
                  resolvedVenueImage={resolvedVenue.image}
                  resolvedVenueName={resolvedVenue.name}
                  resolvedVenueCity={resolvedVenue.city}
                  resolvedVenueAddress={resolvedVenue.address}
                  resolvedVenueCapacity={resolvedVenue.capacity}
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
