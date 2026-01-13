/* ================================================== */
/* Imports                                            */
/* ================================================== */

/* --- Navigation & Routing --- */
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";

/* --- React & React Native --- */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

/* --- UI Components --- */
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";

/* --- Game Detail Components --- */
import { GameLocation, LineScore } from "components/GameDetails";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import Officials from "components/GameDetails/Officials";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";

/* --- NFL Components --- */
import GameLeaders from "components/NFL/GameDetails/GameLeaders";
import NFLGameHeader from "components/NFL/GameDetails/NFLGameHeader";
import NFLGameOddsSection from "components/NFL/GameDetails/NFLGameOddsSection";
import NFLGameTeamStats from "components/NFL/GameDetails/NFLGameTeamStats";
import NFLInjuries from "components/NFL/GameDetails/NFLInjuries";
import NFLSeriesHistory from "components/NFL/GameDetails/NFLSeriesHistory";
import LastPlayField from "components/NFL/GameDetails/PlayByPlayField";
import TeamDrives from "components/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/NFL/GameDetails/TeamScoringSummary";

/* --- Hooks --- */
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { useLastFiveGames } from "hooks/NFLHooks/useLastFiveGames";
import { useNFLMatchup } from "hooks/NFLHooks/useNFLMatchup";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { useNFLTeamStats } from "hooks/NFLHooks/useNFLTeamStats";
import { useWeatherForecast } from "hooks/useWeather";

/* --- Constants & Types --- */
import { getTeamInfo, neutralStadiums } from "constants/teamsNFL";
import { emptyNFLAwayTeam, emptyNFLHomeTeam, NFLGame } from "types/nfl";

/* --- Utils & Stores --- */
import { useChatStore } from "store/chatStore";
import { transformNFLSeriesGames } from "utils/NFLUtils/transformSeriesGame";
import { getHolidayLabel } from "utils/dateUtils";

export default function NFLGameDetailsScreen() {
  /* -------------------------------------------------- */
  /* Basic Setup                                       */
  /* -------------------------------------------------- */

  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  /* -------------------------------------------------- */
  /* UI State & Animation                              */
  /* -------------------------------------------------- */

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  /* -------------------------------------------------- */
  /* Parsed Game Data                                  */
  /* -------------------------------------------------- */

  const [parsedGame, setParsedGame] = useState<NFLGame | null>(null);

  /* -------------------------------------------------- */
  /* Chat State                                        */
  /* -------------------------------------------------- */

  const { isOpen: isChatOpen } = useChatStore();

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

  const { stats } = useNFLTeamStats(parsedGame?.game.id ?? "");

  const { game: gameInfo, teams, scores } = parsedGame || {};
  const home = teams?.home;
  const away = teams?.away;
  const awayId = away?.id ? String(away.id) : "";
  const homeId = home?.id ? String(home.id) : "";

  const homeTeam = getTeamInfo(String(home?.id ?? "")) ?? emptyNFLHomeTeam;
  const awayTeam = getTeamInfo(String(away?.id ?? "")) ?? emptyNFLAwayTeam;

  const homeCode = homeTeam.code;
  const awayCode = awayTeam.code;

  const homeEspnId = homeTeam.espnID;
  const awayEspnId = awayTeam.espnID;

  /* -------------------------------------------------- */
  /* Date Handling                                     */
  /* -------------------------------------------------- */

  const gameDateObj = useMemo(() => {
    if (!gameInfo?.date) return null;

    const raw =
      typeof gameInfo.date === "object"
        ? gameInfo.date.timestamp * 1000
        : gameInfo.date;

    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [gameInfo?.date]);

  const gameDateStr = gameDateObj?.toISOString() ?? "";

  /* -------------------------------------------------- */
  /* Data Fetching                                     */
  /* -------------------------------------------------- */

  const { data: details, loading: gameDetailsLoading } = useFootballGameDetails(
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
    "nfl"
  );

  const {
    possessionTeamId,
    gameStatusDescription,
    gameStatusShortDetail,
    downDistanceText,
    redzone,
    lineScore,
    lastPlay,
    displayClock,
    period,
    homeTimeouts,
    awayTimeouts,
    score,
    loading: possessionLoading,
  } = useFootballGamePossession(homeEspnId, awayEspnId, gameDateStr, "nfl");

  const gameStatus = parsedGame?.game.status.long;
  const timestamp = parsedGame?.game.date?.timestamp;

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

  const isGameLoading = gameDetailsLoading || possessionLoading;
  const headlineText = details?.headline;
  const broadcast = details?.broadcast ?? "";
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const currentDrives = details?.currentDrives;
  const previousDrives = details?.previousDrives;
  const scoringPlays = details?.scoringPlays;
  const venue = details?.venue;
  const neutralSite = details?.neutralSite;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";

  
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
          league="NFL"
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
  let resolvedVenueName = venue?.name ?? homeTeam?.venue ?? "Unknown Stadium";
  let resolvedVenueCity = homeTeam?.city ?? "Unknown City";
  let resolvedVenueAddress = homeTeam?.address ?? "";
  let resolvedVenueCapacity = homeTeam?.venueCapacity?.toString() ?? "";
  let resolvedVenueImage = isNeutralStadiumMatch
    ? neutralStadiumData?.venueImage
    : homeTeam.venueImage ?? venue?.image;
  let lat = homeTeam?.latitude ?? null;
  let lon = homeTeam?.longitude ?? null;

  if (details?.neutralSite && neutralStadiumData) {
    resolvedVenueName = neutralStadiumName ?? resolvedVenueName;
    resolvedVenueCity = neutralStadiumData.city ?? resolvedVenueCity;
    resolvedVenueAddress = neutralStadiumData.address ?? resolvedVenueAddress;
    resolvedVenueCapacity =
      neutralStadiumData.venueCapacity?.toString() ?? resolvedVenueCapacity;
    resolvedVenueImage = neutralStadiumData.venueImage ?? resolvedVenueImage;
    lat = neutralStadiumData.latitude ?? lat;
    lon = neutralStadiumData.longitude ?? lon;
  }

  const formatPeriod = (raw: string | number | undefined | null) => {
    if (!raw) return "";

    // 🔥 FIX: if raw is "5" or "6", convert to number
    if (typeof raw === "string" && /^\d+$/.test(raw)) {
      raw = Number(raw);
    }

    // ----- STRING CASES -----
    if (typeof raw === "string") {
      const upper = raw.toUpperCase();

      if (upper === "OT" || upper === "OVERTIME") return "OT";
      if (upper === "HT") return "Halftime";
      if (upper === "FT") return "Final";

      if (upper.includes("END")) {
        const quarterNum = upper.match(/(\d)/)?.[1];
        if (quarterNum) {
          return `End ${
            quarterNum === "1"
              ? "1st"
              : quarterNum === "2"
              ? "2nd"
              : quarterNum === "3"
              ? "3rd"
              : "4th"
          }`;
        }
        return "End";
      }

      if (upper.startsWith("Q")) {
        const num = parseInt(upper.replace("Q", ""));
        return num === 1
          ? "1st"
          : num === 2
          ? "2nd"
          : num === 3
          ? "3rd"
          : num === 4
          ? "4th"
          : `${num}OT`;
      }

      return raw;
    }

    // ----- NUMBER CASES -----
    if (typeof raw === "number") {
      if (raw >= 1 && raw <= 4) {
        return raw === 1
          ? "1st"
          : raw === 2
          ? "2nd"
          : raw === 3
          ? "3rd"
          : "4th";
      }

      const ot = raw - 4;
      return ot === 1 ? "OT" : `${ot}OT`;
    }

    return String(raw);
  };

  const awayRecord = useNFLTeamRecord(awayId).record.overall ?? "0-0";
  const homeRecord = useNFLTeamRecord(homeId).record.overall ?? "0-0";

  const stadiumData = neutralSite
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

  const homeTeamIdNum = Number(homeTeam.id);
  const awayTeamIdNum = Number(awayTeam.id);
  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);

  const linescore = lineScore ?? { home: [], away: [] };
  const homeScore = score?.home;
  const awayScore = score?.away;

  // --- Matchup Route (Series History) ---
  const { data: matchup } = useNFLMatchup(homeCode, awayCode);

  const seriesGames = useMemo(() => {
    if (!matchup || !matchup.games) return [];
    return transformNFLSeriesGames(matchup.games);
  }, [matchup]);

  if (!parsedGame || !homeTeam || !awayTeam) return <View />;

  if (isGameLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
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
        {/* Teams & Score Section */}
        <NFLGameHeader
          headlineText={headline}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
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
          period={formatPeriod(period)}
          displayClock={displayClock}
          possessionText={downDistanceText}
          isDark={isDark}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          broadcast={broadcast}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          gameStatusShortDetail={gameStatusShortDetail}
          gameStatusDescription={gameStatusDescription ?? gameStatus}
          redzone={redzone ?? false}
        />

        {showDetails && (
          <View style={{ gap: 20, marginTop: 20 }}>
            {gameStatusDescription !== "Final" &&
              homeTeam !== emptyNFLHomeTeam &&
              awayTeam !== emptyNFLAwayTeam && (
                <WinPredictionVote
                  gameId={gameInfo?.id ?? ""}
                  awayTeam={{
                    id: awayTeam.id,
                    name: awayTeam.name || awayTeam.code,
                    code: awayCode,
                    logo: awayTeam.logo,
                    logoLight: awayTeam.logoLight,
                    color: awayTeam.color,
                    secondaryColor: awayTeam.secondaryColor,
                  }}
                  homeTeam={{
                    id: homeTeam.id,
                    name: homeTeam.name || homeTeam.code,
                    code: homeCode,
                    logo: homeTeam.logo,
                    logoLight: homeTeam.logoLight,
                    color: homeTeam.color,
                    secondaryColor: homeTeam.secondaryColor,
                  }}
                />
              )}

            {homeTeam?.code && awayTeam?.code && gameDateStr ? (
              <NFLGameOddsSection
                date={gameDateStr}
                gameDate={gameDateStr}
                homeId={homeTeam.id}
                awayId={awayTeam.id}
                homeCode={homeCode}
                awayCode={awayCode}
                neutralSite={neutralSite}
              />
            ) : null}

            {(gameStatusDescription === "In Progress" ||
              gameStatusDescription === "Halftime" ||
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

            {/* Last Play Field - only show when game is live */}
            {(gameStatusDescription === "In Progress" ||
              gameStatusDescription === "Halftime") && (
              <LastPlayField
                lastPlay={lastPlay}
                possessionTeamId={possessionTeamId}
                homeTeamId={Number(homeTeam.id)} // ensure number
                awayTeamId={Number(awayTeam.id)} // ensure number
              />
            )}

            {/* Game Leaders - only when game is live */}
            {(gameStatusDescription === "In Progress" ||
              gameStatusDescription === "Halftime" ||
              gameStatusDescription === "Final") && (
              <>
                <GameLeaders
                  gameId={String(parsedGame.game.id)}
                  homeTeamId={String(homeTeam.id)}
                  awayTeamId={String(awayTeam.id)}
                  league="NFL"
                />

                <TeamDrives
                  previousDrives={previousDrives ?? []}
                  currentDrives={currentDrives ?? []}
                  homeTeamId={Number(homeTeam?.espnID)}
                  awayTeamId={Number(awayTeam?.espnID)}
                />
              </>
            )}
            <TeamScoringSummary
              scoringPlays={scoringPlays ?? []}
              awayTeamAbbr={awayCode}
              homeTeamAbbr={homeCode}
              league="NFL"
            />

            {stats && <NFLGameTeamStats stats={stats} />}

            {homeTeam !== emptyNFLHomeTeam && awayTeam !== emptyNFLAwayTeam && (
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
            )}
            {homeTeam !== emptyNFLHomeTeam && awayTeam !== emptyNFLAwayTeam && (
              <NFLSeriesHistory
                team1Code={getTeamInfo(matchup?.teams.team1.id)?.code ?? "UNK"}
                team2Code={getTeamInfo(matchup?.teams.team2.id)?.code ?? "UNK"}
                team1Full={matchup?.teams.team1.fullName ?? ""}
                team2Full={matchup?.teams.team2.fullName ?? ""}
                team1Wins={matchup?.series.winsA ?? 0}
                team2Wins={matchup?.series.winsB ?? 0}
                ties={matchup?.series.ties ?? 0}
                games={seriesGames ?? []}
                team1Logo={getTeamInfo(matchup?.teams.team1.id)?.logo}
                team2Logo={getTeamInfo(matchup?.teams.team2.id)?.logo}
                team1LogoLight={getTeamInfo(matchup?.teams.team1.id)?.logoLight}
                team2LogoLight={getTeamInfo(matchup?.teams.team2.id)?.logoLight}
              />
            )}

            {Array.isArray(highlights) && highlights.length > 0 && (
              <HighlightVideoList highlights={highlights} />
            )}

            {gameStatusDescription !== "Final" && (
              <NFLInjuries
                injuries={details?.injuries}
                loading={false}
                error={null}
                awayTeamId={awayTeam.espnID}
                homeTeamId={homeTeam.espnID}
                awayTeamAbbr={awayTeam.code}
                homeTeamAbbr={homeTeam.code}
              />
            )}

            {gameStatusDescription !== "Final" && (
              <Officials officials={officials} loading={false} error={null} />
            )}
            {/* Venue Section */}
            <GameLocation
              venueImage={resolvedVenueImage}
              venueName={resolvedVenueName}
              location={resolvedVenueCity}
              address={resolvedVenueAddress}
              venueCapacity={resolvedVenueCapacity}
              venueAttendance={
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
              weather={displayWeather}
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
