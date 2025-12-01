import { useNavigation } from "@react-navigation/native";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { LineScore, TeamLocationSection } from "components/GameDetails";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import Officials from "components/GameDetails/Officials";
import Weather from "components/GameDetails/Weather";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import LastPlay from "components/NFL/GameDetails/LastPlay";
import NFLGameHeader from "components/NFL/GameDetails/NFLGameHeader";
import NFLGameLeaders from "components/NFL/GameDetails/NFLGameLeaders";
import NFLGameOddsSection from "components/NFL/GameDetails/NFLGameOddsSection";
import NFLGameTeamStats from "components/NFL/GameDetails/NFLGameTeamStats";
import NFLInjuries from "components/NFL/GameDetails/NFLInjuries";
import LastPlayField from "components/NFL/GameDetails/PlayByPlayField";
import TeamDrives from "components/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/NFL/GameDetails/TeamScoringSummary";
import { Colors } from "constants/Colors";
import { getTeamInfo, neutralStadiums, venueImages } from "constants/teamsNFL";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useLastFiveGames } from "hooks/NFLHooks/useLastFiveGames";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useNFLGameDetails } from "hooks/NFLHooks/useNFLGameDetails";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { useNFLTeamStats } from "hooks/NFLHooks/useNFLTeamStats";
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
import { emptyTeam } from "types/nfl";
import { getBroadcastDisplay } from "utils/matchBroadcast";
export default function NFLGameDetailsScreen() {
  const params = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [parsedGame, setParsedGame] = useState<any>(null);
  const { openChat, isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 👇 Put at top of component
  const [collapsed, setCollapsed] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Only update collapsed state when the change is real, not every pixel
  const lastCollapsedRef = useRef(false);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const now = Date.now();

      // throttle to 50ms (20fps)
      if (now - lastUpdateRef.current < 50) return;
      lastUpdateRef.current = now;

      const shouldCollapse = value > 60;

      // prevent useless re-renders
      if (shouldCollapse !== lastCollapsedRef.current) {
        lastCollapsedRef.current = shouldCollapse;
        setCollapsed(shouldCollapse);
      }
    });

    return () => scrollY.removeListener(listener);
  }, []);

  // NEW: Lazy load toggle
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShowDetails(true), 300); // load after 300ms
    return () => clearTimeout(timeout);
  }, []);

  const handleScrollStart = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    setIsScrolling(true);
  };

  const handleScrollEnd = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isChatOpen || isScrolling ? 0 : 1,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isChatOpen, isScrolling]);

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

  const { stats } = useNFLTeamStats(parsedGame?.game?.id);

  const { game: gameInfo, teams: teamsData, scores } = parsedGame || {};
  const home = teamsData?.home;
  const away = teamsData?.away;

  const homeTeam = home ? getTeamInfo(home.id) ?? emptyTeam : emptyTeam;
  const awayTeam = away ? getTeamInfo(away.id) ?? emptyTeam : emptyTeam;

  const isNeutralSite =
    gameInfo?.venue?.name &&
    ![homeTeam?.venue, awayTeam?.venue].includes(gameInfo.venue.name);

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
          league="NFL"
          homeTeamCode={safeHomeCode}
          awayTeamCode={safeAwayCode}
          isTeamScreen={false}
          isNeutralSite={!!isNeutralSite}
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

  const {
    officials,
    injuries,
    previousDrives,
    currentDrives,
    venue,
    highlights,
    scoringPlays,
  } = useNFLGameDetails(
    homeTeam.espnID,
    awayTeam.espnID,
    gameInfo?.date?.timestamp
      ? new Date(gameInfo.date.timestamp * 1000).toISOString()
      : ""
  );

  type GameStatus =
    | "Scheduled"
    | "In Progress"
    | "Halftime"
    | "Final"
    | "Canceled"
    | "Postponed"
    | "Delayed";

  const statusMap: Record<string, GameStatus> = {
    NS: "Scheduled",
    Q1: "In Progress",
    Q2: "In Progress",
    Q3: "In Progress",
    Q4: "In Progress",
    OT: "In Progress",
    OVERTIME: "In Progress",
    HT: "Halftime",
    FT: "Final",
    AOT: "Final",
    CANC: "Canceled",
    PST: "Postponed",
    DELAYED: "Delayed",
  };

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

  const rawStatus = (
    gameInfo?.status?.short ||
    gameInfo?.status?.long ||
    ""
  ).toUpperCase();
  const gameStatus: GameStatus = statusMap[rawStatus] ?? "Scheduled";

  const awayIsWinner =
    gameStatus === "Final" &&
    (scores?.away?.total ?? 0) > (scores?.home?.total ?? 0);

  const homeIsWinner =
    gameStatus === "Final" &&
    (scores?.home?.total ?? 0) > (scores?.away?.total ?? 0);

  const gameDateObj = useMemo(() => {
    if (!gameInfo?.date) return null;
    let raw: string | number | null = null;
    if (typeof gameInfo.date === "object") {
      if (gameInfo.date.timestamp) {
        raw = gameInfo.date.timestamp * 1000;
      } else if (gameInfo.date.date) {
        raw = gameInfo.date.date;
      }
    } else if (typeof gameInfo.date === "string") {
      raw = gameInfo.date;
    }
    const date = raw ? new Date(raw) : null;
    return date && !isNaN(date.getTime()) ? date : null;
  }, [gameInfo?.date]);

  const gameDateStr = gameDateObj?.toISOString() ?? "";

  const { record: awayRecord } = useNFLTeamRecord(away?.id);
  const { record: homeRecord } = useNFLTeamRecord(home?.id);

  const lat = isNeutralSite
    ? neutralStadiums[gameInfo?.venue?.name ?? ""]?.latitude ?? null
    : homeTeam?.latitude ?? null;

  const lon = isNeutralSite
    ? neutralStadiums[gameInfo?.venue?.name ?? ""]?.longitude ?? null
    : homeTeam?.longitude ?? null;

  const stadiumData = isNeutralSite
    ? neutralStadiums[gameInfo?.venue?.name ?? ""]
    : homeTeam;

  const { weather } = useWeatherForecast(
    lat,
    lon,
    gameDateStr,
    stadiumData?.city ?? ""
  );

  const displayWeather = weather
    ? { ...weather, cityName: stadiumData?.city ?? "Unknown" }
    : null;

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

  const { broadcasts, loading } = useNFLGameBroadcasts(
    homeTeam.code ?? "",
    awayTeam.code ?? "",
    gameDateStr ?? ""
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  const linescore = useMemo(() => {
    if (!scores) return { home: [], away: [] };
    const homePeriods = [
      scores.home?.quarter_1,
      scores.home?.quarter_2,
      scores.home?.quarter_3,
      scores.home?.quarter_4,
    ];
    const awayPeriods = [
      scores.away?.quarter_1,
      scores.away?.quarter_2,
      scores.away?.quarter_3,
      scores.away?.quarter_4,
    ];
    if (scores.home?.overtime != null) homePeriods.push(scores.home.overtime);
    if (scores.away?.overtime != null) awayPeriods.push(scores.away.overtime);
    return {
      home: homePeriods.map((v) => (v != null ? String(v) : "-")),
      away: awayPeriods.map((v) => (v != null ? String(v) : "-")),
    };
  }, [scores]);

  const homeTeamName = homeTeam?.name ?? ""; // e.g., "Green Bay Packers"
  const awayTeamName = awayTeam?.name ?? ""; // e.g., "Washington Commanders"
  const homeTeamIdNum = Number(homeTeam.id);
  const awayTeamIdNum = Number(awayTeam.id);
  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);
  const {
    possessionTeamId,
    shortDownDistanceText,
    gameStatusDescription,
    downDistanceText,
    firstDownYardLine,
    lastPlay,
    displayClock,
    period,
    homeTimeouts,
    awayTimeouts,
    possessionText,
    score: liveScore,
    loading: possessionLoading,
  } = useNFLGamePossession(homeTeamName, awayTeamName, gameDateStr);

  const { headlineText } = useGameInfo(
    Number(homeTeam?.espnID),
    Number(awayTeam?.espnID),
    gameDateStr,
    "nfl"
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
        {/* Teams & Score Section */}
        <NFLGameHeader
          headlineText={headlineText}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          scores={liveScore ?? scores} // ✅ liveScore from possession hook, fallback to parsed game scores
          possessionTeamId={
            possessionTeamId !== undefined
              ? String(possessionTeamId)
              : undefined
          }
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          colors={colors}
          status={gameStatusDescription ?? gameStatus}
          period={formatPeriod(period ?? gameInfo?.status?.short ?? "")}
          displayClock={displayClock ?? gameInfo?.status?.timer ?? ""}
          possessionText={possessionText ?? ""}
          isDark={isDark}
          homeRecord={homeRecord?.overall ?? undefined}
          awayRecord={awayRecord?.overall ?? undefined}
          networkString={broadcastText}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          playoffInfo={gameInfo?.week}
          isCollapsed={collapsed}
        />

        {/* Lazy-loaded Section */}
        {showDetails && (
          <View style={{ gap: 20, marginTop: 20 }}>
            <LineScore
              linescore={linescore}
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

            {/* Last Play Section */}
            <LastPlay lastPlay={lastPlay} isDark={isDark} />
            {/* Last Play Field - only show when game is live */}
            {(gameStatus === "In Progress" || gameStatus === "Halftime") && (
              <LastPlayField
                lastPlay={lastPlay}
                possessionTeamId={possessionTeamId}
                homeTeamId={Number(homeTeam.id)} // ensure number
                awayTeamId={Number(awayTeam.id)} // ensure number
              />
            )}

            {/* <LastPlayField lastPlay={fgPlay} homeTeamId={22} awayTeamId={14} /> */}

            {/* Odds */}
            {homeTeam?.code && awayTeam?.code && gameDateStr ? (
              <NFLGameOddsSection
                date={gameDateStr}
                gameDate={gameDateStr}
                homeCode={homeTeam.code}
                awayCode={awayTeam.code}
              />
            ) : null}

            <WinPredictionVote
              gameId={gameInfo.id}
              awayTeam={{
                id: awayTeam.id,
                name: awayTeam.name || awayTeam.code,
                code: awayTeam.code ?? awayTeam.code,
                logo: awayTeam.logo,
                logoLight: awayTeam.logoLight,
                color: awayTeam.color,
                secondaryColor: awayTeam.secondaryColor,
              }}
              homeTeam={{
                id: homeTeam.id,
                name: homeTeam.name || homeTeam.code,
                code: homeTeam.code ?? homeTeam.code,
                logo: homeTeam.logo,
                logoLight: homeTeam.logoLight,
                color: homeTeam.color,
                secondaryColor: homeTeam.secondaryColor,
              }}
            />

            {/* Game Leaders - only when game is live */}
            {(gameStatus === "In Progress" ||
              gameStatus === "Halftime" ||
              gameStatus === "Final") && (
              <NFLGameLeaders
                gameId={String(parsedGame.game.id)}
                homeTeamId={String(homeTeam.id)}
                awayTeamId={String(awayTeam.id)}
              />
            )}

            <TeamDrives
              previousDrives={previousDrives ?? []}
              currentDrives={currentDrives ?? []}
              homeTeamId={Number(homeTeam?.espnID)}
              awayTeamId={Number(awayTeam?.espnID)}
            />

            <TeamScoringSummary
              scoringPlays={scoringPlays ?? []}
              awayTeamAbbr={awayTeam?.code}
              homeTeamAbbr={homeTeam?.code}
              league="NFL"
            />

            {stats && <NFLGameTeamStats stats={stats} />}

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
              league="NFL"
            />

            {gameStatus === "Final" && (
              <HighlightVideoList highlights={highlights} />
            )}

            <NFLInjuries
              injuries={injuries}
              loading={false}
              error={null}
              awayTeamAbbr={awayTeam.code}
              homeTeamAbbr={homeTeam.code}
            />
            {gameStatus !== "Final" && (
              <Officials officials={officials} loading={false} error={null} />
            )}
            {/* Location */}
            {(
              isNeutralSite
                ? gameInfo?.venue?.name || gameInfo?.venue?.city
                : homeTeam?.venue || homeTeam?.location
            ) ? (
              <TeamLocationSection
                venueImage={
                  isNeutralSite
                    ? venueImages[gameInfo?.venue?.name ?? ""] ||
                      venueImages[gameInfo?.venue?.city ?? ""]
                    : homeTeam?.venueImage
                }
                venueName={
                  isNeutralSite
                    ? neutralStadiums[gameInfo?.venue?.name ?? ""]?.name ?? ""
                    : homeTeam?.venue ?? ""
                }
                location={
                  isNeutralSite
                    ? gameInfo?.venue?.city ?? ""
                    : homeTeam?.location ?? ""
                }
                address={
                  isNeutralSite
                    ? neutralStadiums[gameInfo?.venue?.name ?? ""]?.address ??
                      ""
                    : homeTeam?.address ?? ""
                }
                venueCapacity={
                  isNeutralSite
                    ? neutralStadiums[gameInfo?.venue?.name ?? ""]
                        ?.venueCapacity ?? ""
                    : homeTeam?.venueCapacity ?? ""
                }
                surface="football"
                grass={venue?.grass ?? undefined}
                loading={false}
                error={null}
                lighter={false}
              />
            ) : null}

            {/* Weather */}
            {displayWeather && gameStatus !== "Final" ? (
              <Weather
                weather={displayWeather}
                address={stadiumData?.city ?? ""}
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
