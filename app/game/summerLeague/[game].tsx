import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastPlay from "components/Sports/NBA/GameDetails/LastPlay";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameHeader from "components/Sports/NBASummerLeague/GameDetails/GameHeader";
import { getNeutralVenue } from "constants/neutralVenues";
import { getTeamBySummerId, teams } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { BasketballGame } from "types/basketball";
import { getBroadcastDisplay } from "utils/matchBroadcast";
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
  const styles = gameDetailsScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { game } = useLocalSearchParams();
  const navigation = useNavigation();

  /* ---------------- Parse Game ---------------- */

  const gameObj: BasketballGame | null = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch (e) {
      console.warn("Failed to parse game param", e);
      return null;
    }
  }, [game]);

  if (!gameObj) return null;

  /* ---------------- League ---------------- */

  const isLasVegas = gameObj.league.name === "NBA - Las Vegas Summer League";

  /* ---------------- Teams ---------------- */

  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);

  const homeTeam = getTeamBySummerId(homeTeamId);
  const awayTeam = getTeamBySummerId(awayTeamId);

  if (!homeTeam || !awayTeam) {
    const sampleTeams = teams.slice(0, 5).map((t) => ({
      name: t.name,
      id: t.id,
      espnID: t.espnID,
    }));

    console.warn("⚠️ Missing team  in GameDetailsScreen", {
      league: isLasVegas ? "SummerVegas" : "SummerUtah",
      apiTeamIds: {
        homeTeamId,
        awayTeamId,
      },

      game: {
        homeName: gameObj?.teams?.home?.name,
        awayName: gameObj?.teams?.away?.name,
        date:
          (gameObj as any)?.timestamp ?? (gameObj as any)?.date ?? "unknown",
      },
      found: {
        homeTeamFound: !!homeTeam,
        awayTeamFound: !!awayTeam,
      },
      teamSample: sampleTeams,
    });

    return null;
  }

  const homeLogo = isDark ? homeTeam.logoLight || homeTeam.logo : homeTeam.logo;
  const awayLogo = isDark ? awayTeam.logoLight || awayTeam.logo : awayTeam.logo;

  const homeEspnId = homeTeam.espnID ?? 0;
  const awayEspnId = awayTeam.espnID ?? 0;

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
  const period = liveScore?.period;
  const displayClock = liveScore?.displayClock;
  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;
  const headlineText = details?.headline;
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const neutralSite = details?.neutralSite;
  const leaders = liveScore?.leaders ?? [];
  const playerStats = liveScore?.playerStats ?? [];
  const lastPlay = liveScore?.lastPlay ?? "";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

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
  const { weather, weatherError, weatherLoading } = useWeatherForecast(
    venueLat,
    venueLon,
    gameDateISO,
  );

  /* ---------------- Status / linescore ---------------- */

  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;

  // --- Period scores / line score ---
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  /* ---------------- Header ---------------- */

  useLayoutEffect(() => {
    // While loading or missing  → NO HEADER
    if (isLoadingGame || !homeTeam || !awayTeam) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    // Once loaded → show custom header
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
          isNeutralSite={!!neutralSite}
          league={"NBA"}
        />
      ),
    });
  }, [navigation, isLoadingGame, neutralSite, homeTeam?.code, awayTeam?.code]);

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
        headlineText={headlineText ?? ""}
        homeTeamData={homeTeam}
        awayTeamData={awayTeam}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        rankHome={homeRank}
        rankAway={awayRank}
        homeScore={homeScore}
        awayScore={awayScore}
        home={homeTeam}
        away={awayTeam}
        homeRecord={homeRecord}
        awayRecord={awayRecord}
        displayClock={displayClock}
        period={period}
        isDark={isDark}
        formattedDate={formattedDate}
        time={formattedTime}
        networkString={broadcastText}
        league={detailsLeague} // ✅ FIX
        gameStatusDescription={gameStatusDescription}
        gameStatusShortDescription={gameStatusDetail}
      />

      {!dontShowDetails && (
        <View style={styles.innerContainer}>
          <LastPlay
            lastPlay={lastPlay}
            gameStatusDescription={gameStatusDescription}
          />

          <LineScore
            linescore={lineScore}
            homeCode={homeTeam.code}
            awayCode={awayTeam.code}
            isDark={isDark}
            gameStatusDescription={gameStatusDescription}
          />

          <GameLeaders
            leaders={leaders}
            awayTeamId={Number(awayEspnId)}
            homeTeamId={Number(homeEspnId)}
            league={"summerleague"}
            gameStatusDescription={gameStatusDescription}
            isDark={isDark}
          />

          <BoxScore
            playerStats={playerStats}
            homeTeamId={Number(homeEspnId)}
            awayTeamId={Number(awayEspnId)}
            league={LEAGUE}
            isDark={isDark}
            gameStatusDescription={gameStatusDescription}
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
