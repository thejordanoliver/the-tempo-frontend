import BoxScore from "@/components/Sports/Basketball/GameDetails/BoxScore";
import GameLeaders from "@/components/Sports/Basketball/GameDetails/GameLeaders";
import GameTeamStats from "@/components/Sports/Basketball/GameDetails/GameTeamStats";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  GameHeader,
  GameLocation,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastPlay from "components/Sports/NBA/GameDetails/LastPlay";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import { getNeutralVenue } from "constants/neutralVenues";
import { getTeamBySummerId, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { BasketballGame } from "types/basketball";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter, getBroadcastDisplay } from "utils/games";
/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseGameDate(raw: any) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw * 1000);
  return new Date(raw);
}

const LEAGUE = "SL";

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
  const gameObj: BasketballGame | null = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch (e) {
      console.warn("Failed to parse game param", e);
      return null;
    }
  }, [game]);

  if (!gameObj) return null;

  return <SummerLeagueGameDetailsContent gameObj={gameObj} />;
}

function SummerLeagueGameDetailsContent({
  gameObj,
}: {
  gameObj: BasketballGame;
}) {
  const styles = gameDetailsScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();

  /* ---------------- League ---------------- */

  const isLasVegas = gameObj.league.name === "NBA - Las Vegas Summer League";

  /* ---------------- Teams ---------------- */
  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);
  const homeTeam = getTeamBySummerId(homeTeamId);
  const awayTeam = getTeamBySummerId(awayTeamId);
  const homeLogo = getTeamLogo(homeTeam?.id, isDark);
  const awayLogo = getTeamLogo(awayTeam?.id, isDark);
  const awayColor = useMemo(() => awayTeam?.color ?? "", [awayTeam?.color]);
  const homeColor = useMemo(() => homeTeam?.color ?? "", [homeTeam?.color]);
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
  const homeEspnId = homeTeam?.espnID ?? 0;
  const awayEspnId = awayTeam?.espnID ?? 0;

  /* ---------------- Date ---------------- */

  const gameDateObj = useMemo(
    () => parseGameDate((gameObj as any)?.timestamp ?? (gameObj as any)?.date),
    [gameObj],
  );

  const formattedDate = gameDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime = gameDateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const gameDateISO = gameDateObj.toISOString();
  const gameDateYMD = gameDateISO.split("T")[0];

  /* ---------------- Hooks ---------------- */
  const detailsLeague = isLasVegas ? "summerVegas" : "summerUtah";

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateYMD,
  );

  const isLoadingGame =
    !liveScore ||
    !details ||
    liveScore.home?.total == null ||
    liveScore.away?.total == null;

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const period = formatQuarter(liveScore?.period ?? 0);
  const clock = liveScore?.displayClock ?? "0:00";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const homeRecord = details?.records?.home?.overall ?? "0-0";
  const awayRecord = details?.records?.away?.overall ?? "0-0";
  const fouls = liveScore?.fouls;
  const awayBonus = fouls?.away?.bonusState;
  const homeBonus = fouls?.home?.bonusState;
  const homeTimeouts = liveScore?.timeouts?.home ?? 0;
  const awayTimeouts = liveScore?.timeouts?.away ?? 0;
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const lastPlay = liveScore?.lastPlay;
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const neutralSite = details?.neutralSite;
  const broadcasts = details?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const leaders = liveScore?.leaders ?? [];
  const headlineText = details?.headline;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address ||
      `${baseVenue?.address.city} ${baseVenue?.address.state}, ${baseVenue?.address.zipCode} ${baseVenue?.address.country}`;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images[0]?.href
    : homeTeam?.venueImage || baseVenue?.images[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);
  const venueAttendance = details?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, gameDateISO);

  useLayoutEffect(() => {
    if (isLoadingGame || !homeTeam || !awayTeam) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamId={homeTeam.id}
          awayTeamId={awayTeam.id}
          homeTeamCode={homeTeam.code}
          awayTeamCode={awayTeam.code}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeColor={homeColor}
          awayColor={awayColor}
          isNeutralSite={!!neutralSite}
          league={"NBA"}
        />
      ),
    });
  }, [
    navigation,
    isLoadingGame,
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
    homeColor,
    awayColor,
    neutralSite,
  ]);

  if (isLoadingGame) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
      stickyHeaderIndices={[0]}
    >
      <GameHeader
        headline={headline}
        homeId={homeTeamId}
        awayId={awayTeamId}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        homeName={homeName}
        awayName={awayName}
        homeScore={homeScore}
        awayScore={awayScore}
        homeRecord={homeRecord}
        awayRecord={awayRecord}
        homeBonusState={homeBonus}
        awayBonusState={awayBonus}
        homeTimeouts={homeTimeouts}
        awayTimeouts={awayTimeouts}
        homeWins={homeWins}
        awayWins={awayWins}
        clock={clock}
        period={period}
        date={formattedDate}
        time={formattedTime}
        broadcast={broadcast}
        gameStatusDescription={gameStatusDescription}
        gameStatusDetail={gameStatusDetail}
        isDark={isDark}
        league={LEAGUE}
      />

      {!dontShowDetails && (
        <View style={styles.innerContainer}>
          <LastPlay
            lastPlay={lastPlay}
            homeTeamId={homeTeamId}
            awayTeamId={awayTeamId}
            gameStatusDescription={gameStatusDescription}
          />

          <LineScore
            linescore={lineScore}
            homeCode={homeName}
            awayCode={awayName}
            isDark={isDark}
            gameStatusDescription={gameStatusDescription}
          />

          <GameLeaders
            leaders={leaders}
            homeCode={homeCode}
            homeLogo={homeLogo}
            awayCode={awayCode}
            awayLogo={awayLogo}
            awayTeamId={Number(awayEspnId)}
            homeTeamId={Number(homeEspnId)}
            league={"summerleague"}
            gameStatusDescription={gameStatusDescription}
            isDark={isDark}
          />

          <BoxScore
            playerStats={playerStats}
            homeName={homeName}
            homeLogo={homeLogo}
            awayName={awayName}
            awayLogo={awayLogo}
            homeTeamId={Number(homeEspnId)}
            awayTeamId={Number(awayEspnId)}
            league={LEAGUE}
            isDark={isDark}
            gameStatusDescription={gameStatusDescription}
          />

          <GameTeamStats
            stats={teamStats}
            homeName={homeCode}
            homeLogo={homeLogo}
            homeColor={homeColor}
            awayName={awayCode}
            awayLogo={awayLogo}
            awayColor={awayColor}
            gameStatusDescription={gameStatusDescription}
            isDark={isDark}
          />

          <HighlightVideoList highlights={highlights} isDark={isDark} />

          <Officials
            officials={officials}
            gameStatusDescription={gameStatusDescription}
            isDark={isDark}
          />

          <GameLocation
            venueImage={venueImage}
            venueName={venueName}
            location={venueLocation}
            address={venueAddress}
            venueCapacity={venueCapacity}
            venueAttendance={venueAttendance}
            weather={weather}
            isDark={isDark}
          />
        </View>
      )}
    </ScrollView>
  );
}
