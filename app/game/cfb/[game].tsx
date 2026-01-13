import { useNavigation } from "@react-navigation/native";
import CFBGameHeader from "components/CFB/GameDetails/CFBGameHeader";
import CFBGameOddsSection from "components/CFB/GameDetails/CFBGameOddsSection";
import CFBGameTeamStats from "components/CFB/GameDetails/CFBGameTeamStats";
import CFBSeriesHistory from "components/CFB/GameDetails/CFBSeriesHistory";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  GameLocation,
  LastFiveGamesSwitcher,
  LineScore,
} from "components/GameDetails";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import Officials from "components/GameDetails/Officials";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import GameLeaders from "components/NFL/GameDetails/GameLeaders";
import LastPlayField from "components/NFL/GameDetails/PlayByPlayField";
import TeamDrives from "components/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/NFL/GameDetails/TeamScoringSummary";
import {
  getRivalryHeadline,
  getTeamInfo,
  neutralStadiums,
  teams,
} from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBMatchup } from "hooks/CFBHooks/useCFBMatchup";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useFootballTeamStats } from "hooks/CFBHooks/useFootballTeamStats";
import { useFootballVenues } from "hooks/CFBHooks/useFootballVenues";
import { useLastFiveGames } from "hooks/CFBHooks/useLastFiveGames";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
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
import {
  formatGameDateTime,
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  parseGameDate,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";

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

  const homeIdNum = home?.id ?? 0;
  const awayIdNum = away?.id ?? 0;

  const timestamp = parsedGame?.game.date?.timestamp;

  const awayTeam =
    awayIdNum === -2 ? emptyAwayTeam : getTeamInfo(awayIdNum) ?? emptyAwayTeam;

  const homeTeam =
    homeIdNum === -1 ? emptyHomeTeam : getTeamInfo(homeIdNum) ?? emptyHomeTeam;

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  // --- Team records ---
  const awayEspnId = getTeamById(away?.id)?.espnID;
  const homeEspnId = getTeamById(home?.id)?.espnID;

  const hasValidTeams =
    homeTeam?.id !== emptyHomeTeam.id && awayTeam?.id !== emptyAwayTeam.id;

  // ✅ Safe game date parsing
  const gameDateObj = useMemo(() => {
    const rawDate = parsedGame?.game?.date;
    if (!rawDate) return null;

    if (typeof rawDate === "number") return new Date(rawDate * 1000);
    if (typeof rawDate === "string") return new Date(rawDate);
    if (typeof rawDate === "object" && rawDate.timestamp)
      return new Date(rawDate.timestamp * 1000);

    return null;
  }, [parsedGame?.game?.date]);

  const { data, loading: gameDetailsLoading } = useFootballGameDetails(
    String(homeTeam.espnID),
    String(awayTeam.espnID),
    gameInfo?.date?.timestamp
      ? new Date(gameInfo.date.timestamp * 1000).toISOString()
      : "",
    "cfb"
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
        (v) => normalizeVenueName(v.venue) === normalizedGameVenue
      ) || null
    );
  }, [venue?.name, footballVenues]);

  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

  // --- Neutral Site Detection Using neutralStadiums ---
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralStadiumEntry = Object.entries(neutralStadiums).find(
    ([stadiumName]) => stadiumName.trim().toLowerCase() === normalizedVenueName
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

    const safeHomeCode =
      homeTeam?.code && homeTeam.code !== "UNK" ? homeTeam.code : "HOM";
    const safeAwayCode =
      awayTeam?.code && awayTeam.code !== "UNK" ? awayTeam.code : "AWY";

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          league="CFB"
          homeTeamCode={safeHomeCode}
          awayTeamCode={safeAwayCode}
          isTeamScreen={false}
          isNeutralSite={neutralSite} // ESPN true/false from summary > scoreboard
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
  console.log(longStatus)
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
    headline && headline.trim().length > 0 ? headline : rivalryHeadline ?? "";

  const broadcastText = broadcast ?? "";

  const homeTeamIdNum = homeTeam?.id ? Number(homeTeam.id) : 0;
  const awayTeamIdNum = awayTeam?.id ? Number(awayTeam.id) : 0;

  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);

  const matchup = useCFBMatchup(
    undefined,
    undefined,
    awayTeam?.espnID,
    homeTeam?.espnID
  );

  // ✅ Load both CFP and AP rankings
  const cfpTop25 = useCFPTop25();
  const apTop25 = useAPTop25();

  const formatQuarter = (period?: string) => {
    if (!period) return "";

    const p = Number(period);
    if (!isNaN(p)) {
      if (p <= 4) return ["1st", "2nd", "3rd", "4th"][p - 1];
      const otNumber = p - 4;
      return otNumber === 1 ? "OT" : `OT${otNumber}`;
    }

    // fallback for string values like "ot", "overtime"
    const val = String(period).toLowerCase();
    if (val.includes("ot") || val.includes("overtime")) {
      const match = val.match(/\d+/);
      return match ? `OT${match[0]}` : "OT";
    }

    if (val.includes("half")) return "Halftime";

    return period;
  };

  // ✅ Get ranking, falling back to AP poll if CFP is missing
  // Check if CFP rankings are active (after they’ve been released)
  const isCFPActive = cfpTop25 && cfpTop25.length > 0;

  // Main helper to get rank with conditional fallback
  const getTeamRank = (id: number | string) => {
    if (isCFPActive) {
      // ✅ Use CFP ranking if rankings are active
      return getTeamRankFromCFPById(id, cfpTop25) ?? "";
    }
    // 🕓 Early season — fallback to AP Top 25
    return getTeamRankFromAPById(id, apTop25) ?? "";
  };

  // --- Weather data ---
  const { weather } = useWeatherForecast(
    lat,
    lon,
    gameDateStr,
    resolvedVenueCity
  );

  const displayWeather = weather
    ? { ...weather, cityName: resolvedVenueCity }
    : null;

  const {
    possessionTeamId,
    downDistanceText,
    lastPlay,
    displayClock,
    period,
    score,
    homeTimeouts,
    gameStatusDescription,
    gameStatusShortDetail,
    redzone,
    lineScore,
    awayTimeouts,
    loading: possessionLoading,
  } = useCFBGamePossession(
    Number(awayTeam.espnID),
    Number(homeTeam.espnID),
    gameDateStr
  );

  const awayScore = score?.away ?? scores?.away?.total;
  const homeScore = score?.home ?? scores?.home?.total;

  const normalizeParsedScore = (
    score:
      | {
          quarter_1?: number;
          quarter_2?: number;
          quarter_3?: number;
          quarter_4?: number;
          overtime?: number;
        }
      | undefined
  ): number[] => {
    if (!score) return [];

    return [
      score.quarter_1,
      score.quarter_2,
      score.quarter_3,
      score.quarter_4,
      score.overtime,
    ].filter((v): v is number => typeof v === "number");
  };

  const normalizedLineScore = useMemo(() => {
    return {
      home: lineScore?.home ?? normalizeParsedScore(parsedGame?.scores?.home),

      away: lineScore?.away ?? normalizeParsedScore(parsedGame?.scores?.away),
    };
  }, [lineScore, parsedGame]);

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
          rankHome={getTeamRank(String(homeEspnId)) ?? ""}
          rankAway={getTeamRank(String(awayEspnId)) ?? ""}
          gameStatusDescription={gameStatusDescription ?? longStatus}
          period={formatQuarter(period ?? "")}
          displayClock={displayClock}
          downAndDistance={downDistanceText}
          isDark={isDark}
          homeRecord={homeRecord?.overall ?? undefined}
          networkString={broadcastText}
          awayRecord={awayRecord?.overall ?? undefined}
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

            {gameStatusDescription === "In Progress" ||
              (gameStatusDescription === "Final" && (
                <LineScore
                  linescore={normalizedLineScore}
                  homeCode={homeTeam?.code}
                  awayCode={awayTeam?.code}
                />
              ))}

            {(gameStatusDescription === "In Progress" ||
              gameStatusDescription === "Halftime") && (
              <LastPlayField
                lastPlay={lastPlay}
                possessionTeamId={possessionTeamId}
                homeTeamId={Number(homeTeam.id)}
                awayTeamId={Number(awayTeam.id)}
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
              awayTeamAbbr={awayTeam?.code}
              homeTeamAbbr={homeTeam?.code}
              league="CFB"
            />

            {stats && <CFBGameTeamStats stats={stats} />}

            <LastFiveGamesSwitcher
              isDark={isDark}
              home={{
                teamCode: homeTeam.code,
                teamLogo: homeTeam.logo,
                teamLogoLight: homeTeam.logoLight,
                games: homeLastGames.games,
              }}
              away={{
                teamCode: awayTeam.code,
                teamLogo: awayTeam.logo,
                teamLogoLight: awayTeam.logoLight,
                games: awayLastGames.games,
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
      <MemoizedFloatingChatButton gameId={parsedGame?.game?.id} />
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
