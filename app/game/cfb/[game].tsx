import { useNavigation } from "@react-navigation/native";
import CFBGameLeaders from "components/CFB/GameDetails/CFBGameLeaders";
import CFBGameOddsSection from "components/CFB/GameDetails/CFBGameOddsSection";
import CFBGameHeader from "components/CFB/GameDetails/CFBGameTeamsHeader";
import CFBGameTeamStats from "components/CFB/GameDetails/FootballGameTeamStats";
import LastFiveGamesSwitcher from "components/CFB/GameDetails/LastFiveGames";
import LastPlay from "components/CFB/GameDetails/LastPlay";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FloatingChatButton from "components/FloatingButton";
import { LineScore, TeamLocationSection } from "components/GameDetails";
import Weather from "components/GameDetails/Weather";
import { getTeamInfo, neutralSiteGames, teams } from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useFootballTeamStats } from "hooks/CFBHooks/useFootballTeamStats";
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
import {
  buildLineScore,
  formatGameDateTime,
  getGameStatus,
  parseGameDate,
} from "utils/CFBUtils/cfbGameUtils";

import { useChatStore } from "store/chatStore";
export default function CFBGameDetailsScreen() {
  const params = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [parsedGame, setParsedGame] = useState<any>(null);
  const { openChat, isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const { stats } = useFootballTeamStats(parsedGame?.game?.id);

  const { game: gameInfo, teams: teamsData, scores } = parsedGame || {};
  const home = teamsData?.home;
  const away = teamsData?.away;

  const homeIdNum = home?.id ?? 0;
  const awayIdNum = away?.id ?? 0;

  const homeTeam = getTeamInfo(homeIdNum);
  const awayTeam = getTeamInfo(awayIdNum);

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  // --- Team records ---
  const awayEspnId = getTeamById(away?.id)?.espnID;
  const homeEspnId = getTeamById(home?.id)?.espnID;

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
  const {
    formattedDate,
    formattedTime,
    iso: gameDateStr,
  } = formatGameDateTime(gameDate);
  const gameStatus = getGameStatus(
    gameInfo?.status?.short ?? gameInfo?.status?.long
  );
  const linescore = useMemo(() => buildLineScore(scores), [scores]);

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

  const homeTeamName = homeTeam?.name ?? "";
  const awayTeamName = awayTeam?.name ?? "";
  const homeTeamIdNum = homeTeam?.id ? Number(homeTeam.id) : 0;
  const awayTeamIdNum = awayTeam?.id ? Number(awayTeam.id) : 0;

  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);

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
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          // ✅ Use live score if available, fallback to parsed score
          scores={{
            home: { total: score?.home ?? scores.home.total },
            away: { total: score?.away ?? scores.away.total },
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
          displayClock={displayClock ?? gameInfo?.status?.timer ?? ""}
          downAndDistance={shortDownDistanceText}
          isDark={isDark}
          homeRecord={homeRecord?.overall ?? undefined}
          awayRecord={awayRecord?.overall ?? undefined}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
        />

        {/* Lazy-loaded Section */}
        {showDetails && (
          <View style={{ gap: 20, marginTop: 20 }}>
            {/* Last Play Section */}
            <LastPlay lastPlay={lastPlay} isDark={isDark} />

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

            {/* Odds */}
            {homeTeam?.code && awayTeam?.code && gameDateStr ? (
              <CFBGameOddsSection
                date={gameDateStr}
                gameDate={gameDateStr}
                homeCode={homeTeam.code ?? ""}
                awayCode={awayTeam.code ?? ""}
              />
            ) : null}

            {homeTeam && awayTeam && gameStatus !== "Scheduled" && (
              <CFBGameLeaders
                gameId={String(gameInfo.id)}
                homeTeamId={String(homeTeam.id)}
                awayTeamId={String(awayTeam.id)}
                lighter
              />
            )}

            {stats && <CFBGameTeamStats stats={stats} />}

            <LastFiveGamesSwitcher
              isDark={isDark}
              home={{
                teamCode: homeTeam?.code ?? "",
                games: homeLastGames?.games ?? [],
              }}
              away={{
                teamCode: awayTeam?.code ?? "",
                games: awayLastGames?.games ?? [],
              }}
            />

            <TeamLocationSection
              venueImage={resolvedVenueImage}
              venueName={resolvedVenueName}
              location={resolvedVenueCity}
              address={resolvedVenueAddress ?? ""}
              venueCapacity={resolvedVenueCapacity ?? ""}
              loading={false} // default value
              error={null} // default value
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
        {(() => {
          if (!parsedGame?.game?.id || !gameDateObj) return null;

          const now = new Date();
          const oneDay = 24 * 60 * 60 * 1000;

          // Calculate difference in days (absolute value)
          const diffDays = (now.getTime() - gameDateObj.getTime()) / oneDay;

          // Show button if within -1 day to +1 day (i.e. day before, day of, or day after)
          const isVisible = diffDays >= -1 && diffDays <= 1;

          if (
            isVisible &&
            homeTeam?.id &&
            homeTeam?.id !== 0 &&
            awayTeam?.id &&
            awayTeam?.id !== 0
          ) {
            return (
              <FloatingChatButton
                gameId={parsedGame.game.id}
                openChat={openChat}
              />
            );
          }

          return null;
        })()}
      </Animated.View>
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
