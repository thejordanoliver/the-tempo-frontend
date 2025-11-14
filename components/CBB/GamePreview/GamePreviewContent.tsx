import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLeaders } from "components/GameDetails";
import BoxScore from "components/GameDetails/BoxScore";
import GameOfficials from "components/GameDetails/GameOfficials";
import GameTeamStats from "components/GameDetails/GameTeamStats";
import GameUniforms from "components/GameDetails/GameUniforms";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import TeamInjuriesTab from "components/GameDetails/TeamInjuries";
import Weather from "components/GameDetails/Weather";
import React from "react";
import { View } from "react-native";
import LineScore from "../GameDetails/LineScore";
export default function GamePreviewContent({
  game,
  home,
  away,
  lineScore,
  homeLastGames,
  awayLastGames,
  gameStats,
  data,
  resolvedVenueAddress,
  weather,
  weatherLoading,
  weatherError,
  isDark,
}: any) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Line Score */}
      {lineScore && (
        <View style={{ marginBottom: 24 }}>
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
        <View style={{ marginBottom: 24 }}>
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
            league="CBB"
          />
        </View>
      )}

      {/* Game Stats */}
      {game?.id && gameStats?.length > 0 && (
        <>
          <View style={{ marginBottom: 24 }}>
            <GameLeaders
              gameId={game.id.toString()}
              awayTeamId={away?.id}
              homeTeamId={home?.id}
              lighter
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <BoxScore
              gameId={game.id.toString()}
              homeTeamId={home?.id}
              awayTeamId={away?.id}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <GameTeamStats stats={gameStats} lighter />
          </View>
        </>
      )}



      {/* Weather */}
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
  );
}
