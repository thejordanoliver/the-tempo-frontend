// ./NFL/GamePreview/NFLGamePreviewModal.tsx
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CenterInfo } from "components/Sports/CFB/GamePreview/CenterInfo";

import { Colors } from "constants/styles";
import {
  getNFLTeam,
  getNFLTeamLogo,
  neutralStadiums,
} from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFootballTeamStats } from "hooks/CFBHooks/useFootballTeamStats";
import { useFootballVenues } from "hooks/CFBHooks/useFootballVenues";
import { useGameDetails } from "hooks/NFLHooks/useGameDetails";
import { useLastFiveGames } from "hooks/NFLHooks/useLastFiveGames";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { Game } from "types/football";
import { getHolidayLabel } from "utils/dateUtils";
import { findMatchedVenue, resolveFootballVenue } from "utils/games";
import { snapPoints } from "utils/modalUtils";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  game: Game;
  visible: boolean;
  onClose: () => void;
};

export default function NFLGamePreviewModal({ game, visible, onClose }: Props) {
  const isDark = useColorScheme() === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  // --------------------------------------------------------------
  // SHEET VISIBILITY
  // --------------------------------------------------------------
  useEffect(() => {
    visible ? sheetRef.current?.present() : sheetRef.current?.dismiss();
  }, [visible]);

  const gameInfo = game.game;

  const week = gameInfo.week;
  const away = game.teams.away;
  const home = game.teams.home;
  const homeTeamId = game.teams?.home?.id ?? 0;
  const awayTeamId = game.teams?.away?.id ?? 0;

  const homeTeam = getNFLTeam(homeTeamId);
  const awayTeam = getNFLTeam(awayTeamId);

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const awayColor = awayTeam?.color ?? "";
  const homeColor = homeTeam?.color ?? "";

  const homeLogo = getNFLTeamLogo(homeTeamId, true);
  const awayLogo = getNFLTeamLogo(awayTeamId, true);

  const awayName = awayTeam?.code ?? "";
  const homeName = homeTeam?.code ?? "";

  const gameDateObj = useMemo(() => {
    if (!game.game.date) return null;

    const raw =
      typeof game.game.date === "object"
        ? game.game.date.timestamp * 1000
        : game.game.date;

    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [game?.game.date]);

  const gameDateStr = gameDateObj?.toISOString() ?? "";

  const formattedDate = gameDateObj?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime =
    gameDateObj?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  /* -------------------------------------------------- */
  /* Data Fetching                                     */
  /* -------------------------------------------------- */

  const { details, score } = useGameDetails(
    "nfl",
    homeEspnId,
    awayEspnId,
    gameDateStr,
  );

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);
  const { stats } = useFootballTeamStats(game?.game?.id ?? "");
  const { data: footballVenues = [] } = useFootballVenues();
  const headlineText = details?.headline;
  const isChampionship = game.game.week === "Super Bowl";
  const styles = gamePreviewModalStyle(isChampionship);
  const gameStatusDescription = score?.gameStatusDescription;
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const displayClock = score?.displayClock;
  const period = score?.period;
  const redzone = score?.possession?.isRedZone;
  const isGameLoading = !details || !score;
  const broadcast = details?.broadcast ?? "";
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const currentDrives = score?.drives.current;
  const previousDrives = score?.drives.previous;
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const scoringPlays = score?.scoringPlays;
  const downDistanceText = score?.possession.downDistanceText;
  const venue = details?.venue;
  const neutralSite = details?.neutralSite;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const possessionTeamId = score?.possession.teamId;
  const homeTimeouts = score?.possession.homeTimeouts ?? 0;
  const awayTimeouts = score?.possession.awayTimeouts ?? 0;
  const homeRecord = details?.records.home.total.summary;
  const awayRecord = details?.records.away.total.summary;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const matchedVenue = useMemo(() => {
    return findMatchedVenue(venue?.fullName, footballVenues);
  }, [venue?.fullName, footballVenues]);

  const resolvedVenue = useMemo(() => {
    return resolveFootballVenue({
      venue,
      homeTeam,
      matchedVenue,
      neutralSite,
      neutralStadiums,
    });
  }, [venue, homeTeam, matchedVenue, neutralSite]);

  const { weather } = useWeatherForecast(
    resolvedVenue.lat,
    resolvedVenue.lon,
    gameDateStr,
    resolvedVenue.city,
  );

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
          {isGameLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator isDark />
            </View>
          ) : (
            <>
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* HEADER */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  team={away}
                  logo={awayLogo}
                  name={awayName}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  possessionTeamId={possessionTeamId}
                  gameStatusDescription={gameStatusDescription}
                  side="away"
                  timeouts={awayTimeouts}
                />

                <CenterInfo
                  week={week}
                  date={formattedDate}
                  time={formattedTime}
                  period={period}
                  clock={displayClock}
                  isDark={isDark}
                  downAndDistance={downDistanceText}
                  broadcast={broadcast}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusShortDetail={gameStatusDetail}
                  redzone={redzone}
                />

                <TeamInfo
                  team={home}
                  logo={homeLogo}
                  name={homeName}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  possessionTeamId={possessionTeamId}
                  gameStatusDescription={gameStatusDescription}
                  side="home"
                  timeouts={homeTimeouts}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  game={game}
                  home={homeTeam}
                  away={awayTeam}
                  lineScore={lineScore}
                  stats={stats}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  officials={officials}
                  isDark={isDark}
                  venueImage={resolvedVenue.image}
                  venueName={resolvedVenue.name}
                  venueCity={resolvedVenue.city}
                  venueAddress={resolvedVenue.address}
                  venueCapacity={resolvedVenue.capacity}
                  venueAttendance={venue?.attendance}
                  weather={weather}
                  highlights={highlights}
                  gameStatusDescription={gameStatusDescription}
                  currentDrives={currentDrives}
                  previousDrives={previousDrives}
                  scoringPlays={scoringPlays}
                  venue={details.venue}
                  injuries={details.injuries}
                />
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
