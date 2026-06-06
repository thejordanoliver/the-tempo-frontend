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
import { LeagueType } from "types/types";

type GamePreviewContentProps = {
  homeTeamId: any;
  homeEspnId: number;
  homeColor: string;
  homeName: string;
  homeCode: string;
  homeLogo: any;
  awayTeamId: number;
  awayEspnId: number;
  awayColor: string;
  awayName: string;
  awayCode: string;
  awayLogo: any;
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
  gameLeadersLoading: boolean;
  gameLeadersError: string | null;
  gameStatusDescription: string;
  league: LeagueType;
};

export default function GamePreviewContent({
  homeTeamId,
  homeEspnId,
  homeColor,
  homeName,
  homeCode,
  homeLogo,
  awayTeamId,
  awayEspnId,
  awayColor,
  awayName,
  awayCode,
  awayLogo,
  homeChance,
  awayChance,
  lineScore,
  homeLastGames,
  awayLastGames,
  playerStats,
  teamStats,
  officials,
  injuries,
  teamPlayersMap,
  gameLeadersError,
  gameLeadersLoading,
  gameLeaders,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueCapacity,
  venueAttendance,
  weather,
  gameStatusDescription,
  league,
}: GamePreviewContentProps) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      <LineScore
        linescore={lineScore}
        awayCode={awayCode}
        homeCode={homeCode}
        league={league}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <MatchupPredictor
        homeCode={homeCode}
        homeLogo={homeLogo}
        homeChance={homeChance}
        homeColor={homeColor}
        awayCode={awayCode}
        awayLogo={awayLogo}
        awayChance={awayChance}
        awayColor={awayColor}
        size={180}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <GameLeaders
        gameLeaders={gameLeaders}
        awayTeamId={awayTeamId}
        homeTeamId={homeTeamId}
        loading={gameLeadersLoading}
        error={gameLeadersError}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <BoxScore
        playerStats={playerStats}
        awayTeamId={Number(awayEspnId)}
        homeTeamId={Number(homeEspnId)}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        homeName={homeName}
        awayName={awayName}
        isDark
        league={league}
        gameStatusDescription={gameStatusDescription}
      />

      <GameTeamStats
        stats={teamStats}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        homeCode={homeCode}
        awayCode={awayCode}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <HeadToHeadGames
        awayTeamId={awayTeamId}
        homeTeamId={homeTeamId}
        homeTeamColor={homeColor}
        awayTeamColor={awayColor}
        isDark
      />

      <LastFiveGames
        isDark
        home={{
          teamId: homeTeamId,
          teamCode: homeCode,
          games: homeLastGames.games,
        }}
        away={{
          teamId: awayTeamId,
          teamCode: awayCode,
          games: awayLastGames.games,
        }}
        league={league}
        gameStatusDescription={gameStatusDescription}
      />

      <TeamInjuries
        injuries={injuries}
        teamPlayersMap={teamPlayersMap}
        league={league === "WNBA" ? "WNBA" : "NBA"}
        isDark
      />

      <Officials
        officials={officials}
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
