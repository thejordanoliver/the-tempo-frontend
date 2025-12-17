import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLeaders } from "components/GameDetails";
import BoxScore from "components/GameDetails/BoxScore";
import GameTeamStats from "components/GameDetails/GameTeamStats";
import GameUniforms from "components/GameDetails/GameUniforms";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import LineScore from "components/GameDetails/LineScore";
import Officials from "components/GameDetails/Officials";
import TeamInjuries from "components/GameDetails/TeamInjuries";
import TeamLocationSection from "components/GameDetails/TeamLocationSection";
import Weather from "components/GameDetails/Weather";
import React, { useMemo } from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModal";

export default function GamePreviewContent({
  game,
  home,
  away,
  lineScore,
  homeLastGames,
  awayLastGames,
  gameStats,
  officials,
  injuries,
  boxScore,
  detailsLoading,
  detailsError,
  resolvedVenueImage,
  resolvedVenueName,
  resolvedVenueCity,
  resolvedVenueAddress,
  resolvedVenueCapacity,
  weather,
  weatherLoading,
  weatherError,
  isDark,
  isChampionship = false,
}: any) {
  // Use shared GamePreview styling
  const styles = useMemo(
    () => gamePreviewModalStyle(isChampionship),
    [isChampionship]
  );

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Line Score */}
      {lineScore && (
        <View style={{ marginBottom: 20 }}>
          <LineScore
            linescore={lineScore}
            homeCode={home?.code}
            awayCode={away?.code}
            lighter
          />
        </View>
      )}

      {/* Last Five Games */}
      {(homeLastGames?.games?.length > 0 ||
        awayLastGames?.games?.length > 0) && (
        <View style={{ marginBottom: 20 }}>
          <LastFiveGamesSwitcher
            isDark={isDark}
            lighter
            home={{
              teamCode: home?.code,
              teamLogo: home?.logo,
              teamLogoLight: home?.logoLight,
              games: homeLastGames?.games,
            }}
            away={{
              teamCode: away?.code,
              teamLogo: away?.logo,
              teamLogoLight: away?.logoLight,
              games: awayLastGames?.games,
            }}
            league="NBA"
          />
        </View>
      )}

      {/* Game Stats */}
      {game?.id && gameStats?.length > 0 && (
        <>
          <View style={{ marginBottom: 20 }}>
            <GameLeaders
              gameId={game.id.toString()}
              awayTeamId={away?.id}
              homeTeamId={home?.id}
              lighter
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <BoxScore
              gameId={game.id.toString()}
              awayTeamId={away?.id}
              homeTeamId={home?.id}
              lighter
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <GameTeamStats stats={gameStats} lighter />
          </View>
        </>
      )}

      {/* Injuries */}

      <View style={{ marginBottom: 20 }}>
        <TeamInjuries injuries={injuries} lighter />
      </View>

      {/* Uniforms */}
      {home?.id && away?.id && (
        <View style={{ marginBottom: 20 }}>
          <GameUniforms
            homeTeamId={home.id.toString()}
            awayTeamId={away.id.toString()}
            lighter
          />
        </View>
      )}

      <Officials
        officials={officials ?? []}
        loading={false}
        error={null}
        lighter
      />

      {/* Venue Info */}
      {(resolvedVenueImage || resolvedVenueName) && (
        <View style={{ marginBottom: 20 }}>
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

      {/* Weather */}
      {weather && (
        <View style={{ marginBottom: 20 }}>
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
  );
}
