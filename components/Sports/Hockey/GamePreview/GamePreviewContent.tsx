import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation, LastFiveGames } from "components/Sports/NBA/GameDetails";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import React from "react";

type GamePreviewContentProps = {
  homeTeamId: number;
  homeColor: string;
  homeName: string;
  homeCode: string;
  homeLogo: any;
  awayTeamId: number;
  awayColor: string;
  awayName: string;
  awayCode: string;
  awayLogo: any;
  lineScore: any;
  homeLastGames: { games: any[] };
  awayLastGames: { games: any[] };
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCity?: string | null;
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  gameStatusDescription: string;
  gameState?: string;
  league: string;
};

export default function GamePreviewContent({
  homeTeamId,
  awayTeamId,
  homeCode,
  awayCode,
  homeName,
  awayName,
  lineScore,
  homeLastGames,
  awayLastGames,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueAttendance,
  venueCapacity,
  weather,
  gameState,
  league,
}: GamePreviewContentProps) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={homeCode}
          awayCode={awayCode}
          league="nhl"
          isDark
          state={gameState}
        />
      )}

      <LastFiveGames
        away={{
          teamId: awayTeamId,
          teamCode: awayCode,
          games: awayLastGames.games,
        }}
        home={{
          teamId: homeTeamId,
          teamCode: homeCode,
          games: homeLastGames.games,
        }}
        isDark
        league={league}
        state={gameState}
      />

      <GameLocation
        venueImage={venueImage}
        venueName={venueName}
        location={venueLocation}
        address={venueAddress}
        venueCapacity={venueCapacity}
        venueAttendance={venueAttendance}
        weather={weather}
        isDark
      />
    </BottomSheetScrollView>
  );
}
