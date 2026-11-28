import { emptyAwayTeam, emptyHomeTeam } from "types/team";
//./CFB/GamePreview/CFBGamePreviewModal.tsx
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { getMCHTeam } from "@/constants/teamsMCH";
import { getNHLTeam } from "@/constants/teamsNHL";
import { getWCHTeam } from "@/constants/teamsWCH";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useHockeyGameDetails } from "@/hooks/HockeyHooks/useHockeyGameDetails";
import { useLastFiveGames } from "@/hooks/useLastFiveGames";
import useTeams from "@/hooks/useTeams";
import { useWeather } from "@/hooks/useWeather";
import { GamePreviewModalStyles } from "@/styles/ModalsStyles/GamePreviewModalStyles";
import { HockeyGame } from "@/types/hockey/hockey";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "@/utils/common/dateUtils";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Colors, globalStyles } from "constants/styles";
import { BlurView } from "expo-blur";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { resolveImage } from "utils/customheader/utils";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "utils/games/games";
import { snapPoints } from "utils/ui/modalUtils";
import { CenterInfo } from "../GameDetails/CenterInfo";
import { TeamRow } from "../GameDetails/TeamRow";
import GamePreviewContent from "./GamePreviewContent";

type Props = {
  game: HockeyGame;
  visible: boolean;
  onClose: () => void;
};

export default function HockeyGamePreviewModal({
  game,
  visible,
  onClose,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  const gameDateObj = new Date(game.date);
  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = game.headline || holidayLabel;

  const LEAGUE = game?.league?.code ?? "nhl";
  const gameId = game?.id;

  const home = game.home;
  const away = game.away;
  const awayId = away.id;
  const homeId = home.id;
  const getTeam =
    LEAGUE === "mch" ? getMCHTeam : LEAGUE === "wch" ? getWCHTeam : getNHLTeam;
  const localHome = getTeam(homeId);
  const localAway = getTeam(awayId);

  const homeLogo =
    resolveImage(
      (isDark && (home.logoDark || localHome?.logoLight)) ||
        home.logo ||
        localHome?.logo,
    ) ?? emptyHomeTeam.logo;

  const awayLogo =
    resolveImage(
      (isDark && (away.logoDark || localAway?.logoLight)) ||
        away.logo ||
        localAway?.logo,
    ) ?? emptyAwayTeam.logo;

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const awayCode = game.away.code ?? "TBD";
  const homeCode = game.home.code ?? "TBD";
  const awayName = game.away.shortName ?? game.away.name ?? "TBD";
  const homeName = game.home.shortName ?? game.home.name ?? "TBD";

  const homeColor = game.home.primaryColor ?? Colors.midTone;
  const awayColor = game.away.primaryColor ?? Colors.midTone;

  const homeLastGames = useLastFiveGames(homeId, "hockey", LEAGUE).games;
  const awayLastGames = useLastFiveGames(awayId, "hockey", LEAGUE).games;
  const { teamDetails: homeTeamDetails } = useTeams(LEAGUE, homeId);
  const { teamDetails: awayTeamDetails } = useTeams(LEAGUE, awayId);
  const { details, score, warning, refresh } = useHockeyGameDetails(
    LEAGUE,
    gameId,
  );

  const isHomeActive = homeTeamDetails?.isActive ?? false;
  const isAwayActive = awayTeamDetails?.isActive ?? false;
  const homeCoach = homeTeamDetails?.coach;
  const awayCoach = awayTeamDetails?.coach;

  const global = globalStyles(isDark);

  const isChampionship = headline?.includes("Stanley Cup Final");
  const styles = GamePreviewModalStyles({
    isDark: isDark,
    isChampionship: isChampionship,
    homeColor: homeColor,
    awayColor: awayColor,
  });

  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const state = score?.status?.state ?? "";
  const gameStatusDescription = game.status.description ?? "";
  const gameStatusDetail = game.status.shortDetail ?? "";
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const dontShowDetails = isDelayed || isCanceled || isPostponed || isForfeited;
  const period = formatPeriod({ period: game.status.period, isNHL: true });
  const homeScore = score?.home?.score ?? 0;
  const awayScore = score?.away?.score ?? 0;
  const homeRank = score?.home?.rank;
  const awayRank = score?.away?.rank;
  const homeTimeouts = score?.home?.timeouts;
  const awayTimeouts = score?.away?.timeouts;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const homeRecord = game?.home?.record ?? "0-0";
  const awayRecord = game?.away?.record ?? "0-0";
  const clock = game.status?.clock;
  const injuries = details?.injuries ?? [];
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const venue = details?.venueInfo;
  const { weather } = useWeather({
    lat: venue?.latitude,
    lon: venue?.longitude,
    location: venue?.address.city,
    date: gameDateObj,
  });
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName;
  const venueAddress =
    venue?.address.formatted ??
    (formatVenueAddress(venue?.address) || baseVenueAddress);
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image ?? baseVenue?.images?.[0]?.href;
  const venueAttendance = details?.attendance ?? game?.attendance ?? null;
  const venueCity = venue?.address.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.address.state ??
    venue?.address.country ??
    baseVenue?.address?.state ??
    baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={2}
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
        <View style={styles.leftCircle} />
        <View style={styles.rightCircle} />

        <BlurView intensity={100} style={styles.blurViewContainer}>
          {!details && warning ? (
            <View style={styles.loadingContainer}>
              <Text style={global.errorText}>Couldn’t load game details</Text>
              <Text
                accessibilityRole="button"
                style={global.text}
                onPress={refresh}
              >
                Try again
              </Text>
            </View>
          ) : !details ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
            </View>
          ) : (
            <>
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* --- Header Section --- */}
              <View style={styles.gameHeaderContainer}>
                {/* Away Team Row */}
                <TeamRow
                  id={awayId}
                  isActive={isAwayActive}
                  name={awayCode}
                  logo={awayLogo}
                  rank={awayRank}
                  score={awayScore}
                  record={awayRecord}
                  isWinner={awayWins}
                  timeouts={awayTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  isHome={false}
                  league={LEAGUE}
                  isDark={isDark}
                />

                {/* Game Info */}
                <CenterInfo
                  date={formattedDate}
                  time={tbd || formattedTime}
                  clock={clock}
                  period={period}
                  broadcast={broadcast}
                  gameStatusShortDescription={gameStatusDetail}
                  gameStatusDescription={gameStatusDescription}
                  isDark={isDark}
                />

                {/* Home Team Row */}
                <TeamRow
                  id={homeId}
                  isActive={isHomeActive}
                  name={homeCode}
                  logo={homeLogo}
                  rank={homeRank}
                  score={homeScore}
                  record={homeRecord}
                  isWinner={homeWins}
                  timeouts={homeTimeouts}
                  gameStatusDescription={gameStatusDescription}
                  isHome={true}
                  league={LEAGUE}
                  isDark={isDark}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  plays={score?.plays}
                  lastPlay={score?.lastPlay}
                  gameStatus={score?.status}
                  homeColor={homeColor}
                  gameStatusDescription={gameStatusDescription}
                  state={state}
                  awayCode={awayCode}
                  homeCode={homeCode}
                  awayColor={awayColor}
                  awayLogo={awayLogo}
                  awayName={awayName}
                  homeName={homeName}
                  homeId={homeId}
                  awayId={awayId}
                  homeLogo={homeLogo}
                  lineScore={lineScore}
                  homeCoach={homeCoach}
                  awayCoach={awayCoach}
                  injuries={injuries}
                  officials={officials}
                  highlights={highlights}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  venueImage={venueImage}
                  venueName={venueName}
                  venueLocation={venueLocation}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  weather={weather}
                  league={LEAGUE}
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
