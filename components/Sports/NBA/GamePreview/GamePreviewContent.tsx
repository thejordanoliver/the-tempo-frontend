import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  BoxScore,
  GameLeaders,
  GameLocation,
  GameTeamStats,
  HeadToHeadGames,
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
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
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
        gameStatusDescription={gameStatusDescription}
      />

      <LineScore
        linescore={lineScore}
        homeCode={home?.code}
        awayCode={away?.code}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <GameLeaders
        gameLeaders={gameLeaders}
        awayTeamId={away?.id}
        homeTeamId={home?.id}
        loading={loading}
        error={error}
        isDark
        gameStatusDescription={gameStatusDescription}
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
        homeCode={home.code}
        awayCode={away.code}
        homeLogo={home.logoLight || home.logo}
        awayLogo={away.logoLight || away.logo}
        stats={teamStats}
        isDark
        gameStatusDescription={gameStatusDescription}
      />
      <HeadToHeadGames
        awayTeamId={away.id}
        homeTeamId={home.id}
        homeTeamColor={home?.color}
        awayTeamColor={away?.color}
        isDark
      />

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

      <Officials
        officials={officials ?? []}
        gameStatusDescription={gameStatusDescription}
        isDark
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
