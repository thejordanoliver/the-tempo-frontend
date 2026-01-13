import BoxScore from "components/CBB/GameDetails/BoxScore";
import GameHeader from "components/CBB/GameDetails/GameHeader";
import GameLeaders from "components/CBB/GameDetails/GameLeaders";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FloatingChatButton from "components/FloatingButton";
import {
  GameLocation,
  LastFiveGamesSwitcher,
  LineScore,
} from "components/GameDetails";
import GameSummary from "components/GameDetails/GameSummary";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import LastPlay from "components/GameDetails/LastPlay";
import Officials from "components/GameDetails/Officials";
import ShotChart from "components/GameDetails/ShotChart";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import { neutralVenues, teams } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameDetails } from "hooks/useGameDetails";
import { useTeamRecord } from "hooks/useTeamRecords";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { CBBGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseGameDate(raw: any) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw * 1000);
  return new Date(raw);
}

function safeStr(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/* ------------------------------------------------------------------ */
/* Screen                                                             */
/* ------------------------------------------------------------------ */

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { openChat, isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScrollStart = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleScrollEnd = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: isChatOpen ? 0 : 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  /* ---------------- Parse Game ---------------- */

  const gameObj: CBBGame | null = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch (e) {
      console.warn("Failed to parse game param", e);
      return null;
    }
  }, [game]);

  if (!gameObj) return null;

  /* ---------------- League ---------------- */

  // ESPN + API convention: Women's teams end with " W"
  const isWomen =
    String(gameObj?.league?.id) === "423" ||
    gameObj?.league?.name === "Women's College Basketball";

  const recordLeague = (isWomen ? "wcbb" : "cbb") as "cbb" | "wcbb";

  const scoresLeagueKey = isWomen
    ? "womens-college-basketball"
    : "mens-college-basketball";

  /* ---------------- Teams ---------------- */

  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);

  const homeTeamData = teams.find((t) =>
    isWomen
      ? String((t as any).wid) === String(homeTeamId)
      : String((t as any).id) === String(homeTeamId)
  );

  const awayTeamData = teams.find((t) =>
    isWomen
      ? String((t as any).wid) === String(awayTeamId)
      : String((t as any).id) === String(awayTeamId)
  );

  if (!homeTeamData || !awayTeamData) {
    const sampleTeams = teams.slice(0, 5).map((t) => ({
      name: t.name,
      id: t.id,
      wid: (t as any).wid,
      espnID: t.espnID,
    }));

    console.warn("⚠️ Missing team data in GameDetailsScreen", {
      league: isWomen ? "WCBB" : "CBB",
      apiTeamIds: {
        homeTeamId,
        awayTeamId,
      },
      lookupStrategy: isWomen
        ? "matched against teams[].wid"
        : "matched against teams[].id",
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

  const homeLogo =
    isWomen && isDark
      ? homeTeamData.wLogo || homeTeamData.logoLight || homeTeamData.logo
      : isDark
      ? homeTeamData.logoLight || homeTeamData.logo
      : isWomen
      ? homeTeamData.wLogo || homeTeamData.logo
      : homeTeamData.logo;

  const awayLogo =
    isWomen && isDark
      ? awayTeamData.wLogo || awayTeamData.logoLight || awayTeamData.logo
      : isDark
      ? awayTeamData.logoLight || awayTeamData.logo
      : isWomen
      ? awayTeamData.wLogo || awayTeamData.logo
      : awayTeamData.logo;

  const homeEspnId = homeTeamData.espnID ?? 0;
  const awayEspnId = awayTeamData.espnID ?? 0;

  /* ---------------- Date ---------------- */

  const gameDateObj = useMemo(
    () => parseGameDate((gameObj as any)?.timestamp ?? (gameObj as any)?.date),
    [gameObj]
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

  /* ---------------- Rankings ---------------- */

  const { getTeamRankingById } = useCBBRankings(isWomen ? "423" : "116");

  const currentHomeRank = getTeamRankingById(homeEspnId)?.current ?? "";
  const currentAwayRank = getTeamRankingById(awayEspnId)?.previous ?? "";
  const homeRank = String(currentHomeRank);
  const awayRank = String(currentAwayRank);

  /* ---------------- Hooks ---------------- */
  const detailsLeague = isWomen ? "wcbb" : "cbb";

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateYMD
  );

  const isLoadingGame =
    !liveScore ||
    !details ||
    liveScore.home?.total == null ||
    liveScore.away?.total == null;

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const plays = details?.plays ?? [];
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const venue = details?.venue; // optional
  const neutralSite = details?.neutralSite; // optional
  const leaders = details?.leaders ?? [];
  const playerStats = details?.playerStats ?? [];
  const lastPlay = details?.plays?.length
    ? details.plays[details.plays.length - 1]
    : undefined;

  // ✅ Your hook typings are currently too narrow (e.g. "cbb" | "nba"),
  // so we cast only at the call site until you expand the union types.
  const { record: homeRecord } = useTeamRecord(homeEspnId, recordLeague as any);
  const { record: awayRecord } = useTeamRecord(awayEspnId, recordLeague as any);

  /* ---------------- Hooks ---------------- */

  // Pass `isWomen` flag to useLastFiveGames
  const homeLastGames = useLastFiveGames(homeTeamId, isWomen);
  const awayLastGames = useLastFiveGames(awayTeamId, isWomen);

  const { broadcasts } = useGameBroadcasts(
    homeEspnId,
    awayEspnId,
    gameDateISO,
    scoresLeagueKey
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  // Some versions of this hook accept (home, away, date, leagueKey)
  const { headlineText } = useCBBHeadline(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateISO,
    recordLeague as any
  );

  /* ---------------- Neutral site / venue ---------------- */

  const venueNameRaw = (
    details?.venue?.fullName ??
    details?.venue?.name ??
    (homeTeamData as any).venueName ??
    ""
  )
    .trim()
    .toLowerCase();

  const neutralMatch = Object.entries(neutralVenues).find(([key]) =>
    key.trim().toLowerCase().includes(venueNameRaw)
  );

  let resolvedVenue = {
    image:
      (venue as any)?.images?.[0]?.href ??
      (homeTeamData as any).venueImage ??
      "",
    name:
      (venue as any)?.fullName ??
      (venue as any)?.name ??
      (homeTeamData as any).venueName ??
      "",
    city:
      (venue as any)?.address?.city ??
      (homeTeamData as any).location ??
      (homeTeamData as any).city ??
      "",
    address:
      (venue as any)?.address?.street ?? (homeTeamData as any).address ?? "",
    capacity:
      (venue as any)?.capacity ?? (homeTeamData as any).venueCapacity ?? "",
    latitude: (venue as any)?.latitude ?? null,
    longitude: (venue as any)?.longitude ?? null,
  };

  if (neutralMatch) {
    const [venueKey, arena] = neutralMatch as any;
    resolvedVenue = {
      image: arena.venueImage ?? resolvedVenue.image,
      name: arena.name ?? venueKey,
      city: arena.city ?? resolvedVenue.city ?? "",
      address: arena.address ?? resolvedVenue.address ?? "",
      capacity: arena.venueCapacity ?? resolvedVenue.capacity ?? "",
      latitude: arena.latitude ?? resolvedVenue.latitude,
      longitude: arena.longitude ?? resolvedVenue.longitude,
    };
  }

  const lat =
    resolvedVenue?.latitude ??
    (venue as any)?.latitude ??
    (homeTeamData as any)?.latitude ??
    null;

  const lon =
    resolvedVenue?.longitude ??
    (venue as any)?.longitude ??
    (homeTeamData as any)?.longitude ??
    null;

  const { weather } = useWeatherForecast(lat, lon, gameDateYMD);

  /* ---------------- Status / linescore ---------------- */

  const displayClock = safeStr((liveScore as any)?.displayClock);

  const displayHomeScore =
    (liveScore as any)?.home?.total ??
    (gameObj as any)?.scores?.home?.total ??
    0;

  const displayAwayScore =
    (liveScore as any)?.away?.total ??
    (gameObj as any)?.scores?.away?.total ??
    0;

  const lineScore =
    gameStatusDescription && (liveScore as any)?.periodScores?.length
      ? {
          home: (liveScore as any).periodScores.map((p: any) =>
            String(p.home ?? "")
          ),
          away: (liveScore as any).periodScores.map((p: any) =>
            String(p.away ?? "")
          ),
        }
      : undefined;

  const shouldShowGameDetails = !isScheduled;

  // --- Helpers ---
  const formatQuarter = (period?: number | string, statusText?: string) => {
    if (!period && !statusText) return "";

    if (typeof period === "string") {
      const val = period.toLowerCase();
      if (val.includes("ot")) return val.toUpperCase();
      if (val.includes("halftime")) return "Halftime";
      return val;
    }

    const p = Number(period);

    // ✅ WOMEN: 4 quarters
    if (isWomen) {
      if (p === 1) return "1st";
      if (p === 2) return "2nd";
      if (p === 3) return "3rd";
      if (p === 4) return "4th";

      const ot = p - 4;
      return ot === 1 ? "OT" : `${ot}OT`;
    }

    // ✅ MEN: 2 halves
    if (p === 1) return "1st";
    if (p === 2) return "2nd";

    const ot = p - 2;
    return ot === 1 ? "OT" : `${ot}OT`;
  };
  const period = liveScore?.period;



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
          homeTeamCode={homeTeamData.code}
          awayTeamCode={awayTeamData.code}
          isNeutralSite={!!neutralSite}
          league="CBB"
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

  /* ---------------- Vote Team shaping ---------------- */

  const voteAwayTeam = {
    id: awayTeamData.id,
    name: awayTeamData.name,
    code: awayTeamData.code ?? "",
    wLogo: awayTeamData.wLogo,
    logo: awayTeamData.logo,
    logoLight: awayTeamData.logoLight ?? awayTeamData.logo,
    color: awayTeamData.color,
  };

  const voteHomeTeam = {
    id: homeTeamData.id,
    name: homeTeamData.name,
    code: homeTeamData.code ?? "",
    wLogo: homeTeamData.wLogo,
    logo: homeTeamData.logo,
    logoLight: homeTeamData.logoLight ?? homeTeamData.logo,
    color: homeTeamData.color,
  };

  if (isLoadingGame) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
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
          period={formatQuarter(period)}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          league={isWomen ? "wcbb" : "cbb"} // ✅ FIX
          gameStatusDescription={gameStatusDescription}
          gameStatusShortDescription={gameStatusDetail}
        />

        <View style={{ gap: 20, marginTop: 20 }}>
          {!isFinal && !isScheduled && <LastPlay lastPlay={lastPlay} />}

          {shouldShowGameDetails && lineScore && (
            <LineScore
              linescore={lineScore}
              homeCode={homeTeamData.code ?? ""}
              awayCode={awayTeamData.code ?? ""}
              league={isWomen ? "WCBB" : "CBB"} // ✅ FIX
            />
          )}

          {/* <GameOddsSection
            date={gameDateISO}
            gameDate={gameDateISO}
            awayCode={awayTeamData.code ?? ""}
            homeCode={homeTeamData.code ?? ""}
            gameId={`${homeTeamId}-${awayTeamId}`}
          /> */}

          {!isFinal && (
            <WinPredictionVote
              gameId={`${homeTeamId}-${awayTeamId}`}
              awayTeam={voteAwayTeam as any}
              homeTeam={voteHomeTeam as any}
            />
          )}
          {/* Game Leaders show during and after game */}
          {shouldShowGameDetails && (
            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              league={detailsLeague}
            />
          )}

          {shouldShowGameDetails && (
            <ShotChart
              plays={plays}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
              neutralSite={neutralSite}
              isCBB={true}
            />
          )}

          {shouldShowGameDetails && (
            <GameSummary
              plays={plays ?? []}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
              league={isWomen ? "WCBB" : "CBB"}
            />
          )}

          {shouldShowGameDetails && (
            <BoxScore
              playerStats={playerStats}
              homeTeamId={Number(homeEspnId)}
              awayTeamId={Number(awayEspnId)}
            />
          )}

          <LastFiveGamesSwitcher
            isDark={isDark}
            home={{
              teamCode: homeTeamData.code ?? "",
              teamLogo: homeLogo,
              teamLogoLight: isWomen
                ? homeTeamData.wLogo
                : homeTeamData.logoLight ?? homeTeamData.logo,
              games: (homeLastGames as any)?.games ?? [],
            }}
            away={{
              teamCode: awayTeamData.code ?? "",
              teamLogo: awayTeamData.logo,
              teamLogoLight: awayTeamData.logoLight ?? awayTeamData.logo,
              games: (awayLastGames as any)?.games ?? [],
            }}
            league="CBB"
          />

          {highlights?.length > 0 && (
            <HighlightVideoList highlights={highlights} />
          )}

          <Officials officials={officials ?? []} loading={false} error={null} />

          <GameLocation
            venueImage={resolvedVenue.image}
            venueName={resolvedVenue.name}
            location={resolvedVenue.city}
            address={resolvedVenue.address}
            venueCapacity={String(resolvedVenue.capacity ?? "")}
            weather={weather}
            loading={false}
            error={null}
          />
        </View>
      </ScrollView>

      <Animated.View
        style={{
          opacity: opacityAnim,
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
        }}
        pointerEvents={isChatOpen ? "none" : "auto"}
      >
        <FloatingChatButton
          gameId={`${homeTeamId}-${awayTeamId}`}
          openChat={openChat}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
});
