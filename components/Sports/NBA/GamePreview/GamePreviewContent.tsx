import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  BoxScore,
  GameLeaders,
  GameLocation,
  GameTeamStats,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
  TeamInjuries,
} from "components/Sports/NBA/GameDetails";
import React from "react";
import { NBATeam } from "types/nba";

type GamePreviewContentProps = {
  home: NBATeam;
  away: NBATeam;
  homeChance: number;
  awayChance: number;
  lineScore?: {
    home: string[];
    away: string[];
  };
  homeLastGames: { games: any[] };
  awayLastGames: { games: any[] };
  playerStats: any[];
  teamStats: any[];
  officials: any[];
  injuries: any[];
  loading: boolean;
  error?: string | null;
  teamPlayersMap: Record<string, any[]>;
  detailsLoading?: boolean;
  gameLeaders: any[] | null;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCapacity?: string | null;
  venueAttendance?: number | null;
  weather?: any;
  gameStatusDescription: string;
};

export default function GamePreviewContent({
  home,
  away,
  homeChance,
  awayChance,
  lineScore,
  homeLastGames,
  awayLastGames,
  playerStats,
  teamStats,
  officials,
  injuries,
  loading,
  error,
  teamPlayersMap,
  detailsLoading,
  gameLeaders,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueCapacity,
  venueAttendance,
  weather,
  gameStatusDescription,
}: GamePreviewContentProps) {
  const isScheduled = gameStatusDescription === "Scheduled";
  const showLiveSections = !isScheduled;

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {isScheduled && (
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
          isDark
        />
      )}

      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={home?.code}
          awayCode={away?.code}
          isDark
        />
      )}

      {showLiveSections && (
        <>
          <GameLeaders
            gameLeaders={gameLeaders}
            awayTeamId={away?.id}
            homeTeamId={home?.id}
            loading={loading}
            error={error}
            isDark
          />

          <BoxScore
            playerStats={playerStats}
            awayTeamId={away?.espnID}
            homeTeamId={home?.espnID}
            league={"NBA"}
            gameStatusDescription={gameStatusDescription}
            isDark
          />

          <GameTeamStats
            stats={teamStats}
            gameStatusDescription={gameStatusDescription}
            isDark
          />
        </>
      )}

      <LastFiveGames
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
        isDark
      />

      <TeamInjuries
        injuries={injuries}
        loading={detailsLoading}
        isDark
        teamPlayersMap={teamPlayersMap}
      />

      <Officials officials={officials ?? []} isDark />

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
