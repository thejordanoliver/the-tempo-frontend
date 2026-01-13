import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLeaders, GameLocation } from "components/GameDetails";
import BoxScore from "components/GameDetails/BoxScore";
import GameTeamStats from "components/GameDetails/GameTeamStats";
import GameUniforms from "components/GameDetails/GameUniforms";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import LineScore from "components/GameDetails/LineScore";
import Officials from "components/GameDetails/Officials";
import TeamInjuries from "components/GameDetails/TeamInjuries";
import React, { useMemo } from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModalStyles";

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
            {gameStats.length > 0 && (
              <GameTeamStats stats={gameStats} lighter />
            )}
          </View>
        </>
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

      {/* Injuries */}

      <View style={{ marginBottom: 20 }}>
        <TeamInjuries injuries={injuries} lighter />
      </View>

      {/* Uniforms */}
      {home?.id && away?.id && (
        <View style={{ marginBottom: 20 }}>
          <GameUniforms homeTeamId={home.id} awayTeamId={away.id} lighter />
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        <Officials
          officials={officials ?? []}
          loading={false}
          error={null}
          lighter
        />
      </View>

      {/* Venue Info */}
      {(resolvedVenueImage || resolvedVenueName) && (
        <View style={{ marginBottom: 20 }}>
          <GameLocation
            venueImage={resolvedVenueImage}
            venueName={resolvedVenueName}
            location={resolvedVenueCity}
            address={resolvedVenueAddress}
            venueCapacity={resolvedVenueCapacity}
            weather={weather}
            lighter
            loading={detailsLoading}
            error={detailsError ?? null}
          />
        </View>
      )}
    </BottomSheetScrollView>
  );
}
