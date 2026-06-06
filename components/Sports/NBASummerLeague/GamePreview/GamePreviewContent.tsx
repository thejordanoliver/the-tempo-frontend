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
  venueCity,
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
          gameStatusDescription={gameStatusDescription}
        />
      )}

      {/* Game Stats */}
      {game?.id && gameStats?.length > 0 && (
        <>
          <GameLeaders
            gameLeaders={null}
            awayTeamId={away?.id}
            homeTeamId={home?.id}
            loading={false}
            error={null}
            isDark={true}
            gameStatusDescription={gameStatusDescription}
          />

          <BoxScore
            playerStats={playerStats ?? []}
            awayTeamId={away?.id}
            homeTeamId={home?.id}
            homeName={home?.name ?? home?.code ?? ""}
            awayName={away?.name ?? away?.code ?? ""}
            homeLogo={home?.logo}
            awayLogo={away?.logo}
            isDark={true}
            league="NBA"
            gameStatusDescription={gameStatusDescription}
          />

          {gameStats.length > 0 && (
            <GameTeamStats
              stats={gameStats}
              homeLogo={home?.logo}
              awayLogo={away?.logo}
              homeCode={home?.code}
              awayCode={away?.code}
              gameStatusDescription={gameStatusDescription}
              isDark={true}
            />
          )}
        </>
      )}

      {/* Injuries */}

      <TeamInjuries injuries={injuries ?? []} league="NBA" isDark={true} />

      <Officials
        officials={officials ?? []}
        isDark={true}
        gameStatusDescription={gameStatusDescription}
      />

      {/* Venue Info */}
      {(venueImage || venueName) && (
        <GameLocation
          venueImage={venueImage}
          venueName={venueName}
          location={venueLocation ?? venueCity}
          address={venueAddress}
          venueCapacity={venueCapacity}
          venueAttendance={venueAttendance}
          weather={weather}
          isDark={true}
        />
      )}
    </BottomSheetScrollView>
  );
}
