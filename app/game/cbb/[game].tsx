import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameHeader from "components/Sports/CBB/GameDetails/GameHeader";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/CBB/GameDetails/GameTeamStats";
import LastPlay from "components/Sports/CBB/GameDetails/LastPlay";
import PlayersOnCourt from "components/Sports/CBB/GameDetails/PlayersOnCourt";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import GameSummary from "components/Sports/NBA/GameDetails/GameSummary";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import PlayersInFoulTrouble from "components/Sports/NBA/GameDetails/PlayersInFoulTrouble";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import { getCBBTeamLogo, teams } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect, useMemo } from "react";
import { Animated, ScrollView, useColorScheme, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { CBBGame } from "types/types";
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

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const { opacityAnim, handleScrollStart, handleScrollEnd, showDetails } =
    useScrollFade();

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
      : String((t as any).id) === String(homeTeamId),
  );

  const awayTeamData = teams.find((t) =>
    isWomen
      ? String((t as any).wid) === String(awayTeamId)
      : String((t as any).id) === String(awayTeamId),
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

  const homeLogo = getCBBTeamLogo(homeTeamId, isDark, isWomen);
  const awayLogo = getCBBTeamLogo(awayTeamId, isDark, isWomen);
  const homeHeaderLogo = getCBBTeamLogo(homeTeamId, true, isWomen);
  const awayHeaderLogo = getCBBTeamLogo(awayTeamId, true, isWomen);

  const homeEspnId = homeTeamData.espnID ?? 0;
  const awayEspnId = awayTeamData.espnID ?? 0;

  const homePlayers = usePlayersByTeam(String(homeEspnId), isWomen);
  const awayPlayers = usePlayersByTeam(String(awayEspnId), isWomen);

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
  const detailsLeague = isWomen ? "wcbb" : "cbb";

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
  const neutralSite = details?.neutralSite;
  const leaders = liveScore?.leaders ?? [];
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const lastPlay = liveScore?.lastPlay ?? "";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;

  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  const homeFoulPlayers =
    liveScore?.foulTrouble
      ?.find((t) => String(t.team?.id) === String(homeEspnId))
      ?.players?.map((p) => ({
        id: p.id,
        teamId: String(homeEspnId),
        name: p.shortName,
        jersey: p.jersey,
        fouls: p.fouls,
        avatarUrl: p.avatar ?? "",
      })) ?? [];

  const awayFoulPlayers =
    liveScore?.foulTrouble
      ?.find((t) => String(t.team?.id) === String(awayEspnId))
      ?.players?.map((p) => ({
        id: p.id,
        teamId: String(awayEspnId),
        name: p.shortName,
        jersey: p.jersey,
        fouls: p.fouls,
        avatarUrl: p.avatar ?? "",
      })) ?? [];
  /* ---------------- Hooks ---------------- */

  // Pass `isWomen` flag to useLastFiveGames
  const homeLastGames = useLastFiveGames(homeTeamId, isWomen);
  const awayLastGames = useLastFiveGames(awayTeamId, isWomen);

  /* ---------------- Neutral site / venue ---------------- */

  const resolvedVenue = useMemo(
    () =>
      resolveVenue({
        espnVenue: details?.venue,
        homeTeam: homeTeamData,
        isNeutralSite: neutralSite,
      }),
    [details?.venue, homeTeamData, neutralSite],
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
          homeLogo={homeHeaderLogo}
          awayLogo={awayHeaderLogo}
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
        contentContainerStyle={styles.container}
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
          <View style={styles.innerContainer}>
            {!isFinal && !isScheduled && (
              <LastPlay
                lastPlay={lastPlay}
                homeTeamId={homeEspnId}
                awayTeamId={awayEspnId}
              />
            )}

            {!isScheduled && (
              <LineScore
                linescore={lineScore}
                awayCode={awayTeamData.code ?? ""}
                homeCode={homeTeamData.code ?? ""}
                league={isWomen ? "WCBB" : "CBB"} // ✅ FIX
              />
            )}

            {!isFinal && (
              <FanPredictionVote
                gameId={`${homeTeamId}-${awayTeamId}`}
                awayTeam={voteAwayTeam as any}
                homeTeam={voteHomeTeam as any}
              />
            )}

            {isScheduled && (
              <MatchupPredictor
                away={{
                  name: awayTeamData.code ?? "UNK",
                  logo: awayLogo,
                  color: isDark
                    ? awayTeamData.secondaryColor
                    : awayTeamData.color,
                  chance: awayChance,
                }}
                home={{
                  name: homeTeamData.code ?? "UNK",
                  logo: homeLogo,
                  color: isDark
                    ? homeTeamData.secondaryColor
                    : homeTeamData.color,
                  chance: homeChance,
                }}
                size={180}
              />
            )}

            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(awayEspnId)}
              homeTeamId={Number(homeEspnId)}
              league={detailsLeague}
              gameStatusDescription={gameStatusDescription}
            />

            {isHalftime && inProgress && (
              <PlayersInFoulTrouble
                homeId={String(homeEspnId)}
                homeCode={homeTeamData.code ?? ""}
                homeLogo={homeLogo}
                awayId={String(awayEspnId)}
                awayCode={awayTeamData.code ?? ""}
                awayLogo={awayLogo}
                homePlayers={homeFoulPlayers}
                awayPlayers={awayFoulPlayers}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            {(isHalftime || inProgress || isFinal) && (
              <ShotChart
                plays={plays}
                homeTeamId={String(homeEspnId)}
                awayTeamId={String(awayEspnId)}
                neutralSite={neutralSite}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            {(isHalftime || inProgress || isFinal) && (
              <GameSummary
                plays={plays ?? []}
                awayTeamId={String(awayEspnId)}
                homeTeamId={String(homeEspnId)}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            <GameTeamStats
              stats={teamStats}
              gameStatusDescription={gameStatusDescription}
            />

            {(isHalftime || inProgress || isFinal) && (
              <BoxScore
                playerStats={playerStats}
                awayTeamId={Number(awayEspnId)}
                homeTeamId={Number(homeEspnId)}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            {(isHalftime || inProgress) && (
              <PlayersOnCourt
                playerStats={playerStats}
                awayTeamId={Number(awayEspnId)}
                homeTeamId={Number(homeEspnId)}
                league={isWomen ? "WCBB" : "CBB"}
              />
            )}

            <LastFiveGames
              isDark={isDark}
              away={{
                teamId: awayTeamData.id ?? "",
                teamCode: awayTeamData.code ?? "",
                games: (awayLastGames as any)?.games ?? [],
              }}
              home={{
                teamId: homeTeamData.id ?? "",
                teamCode: homeTeamData.code ?? "",
                games: (homeLastGames as any)?.games ?? [],
              }}
              league={isWomen ? "WCBB" : "CBB"}
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
              venueImage={details.venue.images?.[0]?.href}
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

      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={String(gameObj.id)} />
      </Animated.View>
    </>
  );
}
