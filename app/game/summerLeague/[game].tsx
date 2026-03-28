import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastPlay from "components/Sports/NBA/GameDetails/LastPlay";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameHeader from "components/Sports/NBASummerLeague/GameDetails/GameHeader";
import { teams } from "constants/teams";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect, useMemo } from "react";
import { ScrollView, useColorScheme, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { SummerGame } from "types/types";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseGameDate(raw: any) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw * 1000);
  return new Date(raw);
}

/* ------------------------------------------------------------------ */
/* Screen                                                             */
/* ------------------------------------------------------------------ */

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const isDark = useColorScheme() === "dark";
  const { game } = useLocalSearchParams();
  const navigation = useNavigation();

  /* ---------------- Parse Game ---------------- */

  const gameObj: SummerGame | null = useMemo(() => {
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
  const isUtah = gameObj.league.name === "NBA Salt Lake City Summer League";

  /* ---------------- Teams ---------------- */

  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);

  const homeTeamData = teams.find(
    (t) => String((t as any).summerLeagueId) === String(homeTeamId),
  );

  const awayTeamData = teams.find(
    (t) => String((t as any).summerLeagueId) === String(awayTeamId),
  );

  if (!homeTeamData || !awayTeamData) {
    const sampleTeams = teams.slice(0, 5).map((t) => ({
      name: t.name,
      id: t.id,
      espnID: t.espnID,
    }));

    console.warn("⚠️ Missing team data in GameDetailsScreen", {
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
        homeTeamFound: !!homeTeamData,
        awayTeamFound: !!awayTeamData,
      },
      teamSample: sampleTeams,
    });

    return null;
  }

  const homeLogo = isDark
    ? homeTeamData.logoLight || homeTeamData.logo
    : homeTeamData.logo;

  const awayLogo = isDark
    ? awayTeamData.logoLight || awayTeamData.logo
    : awayTeamData.logo;

  const homeEspnId = homeTeamData.espnID ?? 0;
  const awayEspnId = awayTeamData.espnID ?? 0;

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
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;
  const plays = liveScore?.plays ?? [];
  const headlineText = details?.headline;
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const venue = details?.venue;
  const neutralSite = details?.neutralSite;
  const leaders = liveScore?.leaders ?? [];
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const lastPlay = liveScore?.lastPlay ?? "";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  /* ---------------- Neutral site / venue ---------------- */

  const resolvedVenue = useMemo(
    () =>
      resolveVenue({
        espnVenue: details?.venue,
        homeTeam: homeTeamData,
      }),
    [details?.venue, homeTeamData],
  );

  const { weather } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateYMD,
  );

  /* ---------------- Status / linescore ---------------- */

  const displayHomeScore = liveScore?.home.total ?? 0;
  const displayAwayScore = liveScore?.away.total ?? 0;

  // --- Period scores / line score ---
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  /* ---------------- Header ---------------- */

  useLayoutEffect(() => {
    // While loading or missing data → NO HEADER
    if (isLoadingGame || !homeTeamData || !awayTeamData) {
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
          homeTeamId={homeTeamData.id}
          awayTeamId={awayTeamData.id}
          homeTeamCode={homeTeamData.code}
          awayTeamCode={awayTeamData.code}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          isNeutralSite={!!neutralSite}
          league={"NBA"}
        />
      ),
    });
  }, [
    navigation,
    isLoadingGame,
    neutralSite,
    homeTeamData?.code,
    awayTeamData?.code,
  ]);

  if (isLoadingGame) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator isDark={isDark} />
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
        homeTeamData={homeTeamData}
        awayTeamData={awayTeamData}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        rankHome={homeRank}
        rankAway={awayRank}
        homeScore={displayHomeScore}
        awayScore={displayAwayScore}
        home={homeTeamData}
        away={awayTeamData}
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
        <View style={{ gap: 20, marginTop: 20 }}>
          {!isFinal && !isScheduled && <LastPlay lastPlay={lastPlay} />}

          {!isScheduled && (
            <LineScore
              linescore={lineScore}
              homeCode={homeTeamData.code ?? ""}
              awayCode={awayTeamData.code ?? ""}
              isDark={isDark}
            />
          )}

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
            league={"SL"}
            isDark={isDark}
          />

          {highlights.length > 0 && (
            <HighlightVideoList highlights={highlights} isDark={isDark} />
          )}
          <Officials
            officials={officials ?? []}
            loading={false}
            error={null}
            isDark={isDark}
          />

          <GameLocation
            venueImage={resolvedVenue.image}
            venueName={resolvedVenue.name}
            location={resolvedVenue.city}
            address={resolvedVenue.address}
            venueCapacity={String(resolvedVenue.capacity ?? "")}
            weather={weather}
            loading={false}
            error={null}
            isDark={isDark}
          />
        </View>
      )}
    </ScrollView>
  );
}
