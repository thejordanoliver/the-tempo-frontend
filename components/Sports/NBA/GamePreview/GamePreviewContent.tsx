import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLeaders, GameLocation } from "components/Sports/NBA/GameDetails";
import BoxScore from "components/Sports/NBA/GameDetails/BoxScore";
import GameTeamStats from "components/Sports/NBA/GameDetails/GameTeamStats";
import LastFiveGamesSwitcher from "components/Sports/NBA/GameDetails/LastFiveGames";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import TeamInjuries from "components/Sports/NBA/GameDetails/TeamInjuries";
import React from "react";
import { View } from "react-native";

export default function GamePreviewContent({
  game,
  home,
  away,
  homeChance,
  awayChance,
  lineScore,
  homeLastGames,
  awayLastGames,
  gameStats,
  officials,
  injuries,
  teamPlayersMap,
  detailsLoading,
  detailsError,
  resolvedVenueImage,
  resolvedVenueName,
  resolvedVenueCity,
  resolvedVenueAddress,
  resolvedVenueCapacity,
  weather,
  isDark,
  gameStatusDescription,
}: any) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Matchup Predictor */}
      {gameStatusDescription === "Scheduled" && (
        <View style={{ marginBottom: 20 }}>
          <MatchupPredictor
            home={{
              name: home.code,
              logo: home.logoLight || home.logo,
              color: home.secondaryColor,
              chance: homeChance,
            }}
            away={{
              name: away.code,
              logo: away.logoLight || away.logo,
              color: away.secondaryColor,
              chance: awayChance,
            }}
            size={180}
            lighter={true}
          />
        </View>
      )}
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

      {/* Game Leaders */}
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

          {/* Box Score */}
          <View style={{ marginBottom: 20 }}>
            <BoxScore
              gameId={game.id.toString()}
              awayTeamId={away?.id}
              homeTeamId={home?.id}
              lighter
            />
          </View>

          {/* Team Stats */}
          <View style={{ marginBottom: 20 }}>
            {gameStats.length > 0 && (
              <GameTeamStats
                stats={gameStats}
                lighter={true}
                gameStatusDescription={gameStatusDescription}
              />
            )}
          </View>
        </>
      )}

      {/* Last Five Games */}
      {(homeLastGames?.games?.length > 0 ||
        awayLastGames?.games?.length > 0) && (
        <View style={{ marginBottom: 20 }}>
          <LastFiveGamesSwitcher
            home={{
              teamId: home.id,
              teamCode: home.code,
              games: homeLastGames.games,
            }}
            away={{
              teamId: away.id,
              teamCode: away.code,
              games: awayLastGames.games,
            }}
            league="NBA"
            isDark={isDark}
            lighter
          />
        </View>
      )}

      {/* Injuries */}
      <View style={{ marginBottom: 20 }}>
        <TeamInjuries
          injuries={injuries}
          loading={detailsLoading}
          lighter={true}
          teamPlayersMap={teamPlayersMap}
        />
      </View>

      {/* Officials */}
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
