import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  BoxScore,
  GameLeaders,
  GameLocation,
  GameTeamStats,
  LineScore,
  Officials,
  TeamInjuries,
} from "components/Sports/NBA/GameDetails";
import React from "react";
export default function GamePreviewContent({
  gameStatusDescription,
  game,
  home,
  away,
  lineScore,
  gameStats,
  playerStats,
  officials,
  injuries,
  weatherLoading,
  weatherError,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueAttendance,
  venueCapacity,
  weather,
}: any) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {/* Line Score */}
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={home?.code}
          awayCode={away?.code}
          isDark={true}
        />
      )}

      {/* Game Stats */}
      {game?.id && gameStats?.length > 0 && (
        <>
          <GameLeaders
            gameId={game.id.toString()}
            awayTeamId={away?.id}
            homeTeamId={home?.id}
            isDark={true}
          />

          <BoxScore
            playerStats={playerStats}
            awayTeamId={away?.id}
            homeTeamId={home?.id}
            isDark={true}
            league="NBA"
          />

          {gameStats.length > 0 && (
            <GameTeamStats
              stats={gameStats}
              gameStatusDescription={gameStatusDescription}
              isDark={true}
            />
          )}
        </>
      )}

      {/* Injuries */}

      <TeamInjuries injuries={injuries} isDark={true} />

      <Officials
        officials={officials ?? []}
        loading={false}
        error={null}
        isDark={true}
      />

      {/* Venue Info */}
      {(venueImage || venueName) && (
        <GameLocation
          venueImage={venueImage}
          venueName={venueName}
          location={venueLocation}
          address={venueAddress}
          venueCapacity={venueCapacity}
          venueAttendance={venueAttendance}
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          isDark={true}
        />
      )}
    </BottomSheetScrollView>
  );
}
