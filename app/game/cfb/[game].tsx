import { useNavigation } from "@react-navigation/native";
import CFBGameLeaders from "components/CFB/GameDetails/CFBGameLeaders";
import CFBGameHeader from "components/CFB/GameDetails/CFBGameTeamsHeader";
import CFBGameTeamStats from "components/CFB/GameDetails/FootballGameTeamStats";
import { HighlightVideoList } from "components/CFB/GameDetails/HighlightVideoList";
import LastPlay from "components/CFB/GameDetails/LastPlay";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { LastFiveGamesSwitcher, LineScore, TeamLocationSection } from "components/GameDetails";
import GameLocation from "components/GameDetails/GameLocation";
import Weather from "components/GameDetails/Weather";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import LastPlayField from "components/NFL/GameDetails/PlayByPlayField";
import TeamDrives from "components/NFL/GameDetails/TeamDrives";
import { getTeamInfo, neutralSiteGames, teams } from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBHighlights } from "hooks/CFBHooks/useCFBHighlights";
import { useCFBLineScore } from "hooks/CFBHooks/useCFBLineScore";
import { useCFBGameOfficialsAndInjuries } from "hooks/CFBHooks/useCFBOfficials";
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
import {
  formatGameDateTime,
  getGameStatus,
  parseGameDate,
} from "utils/CFBUtils/cfbGameUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function CFBGameDetailsScreen() {
  const params = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [parsedGame, setParsedGame] = useState<any>(null);
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

  const { stats } = useFootballTeamStats(parsedGame?.game?.id);

  const { game: gameInfo, teams: teamsData, scores } = parsedGame || {};
  const home = teamsData?.home;
  const away = teamsData?.away;

  const homeIdNum = home?.id ?? 0;
  const awayIdNum = away?.id ?? 0;

  const awayTeam = getTeamInfo(awayIdNum);
  const homeTeam = getTeamInfo(homeIdNum);

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  // --- Team records ---
  const awayEspnId = getTeamById(away?.id)?.espnID;
  const homeEspnId = getTeamById(home?.id)?.espnID;

  const { lineScore, error } = useCFBLineScore(
    homeTeam?.espnID ? Number(homeTeam.espnID) : undefined,
    awayTeam?.espnID ? Number(awayTeam.espnID) : undefined,
    parsedGame?.game?.date
      ? { timestamp: parsedGame.game.date } // ✅ date is third argument
      : undefined
  );

  const { highlights, highlightsLoading, highlightsError } = useCFBHighlights(
    homeTeam?.espnID ? Number(homeTeam.espnID) : undefined,
    awayTeam?.espnID ? Number(awayTeam.espnID) : undefined,
    parsedGame?.game?.date
      ? { timestamp: parsedGame.game.date } // ✅ date is third argument
      : undefined
  );

  const linescore = lineScore ?? { home: [], away: [] };

  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

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
        />
      ),
    });
  }, [homeTeam, awayTeam, navigation]);

  const colors = useMemo(
    () => ({
      background: isDark ? "#1d1d1d" : "#ffffff",
      text: isDark ? "#ffffff" : "#1d1d1d",
      record: isDark ? "#fff" : "#1d1d1d",
      score: isDark ? "#fff" : "#1d1d1d",
      winnerScore: isDark ? "#fff" : "#000",
      border: isDark ? "#333" : "#ccc",
      secondaryText: isDark ? "#ccc" : "#555",
      finalText: isDark ? "#fff" : "#000",
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

  // ✅ safer game date parsing
  const gameDateObj = useMemo(() => {
    const rawDate = parsedGame?.game?.date;
    if (!rawDate) return null;

    // handle multiple formats: timestamp, ISO string, nested object
    if (typeof rawDate === "number") return new Date(rawDate * 1000);
    if (typeof rawDate === "string") return new Date(rawDate);
    if (typeof rawDate === "object" && rawDate.timestamp)
      return new Date(rawDate.timestamp * 1000);

    return null;
  }, [parsedGame?.game?.date]);

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

  // ✅ show chat button within ±1 day of game time
  const shouldShowChatButton = useMemo(() => {
    if (!parsedGame?.game?.id || !gameDateObj) return false;
    if (!homeTeam?.id || !awayTeam?.id) return false;

    const now = new Date();
    const diffHours =
      (now.getTime() - gameDateObj.getTime()) / (1000 * 60 * 60);

    // within 24 hours before or after game
    return diffHours >= -24 && diffHours <= 24;
  }, [parsedGame?.game?.id, gameDateObj, homeTeam?.id, awayTeam?.id]);

  // 🧠 Compute chat button visibility only when necessary
  // 🧠 Show chat button only from 1 day before to 1 day after the game (Eastern Time)

  const homeTeamName = homeTeam?.name ?? "";
  const awayTeamName = awayTeam?.name ?? "";
  const homeTeamIdNum = homeTeam?.id ? Number(homeTeam.id) : 0;
  const awayTeamIdNum = awayTeam?.id ? Number(awayTeam.id) : 0;

  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);

  // Officials & Injuries
  const { officials, injuries, previousDrives, currentDrives } =
    useCFBGameOfficialsAndInjuries(
      homeTeamName,
      awayTeamName,
      gameInfo?.date?.timestamp
        ? new Date(gameInfo.date.timestamp * 1000).toISOString()
        : ""
    );

  // Determine arena info for TeamLocationSection
  const isNeutralSite =
    neutralSiteGames[`${homeTeamName}-${awayTeamName}`] ||
    neutralSiteGames[`${awayTeamName}-${homeTeamName}`];

  const resolvedVenueName = isNeutralSite
    ? isNeutralSite.name
    : homeTeam?.venue ?? "Unknown Stadium";

  const resolvedVenueCity = isNeutralSite
    ? isNeutralSite.city
    : homeTeam?.city ?? "Unknown City";

  const resolvedVenueAddress = isNeutralSite
    ? isNeutralSite.address
    : homeTeam?.address ?? "";

  const resolvedVenueCapacity = isNeutralSite
    ? isNeutralSite.venueCapacity
    : homeTeam?.venueCapacity ?? "";

  const resolvedVenueImage = isNeutralSite
    ? isNeutralSite.venueImage // No image for neutral site
    : homeTeam?.venueImage ?? "";

  const lat = isNeutralSite
    ? neutralSiteGames[`${homeTeamName}-${awayTeamName}`]?.latitude ??
      neutralSiteGames[`${awayTeamName}-${homeTeamName}`]?.latitude ??
      null
    : homeTeam?.latitude ?? null;

  const lon = isNeutralSite
    ? neutralSiteGames[`${homeTeamName}-${awayTeamName}`]?.longitude ??
      neutralSiteGames[`${awayTeamName}-${homeTeamName}`]?.longitude ??
      null
    : homeTeam?.longitude ?? null;

  const { weather } = useWeatherForecast(
    lat,
    lon,
    gameDateStr,
    resolvedVenueCity ?? homeTeam?.city ?? ""
  );

  const displayWeather = weather
    ? { ...weather, cityName: resolvedVenueCity ?? "Unknown" }
    : null;

  const {
    possessionTeamId,
    shortDownDistanceText,
    downDistanceText,
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
            away: { total: score?.away ?? scores.away.total },
            home: { total: score?.home ?? scores.home.total },
          }}
          possessionTeamId={
            possessionTeamId !== undefined
              ? String(possessionTeamId)
              : undefined
          }
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
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
        {showDetails && (
          <View style={{ gap: 20, marginTop: 20 }}>
            <WinPredictionVote
              gameId={gameInfo.id}
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
            {(gameStatus === "In Progress" || gameStatus === "Halftime") && (
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
            {/* {homeTeam?.code && awayTeam?.code && gameDateStr ? (
              <CFBGameOddsSection
                date={gameDateStr}
                gameDate={gameDateStr}
                homeCode={homeTeam.code ?? ""}
                awayCode={awayTeam.code ?? ""}
              />
            ) : null} */}

            <TeamDrives
              previousDrives={previousDrives ?? []}
              currentDrives={currentDrives ?? []}
              awayTeamAbbr={awayTeam?.code}
              homeTeamAbbr={homeTeam?.code}
              league="CFB"
            />

            {homeTeam && awayTeam && gameStatus !== "Scheduled" && (
              <CFBGameLeaders
                gameId={String(gameInfo.id)}
                homeTeamId={String(homeTeam.id)}
                awayTeamId={String(awayTeam.id)}
              />
            )}

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

            {highlights.length > 0 && (
              <HighlightVideoList highlights={highlights} />
            )}

            <TeamLocationSection
                  venueImage={resolvedVenueImage ?? ""}
                  venueName={resolvedVenueName}
                  location={resolvedVenueCity}
                  address={resolvedVenueAddress ?? ""}
                  venueCapacity={resolvedVenueCapacity ?? ""}
                  loading={false} // default value
                  error={null} // default value
                  lighter
                />

            {/* Weather */}
            {displayWeather ? (
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
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    paddingBottom: 12,
    position: "relative",
  },
});
