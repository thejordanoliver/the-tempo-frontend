import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import GameTeamStats from "components/GameDetails/GameTeamStats";
import TeamInjuriesTab from "components/GameDetails/TeamInjuries";
import { neutralVenues, teams, venueImages } from "constants/teams";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameDetails } from "hooks/useGameDetails";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useLastFiveGames } from "hooks/useLastFiveGames";
import { useFetchPlayoffGames } from "hooks/usePlayoffSeries";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { Dimensions, StyleSheet, View, useColorScheme } from "react-native";
import { Game } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { GameLeaders } from "../GameDetails";
import BoxScore from "../GameDetails/BoxScore";
import GameOfficials from "../GameDetails/GameOfficials";
import GameUniforms from "../GameDetails/GameUniforms";
import LastFiveGamesSwitcher from "../GameDetails/LastFiveGames";
import LineScore from "../GameDetails/LineScore";
import TeamLocationSection from "../GameDetails/TeamLocationSection";
import Weather from "../GameDetails/Weather";
import CenterInfo from "./CenterInfo";
import TeamInfo from "./TeamInfo";

type Props = {
  visible: boolean;
  game: Game;
  onClose: () => void;
};

const windowHeight = Dimensions.get("window").height;

export default function GamePreviewModal({ visible, game, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  // ✅ Simplified: use internal team IDs only
  const getTeamById = (id?: string | number) =>
    teams.find((t) => String(t.id) === String(id));

  const home = getTeamById(game?.home?.id);
  const away = getTeamById(game?.away?.id);

  const homeId = Number(home?.id) || 0;
  const awayId = Number(away?.id) || 0;

  const { games: playoffGames } = useFetchPlayoffGames(homeId, awayId, 2025);

  const currentPlayoffGame = useMemo(() => {
    if (!playoffGames || !game) return undefined;
    return playoffGames.find((g) => g.id === game.id);
  }, [playoffGames, game]);

  const seriesSummary = currentPlayoffGame?.seriesSummary;
  const gameNumberLabel = currentPlayoffGame?.gameNumber
    ? `Game ${currentPlayoffGame.gameNumber}`
    : undefined;

  const { data: gameStats, loading: statsLoading } = useGameStatistics(
    game?.id ?? 0
  );

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  // 🏟 Venue resolution logic
  const venueNameFromGame = game?.venue?.name ?? "";
  const venueCityFromGame = game?.venue?.city ?? "";
  const neutralVenueData = neutralVenues[venueNameFromGame];

  const cleanedVenueName = venueNameFromGame.replace(/\s*\(.*?\)/, "").trim();
  const resolvedVenueName = cleanedVenueName || home?.venueName || "";
  const resolvedVenueCity = venueCityFromGame || home?.location || "";
  const resolvedVenueAddress = neutralVenueData?.address || home?.address || "";
  const resolvedVenueCapacity =
    neutralVenueData?.venueCapacity || home?.venueCapacity || "";
  const resolvedVenueImage =
    neutralVenueData?.venueImage ||
    venueImages[venueNameFromGame] ||
    venueImages[venueCityFromGame] ||
    venueImages[home?.code ?? ""] ||
    home?.venueImage;

  const lat = neutralVenueData?.latitude ?? home?.latitude ?? null;
  const lon = neutralVenueData?.longitude ?? home?.longitude ?? null;

  const homeRecord = game.home.record ?? "";
  const awayRecord = game.away.record ?? "";

  const getTeamColor = (team?: (typeof teams)[number]) => {
    if (!team) return "#444";
    const { code, color, secondaryColor } = team;
    if (code === "SAS") return secondaryColor || "#fff";
    return color || "#444";
  };

  const homeColor = getTeamColor(home);
  const awayColor = getTeamColor(away);

  const homeLastGames = useLastFiveGames(homeId);
  const awayLastGames = useLastFiveGames(awayId);

  const isCanceled = game.status === "Canceled";
  const isFinal = game.status === "Final";
  const homeWins = isFinal && (game.homeScore ?? 0) > (game.awayScore ?? 0);
  const awayWins = isFinal && (game.awayScore ?? 0) > (game.homeScore ?? 0);
  const isPlayoffs = game.stage === 4 || !!seriesSummary;

  const dateObj = new Date(game.date);
  const gameDate = useMemo(
    () => new Date(game.date).toISOString().split("T")[0],
    [game.date]
  );

  const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
  const isNBAFinals =
    dateObj.getMonth() === 5 &&
    dateObj.getDate() >= 5 &&
    dateObj.getDate() <= 22;

  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    dateObj.toISOString()
  );

  const { broadcasts } = useGameBroadcasts(
    home?.name ?? "",
    away?.name ?? "",
    dateObj.toISOString()
  );

  const broadcastText = getBroadcastDisplay(broadcasts);
  const showLiveInfo = game.status !== "Scheduled" && game.status !== "Final";
  const snapPoints = useMemo(() => ["40%", "60%", "80%", "88%", "94%"], []);

  const homeCode = home?.code ?? "";
  const awayCode = away?.code ?? "";
  const maxHeight = windowHeight * 0.9;
  const currentPeriodRaw = Number(game.periods?.current ?? game.period);
  const totalPeriodsPlayed =
    game.linescore?.home?.length ??
    game.linescore?.away?.length ??
    currentPeriodRaw;

  const { data, detailsLoading, detailsError } = useGameDetails(
    gameDate,
    home?.name ?? "",
    away?.name ?? ""
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableContentPanningGesture
      enableHandlePanningGesture
      enableDynamicSizing={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      handleStyle={{
        backgroundColor: "transparent",
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        left: 8,
        right: 8,
        top: 0,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#888",
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <LinearGradient
          colors={
            isNBAFinals
              ? ["#DFBD69", "#CDA765"]
              : [awayColor, awayColor, homeColor, homeColor]
          }
          locations={isNBAFinals ? undefined : [0, 0.4, 0.6, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={
            isDark
              ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]
              : ["rgba(0,0,0,0.4)", "rgba(0,0,0,0.1)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <BlurView
          intensity={100}
          tint={"systemUltraThinMaterialDark"}
          style={{
            flex: 1,
            paddingHorizontal: 12,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 40,
          }}
        >
          {/* --- Header: Team vs Team --- */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <TeamInfo
              team={away}
              teamName={away?.name ?? ""}
              scoreOrRecord={
                game.status === "Scheduled" ? awayRecord : game.awayScore ?? "-"
              }
              isWinner={awayWins}
              record={awayRecord}
              isDark={isDark}
              isGameOver
              isScheduled
            />

            <CenterInfo
              isNBAFinals={isNBAFinals}
              isFinal={isFinal}
              isCanceled={isCanceled}
              isHalftime={game.isHalftime ?? false}
              broadcastNetworks={broadcastText}
              showLiveInfo={showLiveInfo}
              period={game.periods?.current ?? 0}
              endOfPeriod={game.periods?.endOfPeriod ?? false}
              totalPeriodsPlayed={totalPeriodsPlayed}
              time={game.time}
              clock={game.clock}
              formattedDate={formattedDate}
              isDark={isDark}
              gameNumberLabel={gameNumberLabel}
              seriesSummary={seriesSummary}
              isPlayoffs={isPlayoffs}
            />

            <TeamInfo
              team={home}
              teamName={home?.name ?? ""}
              scoreOrRecord={
                game.status === "Scheduled" ? homeRecord : game.homeScore ?? "-"
              }
              isWinner={homeWins}
              record={homeRecord}
              isDark={isDark}
              isGameOver
              isScheduled
            />
          </View>

          {/* --- Scrollable Content --- */}
          <View style={{ flex: 1, minHeight: 0 }}>
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100, minHeight: 0 }}
            >
              {game.linescore && (
                <View style={{ marginBottom: 24 }}>
                  <LineScore
                    linescore={game.linescore}
                    homeCode={homeCode}
                    awayCode={awayCode}
                    lighter
                  />
                </View>
              )}

              {game.id && gameStats && gameStats.length > 0 && (
                <>
                  <View style={{ marginBottom: 24 }}>
                    <GameLeaders
                      gameId={game.id.toString()}
                      awayTeamId={awayId}
                      homeTeamId={homeId}
                    />
                  </View>

                  <View style={{ marginBottom: 24 }}>
                    <BoxScore
                      gameId={game.id.toString()}
                      homeTeamId={homeId}
                      awayTeamId={awayId}
                    />
                  </View>

                  <View style={{ marginBottom: 24 }}>
                    <GameTeamStats stats={gameStats ?? []} />
                  </View>
                </>
              )}

              {data?.officials && data.officials.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <GameOfficials officials={data.officials} lighter />
                </View>
              )}

              {data?.injuries && data.injuries.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <TeamInjuriesTab injuries={data.injuries} lighter />
                </View>
              )}

              {(homeLastGames.games.length > 0 ||
                awayLastGames.games.length > 0) && (
                <View style={{ marginBottom: 24 }}>
                  <LastFiveGamesSwitcher
                    isDark={isDark}
                    lighter
                    home={{
                      teamCode: homeCode,
                      teamLogo: home?.logo,
                      teamLogoLight: home?.logoLight,
                      games: homeLastGames.games,
                    }}
                    away={{
                      teamCode: awayCode,
                      teamLogo: away?.logo,
                      teamLogoLight: away?.logoLight,
                      games: awayLastGames.games,
                    }}
                  />
                </View>
              )}

              {homeId && awayId && (
                <View style={{ marginBottom: 24 }}>
                  <GameUniforms
                    homeTeamId={homeId.toString()}
                    awayTeamId={awayId.toString()}
                    lighter
                  />
                </View>
              )}

              {(resolvedVenueImage || resolvedVenueName) && (
                <View style={{ marginBottom: 24 }}>
                  <TeamLocationSection
                    venueImage={resolvedVenueImage}
                    venueName={resolvedVenueName}
                    location={resolvedVenueCity}
                    address={resolvedVenueAddress}
                    venueCapacity={resolvedVenueCapacity}
                    lighter
                    loading={detailsLoading}
                    error={detailsError ?? null}
                  />
                </View>
              )}

              {weather && (
                <View style={{ marginBottom: 24 }}>
                  <Weather
                    address={resolvedVenueAddress}
                    weather={weather}
                    lighter
                    loading={weatherLoading}
                    error={weatherError ?? null}
                  />
                </View>
              )}
            </BottomSheetScrollView>
          </View>
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
