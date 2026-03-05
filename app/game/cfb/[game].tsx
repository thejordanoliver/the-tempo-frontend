import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import CFBGameHeader from "components/Sports/CFB/GameDetails/CFBGameHeader";
import CFBGameOddsSection from "components/Sports/CFB/GameDetails/CFBGameOddsSection";
import CFBGameTeamStats from "components/Sports/CFB/GameDetails/CFBGameTeamStats";
import CFBSeriesHistory from "components/Sports/CFB/GameDetails/CFBSeriesHistory";
import {
  GameLocation,
  LastFiveGamesSwitcher,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import GameLeaders from "components/Sports/NFL/GameDetails/GameLeaders";
import PlayByPlayField from "components/Sports/NFL/GameDetails/PlayByPlayField";
import TeamDrives from "components/Sports/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/Sports/NFL/GameDetails/TeamScoringSummary";
import {
  getRivalryHeadline,
  getTeamInfo,
  neutralStadiums,
} from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBMatchup } from "hooks/CFBHooks/useCFBMatchup";
import { useFootballTeamStats } from "hooks/CFBHooks/useFootballTeamStats";
import { useFootballVenues } from "hooks/CFBHooks/useFootballVenues";
import { useLastFiveGames } from "hooks/CFBHooks/useLastFiveGames";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { CFBGame, emptyAwayTeam, emptyHomeTeam } from "types/cfb";
import { formatGameDateTime, parseGameDate } from "utils/CFBUtils/cfbGameUtils";

export default function CFBGameDetailsScreen() {
  const params = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [parsedGame, setParsedGame] = useState<CFBGame | null>(null);
  const [loading, setLoading] = useState(true); // NEW
  const { openChat, isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const isScrollingRef = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // NEW: Lazy load toggle
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShowDetails(true), 300); // load after 300ms
    return () => clearTimeout(timeout);
  }, []);

  const handleScrollStart = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    isScrollingRef.current = true;

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
      isScrollingRef.current = false;

      Animated.timing(opacityAnim, {
        toValue: isChatOpen ? 0 : 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  useEffect(() => {
    if (!params?.game) return;
    let data: any = null;

    try {
      if (typeof params.game === "string") {
        data = JSON.parse(params.game);
      } else if (Array.isArray(params.game)) {
        // If router passes an array, use the first element
        data = JSON.parse(params.game[0]);
      }
    } catch (e) {
      console.warn("Failed to parse game:", params.game, e);
    }

    if (!data?.game?.id) {
      console.warn("Game data is missing an ID, showing fallback");
      // provide a fallback object to prevent blank screen
      data = {
        game: {
          id: "0",
          status: { short: "NS", long: "Not Started" },
          week: "",
        },
        teams: {
          home: { id: 0, nickname: "Home" },
          away: { id: 0, nickname: "Away" },
        },
        scores: { home: { total: 0 }, away: { total: 0 } },
      };
    }

    setParsedGame(data);
  }, [params?.game]);

  const { stats } = useFootballTeamStats(parsedGame?.game?.id ?? "");

  const { game: gameInfo, teams: teamsData, scores } = parsedGame || {};
  const home = teamsData?.home;
  const away = teamsData?.away;

  const homeId = home?.id ?? 0;
  const awayId = away?.id ?? 0;

  const timestamp = parsedGame?.game.date?.timestamp;

  const awayTeam =
    awayId === -2 ? emptyAwayTeam : (getTeamInfo(awayId) ?? emptyAwayTeam);

  const homeTeam =
    homeId === -1 ? emptyHomeTeam : (getTeamInfo(homeId) ?? emptyHomeTeam);

  const homeCode = homeTeam.code;
  const awayCode = awayTeam.code;
  const homeEspnId = homeTeam.espnID ?? "";
  const awayEspnId = awayTeam.espnID ?? "";

  const hasValidTeams =
    homeTeam?.id !== emptyHomeTeam.id && awayTeam?.id !== emptyAwayTeam.id;

  const { data, loading: gameDetailsLoading } = useFootballGameDetails(
    String(homeTeam.espnID),
    String(awayTeam.espnID),
    gameInfo?.date?.timestamp
      ? new Date(gameInfo.date.timestamp * 1000).toISOString()
      : "",
    "cfb",
  );

  const officials = data?.officials ?? [];
  const currentDrives = data?.currentDrives;
  const previousDrives = data?.previousDrives;

  const venue = data?.venue;
  const neutralSite = data?.neutralSite;
  const headline = data?.headline;
  const broadcast = data?.broadcast;
  const highlights = data?.highlights;
  const scoringPlays = data?.scoringPlays;
  const homeRank = data?.homeRank;
  const awayRank = data?.awayRank;
  const homeRecord = data?.homeRecords.total.summary;
  const awayRecord = data?.awayRecords.total.summary;
  const { data: footballVenues } = useFootballVenues();

  const normalizeVenueName = (name?: string | null) =>
    name
      ?.toLowerCase()
      .replace(/stadium|field|arena|center|centre/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim() ?? "";

  const matchedVenue = useMemo(() => {
    if (!venue?.name || !footballVenues.length) return null;

    const normalizedGameVenue = normalizeVenueName(venue.name);

    return (
      footballVenues.find(
        (v) => normalizeVenueName(v.venue) === normalizedGameVenue,
      ) || null
    );
  }, [venue?.name, footballVenues]);

  // --- Neutral Site Detection Using neutralStadiums ---
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralStadiumEntry = Object.entries(neutralStadiums).find(
    ([stadiumName]) => stadiumName.trim().toLowerCase() === normalizedVenueName,
  );

  // Stadium-lookup detection (fallback only)
  const isNeutralStadiumMatch = !!neutralStadiumEntry;

  // Safely extract stadium override data
  const neutralStadiumData = isNeutralStadiumMatch
    ? neutralStadiumEntry![1]
    : null;
  const neutralStadiumName = isNeutralStadiumMatch
    ? neutralStadiumEntry![0]
    : null;

  // --- Final Venue Resolution ---
  let resolvedVenueName =
    matchedVenue?.venue ?? venue?.name ?? homeTeam?.venue ?? "Unknown Stadium";

  let resolvedVenueCity =
    matchedVenue?.city ?? homeTeam?.city ?? "Unknown City";

  let resolvedVenueAddress = matchedVenue?.address ?? homeTeam?.address ?? "";

  let resolvedVenueCapacity =
    matchedVenue?.venue_capacity ?? homeTeam?.venueCapacity?.toString() ?? "";

  let resolvedVenueImage =
    matchedVenue?.venue_image ?? venue?.image ?? homeTeam?.venueImage ?? null;

  let lat = matchedVenue?.latitude ?? homeTeam?.latitude ?? null;

  let lon = matchedVenue?.longitude ?? homeTeam?.longitude ?? null;

  if (neutralSite && neutralStadiumData) {
    resolvedVenueName = neutralStadiumName ?? resolvedVenueName;
    resolvedVenueCity = neutralStadiumData.city ?? resolvedVenueCity;
    resolvedVenueAddress = neutralStadiumData.address ?? resolvedVenueAddress;
    resolvedVenueCapacity =
      neutralStadiumData.venueCapacity?.toString() ?? resolvedVenueCapacity;
    resolvedVenueImage = neutralStadiumData.venueImage ?? resolvedVenueImage;
    lat = neutralStadiumData.latitude ?? lat;
    lon = neutralStadiumData.longitude ?? lon;
  }

  useLayoutEffect(() => {
    // Only set the header if gameDetails have loaded
    if (!parsedGame || !homeTeam || !awayTeam || gameDetailsLoading) {
      navigation.setOptions({ header: () => null });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamId={homeId}
          awayTeamId={awayId}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          isNeutralSite={neutralSite}
          league="CFB"
        />
      ),
    });
  }, [
    parsedGame,
    homeTeam,
    awayTeam,
    neutralSite,
    gameDetailsLoading,
    navigation,
  ]);
  const gameDate = parseGameDate(gameInfo?.date);
  const { iso: gameDateStr } = formatGameDateTime(gameDate);

  const shortStatus = parsedGame?.game?.status?.short;
  const longStatus = parsedGame?.game?.status?.long ?? "";

  const finalOT = shortStatus === "AOT" ? "Final/OT" : "Final";

  const localDateTime = useMemo(() => {
    if (!timestamp) return null;

    // timestamp is assumed to be in seconds, convert to ms
    const d = new Date(timestamp * 1000);
    return isNaN(d.getTime()) ? null : d;
  }, [timestamp]);

  const formattedDate = localDateTime
    ? localDateTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const formattedTime = localDateTime
    ? localDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  // Determine fallback rivalry name
  const rivalryHeadline = useMemo(() => {
    return getRivalryHeadline(Number(homeEspnId), Number(awayEspnId));
  }, [homeEspnId, awayEspnId]);

  // Choose headline → rivalry → empty string
  const headLine =
    headline && headline.trim().length > 0 ? headline : (rivalryHeadline ?? "");

  const broadcastText = broadcast ?? "";

  const homeTeamIdNum = homeTeam?.id ? Number(homeTeam.id) : 0;
  const awayTeamIdNum = awayTeam?.id ? Number(awayTeam.id) : 0;

  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);

  const matchup = useCFBMatchup(
    undefined,
    undefined,
    awayTeam?.espnID,
    homeTeam?.espnID,
  );

  // --- Weather data ---
  const { weather } = useWeatherForecast(
    lat,
    lon,
    gameDateStr,
    resolvedVenueCity,
  );

  const displayWeather = weather
    ? { ...weather, cityName: resolvedVenueCity }
    : null;

  // --- Possession & Score ---
  const possession = useFootballGamePossession(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
  );

  const {
    gameStatusShortDetail,
    gameStatusDescription,
    period,
    score,
    possessionTeamId,
    firstDownYardLine,
    homeTimeouts,
    awayTimeouts,
    displayClock,
    redzone,
    lastPlay,
    lineScore,
    downDistanceText,
    redzone: isRedzone,
  } = possession;

  const awayScore = score?.away ?? scores?.away?.total;
  const homeScore = score?.home ?? scores?.home?.total;

  const linescore = lineScore ?? { home: [], away: [] };

  if (!parsedGame || !homeTeam || !awayTeam || gameDetailsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator size={60} />
      </View>
    );
  }
  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <CFBGameHeader
          headlineText={headLine}
          awayTeam={awayTeam}
          homeTeam={homeTeam}
          scores={{
            away: { total: awayScore },
            home: { total: homeScore },
          }}
          possessionTeamId={
            possessionTeamId !== undefined
              ? String(possessionTeamId)
              : undefined
          }
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          rankHome={homeRank}
          rankAway={awayRank}
          gameStatusDescription={gameStatusDescription ?? ""}
          period={period}
          displayClock={displayClock}
          downAndDistance={downDistanceText}
          isDark={isDark}
          homeRecord={homeRecord}
          broadcast={broadcastText}
          awayRecord={awayRecord}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          gameStatusShortDetail={gameStatusShortDetail || finalOT}
          redzone={redzone ?? false}
        />

        {/* Lazy-loaded Section */}
        {showDetails && hasValidTeams && (
          <View style={{ gap: 20, marginTop: 20 }}>
            {gameStatusDescription !== "Final" && (
              <WinPredictionVote
                gameId={gameInfo?.id ?? ""}
                awayTeam={{
                  id: awayTeam.id,
                  name: awayTeam.name ?? awayTeam.code,
                  code: awayTeam.code ?? awayTeam.code,
                  logo: awayTeam.logo,
                  logoLight: awayTeam.logoLight,
                  color: awayTeam.color,
                }}
                homeTeam={{
                  id: homeTeam.id,
                  name: homeTeam.name ?? homeTeam.code,
                  code: homeTeam.code ?? homeTeam.code,
                  logo: homeTeam.logo,
                  logoLight: homeTeam.logoLight,
                  color: homeTeam.color,
                }}
              />
            )}

            {homeTeam?.code && awayTeam?.code && gameDateStr ? (
              <CFBGameOddsSection
                date={gameDateStr}
                gameDate={gameDateStr}
                homeId={homeTeam.id}
                awayId={awayTeam.id}
                homeCode={homeTeam.code}
                awayCode={awayTeam.code}
                neutralSite={neutralSite ?? false}
              />
            ) : null}

            {(gameStatusDescription === "In Progress" ||
              gameStatusDescription === "Halftime" ||
              gameStatusDescription === "End of Period" ||
              gameStatusDescription === "Final") && (
              <LineScore
                linescore={{
                  home: linescore.home.map(String),
                  away: linescore.away.map(String),
                }}
                homeCode={homeCode}
                awayCode={awayCode}
              />
            )}

            {(gameStatusDescription === "In Progress" ||
              gameStatusDescription === "Halftime" ||
              gameStatusDescription === "End of Period") && (
              <PlayByPlayField
                lastPlay={lastPlay}
                possessionTeamId={possessionTeamId}
                homeTeamId={Number(homeTeam.id)}
                awayTeamId={Number(awayTeam.id)}
                firstDownYardLine={firstDownYardLine}
                league="CFB"
              />
            )}

            {homeTeam && awayTeam && gameStatusDescription !== "Scheduled" && (
              <GameLeaders
                gameId={String(parsedGame.game.id)}
                homeTeamId={String(homeTeam.id)}
                awayTeamId={String(awayTeam.id)}
                league="CFB"
              />
            )}

            <TeamDrives
              previousDrives={previousDrives ?? []}
              currentDrives={currentDrives ?? []}
              homeTeamId={Number(homeEspnId)}
              awayTeamId={Number(awayEspnId)}
              league="CFB"
            />

            <TeamScoringSummary
              scoringPlays={scoringPlays ?? []}
              homeTeamId={Number(homeEspnId)}
              awayTeamId={Number(awayEspnId)}
              league="CFB"
            />

            {stats && <CFBGameTeamStats stats={stats} />}

            <LastFiveGamesSwitcher
              isDark={isDark}
              away={{
                teamId: awayTeam.id,
                teamCode: awayTeam.code,
                games: awayLastGames.games,
              }}
              home={{
                teamId: homeTeam.id,
                teamCode: homeTeam.code,
                games: homeLastGames.games,
              }}
              league="CFB"
            />

            {matchup.data && (
              <CFBSeriesHistory
                team1Name={awayTeam.code}
                team2Name={homeTeam.code}
                team1Wins={matchup.data.team1Wins}
                team2Wins={matchup.data.team2Wins}
                team1Logo={
                  isDark ? awayTeam.logoLight || awayTeam.logo : awayTeam.logo
                }
                team2Logo={
                  isDark ? homeTeam.logoLight || homeTeam.logo : homeTeam.logo
                }
                ties={matchup.data.ties}
                games={matchup.data.games}
              />
            )}

            <Officials officials={officials} loading={false} error={null} />

            {Array.isArray(highlights) && highlights.length > 0 && (
              <HighlightVideoList highlights={highlights} />
            )}

            {/* Venue Section */}
            <GameLocation
              venueImage={resolvedVenueImage}
              venueName={resolvedVenueName}
              location={resolvedVenueCity}
              address={resolvedVenueAddress}
              venueCapacity={resolvedVenueCapacity}
              venueAttendance={String(venue?.attendance)}
              weather={displayWeather}
              grass={venue?.grass ?? undefined}
              surface="football"
              loading={false}
              error={null}
              lighter={false}
            />
          </View>
        )}
      </ScrollView>
      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={String(parsedGame.game.id)} />
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
