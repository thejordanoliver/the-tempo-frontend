import { useNavigation } from "@react-navigation/native";
import CFBGameLeaders from "components/CFB/GameDetails/CFBGameLeaders";
import CFBGameHeader from "components/CFB/GameDetails/CFBGameTeamsHeader";
import CFBGameTeamStats from "components/CFB/GameDetails/FootballGameTeamStats";
import LastPlay from "components/CFB/GameDetails/LastPlay";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  LastFiveGamesSwitcher,
  LineScore,
  TeamLocationSection,
} from "components/GameDetails";
import CFBGameOddsSection from "components/GameDetails/GameOddsSection";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import Officials from "components/GameDetails/Officials";
import Weather from "components/GameDetails/Weather";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import LastPlayField from "components/NFL/GameDetails/PlayByPlayField";
import TeamDrives from "components/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/NFL/GameDetails/TeamScoringSummary";
import { Colors } from "constants/Colors";
import { getTeamInfo, neutralStadiums, teams } from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useCFBGameDetails } from "hooks/CFBHooks/useCFBGameDetails";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBLineScore } from "hooks/CFBHooks/useCFBLineScore";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useFootballTeamStats } from "hooks/CFBHooks/useFootballTeamStats";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useLastFiveGames } from "hooks/CFBHooks/useLastFiveGames";
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
  getGameStatus,
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  parseGameDate,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function CFBGameDetailsScreen() {
  const params = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [parsedGame, setParsedGame] = useState<CFBGame | null>(null);
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

  const { lineScore } = useCFBLineScore(
    homeTeam?.espnID ? Number(homeTeam.espnID) : undefined,
    awayTeam?.espnID ? Number(awayTeam.espnID) : undefined,
    parsedGame?.game?.date
      ? { timestamp: parsedGame.game.date } // ✅ date is third argument
      : undefined
  );

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

  // --- Officials & Injuries
  const {
    officials,
    neutralSite,
    scoringPlays,
    previousDrives,
    currentDrives,
    venue,
    highlights,
  } = useCFBGameDetails(
    String(awayEspnId || emptyAwayTeam.espnID),
    String(homeEspnId || emptyHomeTeam.espnID),
    gameDateObj?.toISOString()
  );

  const linescore = lineScore ?? { home: [], away: [] };

  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

  // --- Neutral Site Detection Using neutralStadiums ---
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralStadiumEntry = Object.entries(neutralStadiums).find(
    ([stadiumName]) => stadiumName.trim().toLowerCase() === normalizedVenueName
  );

  const isNeutralSite = !!neutralStadiumEntry;
  const neutralStadiumData = isNeutralSite ? neutralStadiumEntry[1] : null;
  const neutralStadiumName = isNeutralSite ? neutralStadiumEntry[0] : null;

  // --- Final Venue Resolution ---
  let resolvedVenueName = venue?.name ?? homeTeam?.venue ?? "Unknown Stadium";
  let resolvedVenueCity = homeTeam?.city ?? "Unknown City";
  let resolvedVenueAddress = homeTeam?.address ?? "";
  let resolvedVenueCapacity = homeTeam?.venueCapacity?.toString() ?? "";
  let resolvedVenueImage = venue?.image ?? "";
  let lat = homeTeam?.latitude ?? null;
  let lon = homeTeam?.longitude ?? null;

  if (isNeutralSite && neutralStadiumData) {
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
          isNeutralSite={neutralSite}
        />
      ),
    });
  }, [homeTeam, awayTeam, isNeutralSite, navigation]);

  // --- Colors ---
  const colors = useMemo(
    () => ({
      background: isDark ? Colors.black : Colors.white,
      text: isDark ? Colors.dark.white : Colors.light.black,
      secondaryText: isDark ? Colors.lightGray : Colors.darkGray,
      record: isDark ? Colors.dark.white : Colors.light.black,
      score: isDark ? Colors.lightGray : Colors.darkGray,
      winnerScore: isDark ? Colors.dark.white : Colors.light.black,
      border: isDark ? Colors.darkGray : Colors.lightGray,
      finalText: isDark ? Colors.dark.lightRed : Colors.light.red,
    }),
    [isDark]
  );

  const gameDate = parseGameDate(gameInfo?.date);
  const { iso: gameDateStr } = formatGameDateTime(gameDate);
  const gameStatus = getGameStatus(
    gameInfo?.status?.short ?? gameInfo?.status?.long
  );

  const { headlineText } = useGameInfo(
    Number(homeTeam?.espnID),
    Number(awayTeam?.espnID),
    gameDateStr,
    "cfb"
  );

  const formatPeriod = (raw: string | number | undefined | null) => {
    if (!raw) return "";

    const map: Record<string, string> = {
      1: "1st",
      2: "2nd",
      3: "3rd",
      4: "4th",
      OT: "OT",
      OVERTIME: "OT",
      HT: "Halftime",
      FT: "Final",
    };

    if (typeof raw === "string") {
      const normalized = raw.toUpperCase();
      if (map[normalized]) return map[normalized];
    }

    if (typeof raw === "number") {
      if (raw <= 4) {
        const suffix =
          raw === 1 ? "st" : raw === 2 ? "nd" : raw === 3 ? "rd" : "th";
        return `${raw}${suffix}`;
      }
      // Handle OT numbers (5 = OT, 6 = 2OT, 7 = 3OT, etc.)
      const overtimeNumber = raw - 4;
      return overtimeNumber === 1 ? "OT" : `${overtimeNumber}OT`;
    }

    return String(raw);
  };

  const formattedDate = gameDateObj
    ? gameDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const formattedTime = gameDateObj
    ? gameDateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const { broadcasts, loading } = useCFBGameBroadcasts(
    homeTeam?.code ?? "",
    awayTeam?.code ?? "",
    gameDateStr ?? ""
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  const homeTeamIdNum = homeTeam?.id ? Number(homeTeam.id) : 0;
  const awayTeamIdNum = awayTeam?.id ? Number(awayTeam.id) : 0;

  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);

  // ✅ Load both CFP and AP rankings
  const cfpTop25 = useCFPTop25();
  const apTop25 = useAPTop25();

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
    shortDownDistanceText,
    downDistanceText,
    firstDownYardLine,
    lastPlay,
    displayClock,
    period,
    score,
    homeTimeouts,
    gameStatusShortDetail,
    awayTimeouts,
    loading: possessionLoading,
  } = useCFBGamePossession(
    homeTeam ? Number(homeTeam.espnID) : undefined,
    awayTeam ? Number(awayTeam.espnID) : undefined,
    gameDateStr
  );

  if (!parsedGame || !homeTeam || !awayTeam) return <View />;

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        style={{ backgroundColor: colors.background }}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <CFBGameHeader
          headlineText={headlineText}
          awayTeam={awayTeam}
          homeTeam={homeTeam}
          // ✅ Use live score if available, fallback to parsed score
          scores={{
            away: { total: score?.away ?? scores?.away?.total },
            home: { total: score?.home ?? scores?.home?.total },
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
          colors={colors}
          status={gameStatus}
          period={formatPeriod(period ?? gameInfo?.status?.short ?? "")}
          displayClock={displayClock}
          downAndDistance={downDistanceText}
          isDark={isDark}
          homeRecord={homeRecord?.overall ?? undefined}
          networkString={broadcastText}
          awayRecord={awayRecord?.overall ?? undefined}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
        />

        {/* Lazy-loaded Section */}
        {showDetails && hasValidTeams && (
          <View style={{ gap: 20, marginTop: 20 }}>
            {gameStatus !== "Final" && (
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

            {/* Last Play Section */}
            <LastPlay lastPlay={lastPlay} isDark={isDark} />

            {(gameStatus === "In Progress" || gameStatus === "Halftime") && (
              <LastPlayField
                lastPlay={lastPlay}
                possessionTeamId={possessionTeamId}
                homeTeamId={Number(homeTeam.id)} // ensure number
                awayTeamId={Number(awayTeam.id)} // ensure number
                league="CFB"
              />
            )}
            {(gameStatus === "In Progress" ||
              gameStatus === "Halftime" ||
              gameStatus === "Final") && (
              <LineScore
                linescore={{
                  home: linescore.home.map(String),
                  away: linescore.away.map(String),
                }}
                homeCode={
                  homeTeam?.code && homeTeam.code !== "UNK"
                    ? homeTeam.code
                    : "HOM"
                }
                awayCode={
                  awayTeam?.code && awayTeam.code !== "UNK"
                    ? awayTeam.code
                    : "AWY"
                }
              />
            )}

            {/* Odds */}
            {homeTeam?.code && awayTeam?.code && gameDateStr ? (
              <CFBGameOddsSection
                date={gameDateStr}
                gameDate={gameDateStr}
                homeCode={homeTeam.code ?? ""}
                awayCode={awayTeam.code ?? ""}
                gameId={parsedGame.game.id}
              />
            ) : null}

            {homeTeam && awayTeam && gameStatus !== "Scheduled" && (
              <CFBGameLeaders
                gameId={String(gameInfo?.id)}
                homeTeamId={String(homeTeam.id)}
                awayTeamId={String(awayTeam.id)}
              />
            )}

            <TeamDrives
              previousDrives={previousDrives ?? []}
              currentDrives={currentDrives ?? []}
              awayTeamAbbr={awayTeam?.code}
              homeTeamAbbr={homeTeam?.code}
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
                teamCode: homeTeam.code ?? "",
                teamLogo: homeTeam.logo,
                teamLogoLight: homeTeam.logoLight,
                games: homeLastGames.games,
              }}
              away={{
                teamCode: awayTeam.code ?? "",
                teamLogo: awayTeam.logo,
                teamLogoLight: awayTeam.logoLight,
                games: awayLastGames.games,
              }}
              league="CFB"
            />

            <Officials officials={officials} loading={false} error={null} />

            {gameStatus === "Final" && (
              <HighlightVideoList highlights={highlights} />
            )}

            {/* ✅ Team Location / Venue Section */}
            <TeamLocationSection
              venueImage={resolvedVenueImage}
              venueName={resolvedVenueName}
              location={resolvedVenueCity}
              address={resolvedVenueAddress}
              venueCapacity={resolvedVenueCapacity}
              venueAttendancee={
                venue?.attendance
                  ? String(venue.attendance)
                  : venue?.capacity
                  ? String(venue.capacity)
                  : "N/A"
              }
              loading={false}
              error={null}
              lighter={false}
              surface="football"
              grass={venue?.grass ?? undefined}
            />

            {/* Weather */}
            {displayWeather && gameStatus !== "Final" ? (
              <Weather
                weather={displayWeather}
                address={resolvedVenueAddress ?? ""}
                loading={false}
                error={null}
                lighter={false}
              />
            ) : null}
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
