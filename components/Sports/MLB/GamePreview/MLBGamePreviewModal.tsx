import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { useLastFiveGames } from "hooks/MLBHooks/useLastFiveGames";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { emptyAwayTeam, emptyHomeTeam } from "types/cfb";
import { MLBGame } from "types/mlb";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import { getGameDate } from "utils/nflGameCardUtils";
import MLBInjuries from "../GameDetails/MLBInjuries";
import { GameInfo } from "./CenterInfo";
import TeamInfo from "./TeamInfo";
type Props = {
  game: MLBGame;
  visible: boolean;
  onClose: () => void;
};

export default function MLBGamePreviewModal({ game, visible, onClose }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const isDark = useColorScheme() === "dark";

  /* ==================================================
     GAME DATA
  ================================================== */
  const { teams, timestamp, scores } = game;
  const { home, away } = teams;

  const {
    date,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);

  /* ==================================================
     INTERNAL TEAM MAPPING
  ================================================== */
  const homeTeam = getMLBTeam(home?.id);
  const awayTeam = getMLBTeam(away?.id);

  const homeName = homeTeam?.code ?? emptyHomeTeam.code ?? "";
  const awayName = awayTeam?.code ?? emptyAwayTeam.code ?? "";

  const homeColor = homeTeam?.color ?? emptyHomeTeam.color ?? "";
  const awayColor = awayTeam?.color ?? emptyAwayTeam.color ?? "";

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const homeLogo = getMLBTeamLogo(homeTeam?.id ?? 0, true);
  const awayLogo = getMLBTeamLogo(awayTeam?.id ?? 0, true);

  /* ==================================================
     LIVE GAME DETAILS
  ================================================== */
  const { score: liveScore, details } = useBaseballGameDetails(
    "mlb",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );

  const isLiveScoreReady = !!liveScore;

  /* ==================================================
     GAME STATUS
  ================================================== */
  const isChampionship = details?.playoffRound === "World Series";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const neutralSite = details?.neutralSite;
  const headline = details?.headline;
  const seriesSummary = details?.seriesSummary;
  const seasonState = details?.seasonState;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.statusText ?? "";
  const plays = liveScore?.plays;
  const lastPlay = liveScore?.lastPlay;
  const isPostseason = details?.isPostseason;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const playerStats = liveScore?.playerStats ?? [];
  const homeScore = liveScore?.home.total ?? game.scores.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores.away.total ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const period = liveScore?.period;
  const venue = details?.venue;
  const attendance = details?.venue;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const isTopInning = gameStatusDetail.includes("Top");
  const outs = liveScore?.outs;
  const bases: { first: boolean; second: boolean; third: boolean } =
    liveScore?.bases ?? {
      first: false,
      second: false,
      third: false,
    };

  const homeLastGames = useLastFiveGames(home.id);
  const awayLastGames = useLastFiveGames(away.id);

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
        league: "MLB",
      }),
    [venue, homeTeam, neutralSite],
  );

  const { weather } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateStr,
  );

  useEffect(() => {
    visible ? sheetRef.current?.present() : sheetRef.current?.dismiss();
  }, [visible]);

  const styles = gamePreviewModalStyle(isChampionship);

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
        {/* ================= BACKGROUND GRADIENT ================= */}
        <LinearGradient
          colors={
            isChampionship
              ? ["#DFBD69", "#CDA765"]
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
          tint="systemUltraThinMaterialDark"
          style={styles.blurViewContainer}
        >
          {!isLiveScoreReady ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator lighter />
            </View>
          ) : (
            <>
              {/* ================= HEADLINE ================= */}
              {headlineText && (
                <Text style={styles.headlineText}>{headlineText}</Text>
              )}

              {/* ================= GAME HEADER ================= */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  team={away}
                  teamName={awayName}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  gameStatusDescription={gameStatusDescription}
                />

                <GameInfo
                  broadcastNetworks={broadcastText}
                  inning={liveScore.statusText}
                  time={formattedTime}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  isTopInning={isTopInning}
                  date={formattedDate}
                  outs={outs ?? 0}
                  bases={bases}
                />

                <TeamInfo
                  side="home"
                  team={home}
                  teamName={homeName}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  gameStatusDescription={gameStatusDescription}
                />
              </View>

              {/* BODY */}
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainerStyle}
              >
                <View style={styles.bottomSheetScrollViewWrapper}>
                  {!isScheduled && (
                    <LineScore
                      linescore={lineScore}
                      homeCode={homeTeam?.code}
                      awayCode={awayTeam?.code}
                      league="MLB"
                      lighter
                    />
                  )}
                  {isScheduled && (
                    <MatchupPredictor
                      away={{
                        name: awayTeam?.code ?? "UNK",
                        logo: awayLogo,
                        color: awayTeam?.color,
                        chance: awayChance,
                      }}
                      home={{
                        name: homeTeam?.code ?? "UNK",
                        logo: homeLogo,
                        color: homeTeam?.color,
                        chance: homeChance,
                      }}
                      size={180}
                      lighter
                    />
                  )}

                  <LastFiveGames
                    isDark={isDark}
                    away={{
                      teamId: awayTeam?.id,
                      teamCode: awayTeam?.code,
                      games: awayLastGames?.games,
                    }}
                    home={{
                      teamId: homeTeam?.id,
                      teamCode: homeTeam?.code,
                      games: homeLastGames?.games,
                    }}
                    league="MLB"
                    lighter
                  />

                  <HighlightVideoList highlights={highlights} lighter />

                  <MLBInjuries
                    injuries={injuries}
                    loading={false}
                    error={null}
                    awayTeam={awayTeam?.code}
                    homeTeam={homeTeam?.code}
                    lighter
                  />

                  <Officials
                    officials={officials ?? []}
                    loading={false}
                    error={null}
                    lighter
                  />

                  <GameLocation
                    venueImage={resolvedVenue.image}
                    venueName={resolvedVenue.name}
                    location={
                      resolvedVenue.city
                        ? `${resolvedVenue.city}`
                        : resolvedVenue.name
                    }
                    address={resolvedVenue.address}
                    venueCapacity={String(resolvedVenue.capacity ?? "")}
                    venueAttendance={undefined}
                    weather={weather}
                    loading={false}
                    error={null}
                    lighter
                  />
                </View>
              </BottomSheetScrollView>
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
