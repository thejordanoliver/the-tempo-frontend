import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LineScore } from "components/GameDetails";
import BoxScore from "components/GameDetails/BoxScore";
import GameTeamStats from "components/GameDetails/GameTeamStats";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import Officials from "components/GameDetails/Officials";
import Weather from "components/GameDetails/Weather";
import React from "react";
import { View } from "react-native";
import GameLeaders from "../GameDetails/GameLeaders";
export default function GamePreviewContent({
  game,
  home,
  away,
  officials,
  lineScore,
  leaders,
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
      {lineScore && (
        <View style={{ marginBottom: 24 }}>
          <LineScore
            linescore={lineScore}
            homeCode={home.code}
            awayCode={away.code}
            league="CBB"
            lighter
          />
        </View>
      )}

      {leaders &&
        (leaders?.home?.length > 0 ||
          leaders?.away?.length > 0 ||
          leaders?.length > 0) && ( // fallback if array form
          <View style={{ marginBottom: 24 }}>
            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(away.espnID)}
              homeTeamId={Number(home.espnID)}
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

      <Officials
        officials={officials ?? []}
        loading={false}
        error={null}
        lighter
      />

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
