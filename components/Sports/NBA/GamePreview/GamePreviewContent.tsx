import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import { GameLeaders, GameLocation } from "components/Sports/NBA/GameDetails";
import GameTeamStats from "components/Sports/NBA/GameDetails/GameTeamStats";
import TeamInjuries from "components/Sports/NBA/GameDetails/InjuryReport/TeamInjuries";
import LastFiveGamesSwitcher from "components/Sports/NBA/GameDetails/LastFiveGames";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";

export default function GamePreviewContent({
  game,
  home,
  away,
  homeChance,
  awayChance,
  lineScore,
  homeLastGames,
  awayLastGames,
  playerStats,
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
  gameStatusDescription,
}: any) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {/* Matchup Predictor */}
      {gameStatusDescription === "Scheduled" && (
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
          isDark={true}
        />
      )}
      {/* Line Score */}
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={home?.code}
          awayCode={away?.code}
          isDark={true}
        />
      )}

      {/* Game Leaders */}
      {game?.id && gameStats?.length > 0 && (
        <>
          <GameLeaders
            gameId={game.id.toString()}
            awayTeamId={away?.id}
            homeTeamId={home?.id}
            isDark={true}
          />

          {/* Box Score */}

          <BoxScore
            playerStats={playerStats}
            awayTeamId={away?.espnID}
            homeTeamId={home?.espnID}
            isDark
            league={"NBA"}
          />

          {/* Team Stats */}

          {gameStats.length > 0 && (
            <GameTeamStats
              stats={gameStats}
              isDark
              gameStatusDescription={gameStatusDescription}
            />
          )}
        </>
      )}

      {/* Last Five Games */}
      {(homeLastGames?.games?.length > 0 ||
        awayLastGames?.games?.length > 0) && (
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
          isDark={true}
        />
      )}

      {/* Injuries */}

      <TeamInjuries
        injuries={injuries}
        loading={detailsLoading}
        isDark={true}
        teamPlayersMap={teamPlayersMap}
      />

      {/* Officials */}

      <Officials
        officials={officials ?? []}
        loading={false}
        error={null}
        isDark={true}
      />

      {/* Venue Info */}
      {(resolvedVenueImage || resolvedVenueName) && (
        <GameLocation
          venueImage={resolvedVenueImage}
          venueName={resolvedVenueName}
          location={resolvedVenueCity}
          address={resolvedVenueAddress}
          venueCapacity={resolvedVenueCapacity}
          weather={weather}
          loading={detailsLoading}
          error={detailsError ?? null}
          isDark={true}
        />
      )}
    </BottomSheetScrollView>
  );
}
