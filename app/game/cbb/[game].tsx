import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FloatingChatButton from "components/FloatingButton";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameHeader from "components/Sports/CBB/GameDetails/GameHeader";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/CBB/GameDetails/GameTeamStats";
import LastPlay from "components/Sports/CBB/GameDetails/LastPlay";
import PlayersInFoulTrouble from "components/Sports/CBB/GameDetails/PlayersInFoulTrouble";
import PlayersOnCourt from "components/Sports/CBB/GameDetails/PlayersOnCourt";
import {
  GameLocation,
  LastFiveGamesSwitcher,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import GameSummary from "components/Sports/NBA/GameDetails/GameSummary";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import { neutralVenues, teams } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameDetails } from "hooks/useGameDetails";
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
  // console.log(JSON.stringify(leaders,null ,2))

  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  /* ---------------- Hooks ---------------- */

  // Pass `isWomen` flag to useLastFiveGames
  const homeLastGames = useLastFiveGames(homeTeamId, isWomen);
  const awayLastGames = useLastFiveGames(awayTeamId, isWomen);

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
          homeTeamId={isWomen ? (homeTeamData as any).wid : homeTeamData.id}
          awayTeamId={isWomen ? (awayTeamData as any).wid : awayTeamData.id}
          homeTeamCode={homeTeamData.code}
          awayTeamCode={awayTeamData.code}
          isNeutralSite={!!neutralSite}
          league={isWomen ? "WCBB" : "CBB"}
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
          period={period}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          league={isWomen ? "wcbb" : "cbb"} // ✅ FIX
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

            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              league={detailsLeague}
              gameStatusDescription={gameStatusDescription}
            />

            {(isHalftime || inProgress) && (
              <PlayersInFoulTrouble
                gameId={gameObj.id}
                home={homeTeamData}
                away={awayTeamData}
              />
            )}

            {(isHalftime || inProgress) && (
              <ShotChart
                plays={plays}
                homeTeamId={String(homeEspnId)}
                awayTeamId={String(awayEspnId)}
                neutralSite={neutralSite}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            {(isHalftime || inProgress) && (
              <GameSummary
                plays={plays ?? []}
                homeTeamId={String(homeEspnId)}
                awayTeamId={String(awayEspnId)}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            <GameTeamStats
              stats={teamStats}
              gameStatusDescription={gameStatusDescription}
            />

            {(isHalftime || inProgress) && (
              <BoxScore
                playerStats={playerStats}
                homeTeamId={Number(homeEspnId)}
                awayTeamId={Number(awayEspnId)}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            {(isHalftime || inProgress) && (
              <PlayersOnCourt
                playerStats={playerStats}
                homeTeamId={Number(homeEspnId)}
                awayTeamId={Number(awayEspnId)}
                league={isWomen ? "WCBB" : "CBB"}
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

            <Officials
              officials={officials ?? []}
              loading={false}
              error={null}
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
            />
          </View>
        )}
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
