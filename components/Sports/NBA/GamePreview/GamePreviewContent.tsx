import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  BoxScore,
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
import GameLeaders from "../../Basketball/GameDetails/GameLeaders";

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
  leaders: any;
  teamStats: any[];
  officials: any[];
  injuries: any[];
  error?: string | null;
  teamPlayersMap: Record<string, any[]>;
  detailsLoading?: boolean;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCapacity?: string | null;
  venueAttendance?: number | null;
  weather?: any;
  state: string;
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
  leaders,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueCapacity,
  venueAttendance,
  weather,
  state,
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
        state={state}
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
        state={state}
      />

      <GameLeaders
        leaders={leaders}
        homeCode={homeCode}
        homeLogo={homeLogo}
        awayCode={awayCode}
        awayLogo={awayLogo}
        homeTeamId={Number(homeEspnId)}
        awayTeamId={Number(awayEspnId)}
        league={league}
        state={state}
        isDark
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
        state={state}
      />

      <GameTeamStats
        stats={teamStats}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        homeCode={homeCode}
        awayCode={awayCode}
        isDark
        state={state}
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
        state={state}
      />

      <TeamInjuries
        injuries={injuries}
        teamPlayersMap={teamPlayersMap}
        league={league === "WNBA" ? "WNBA" : "NBA"}
        isDark
      />

      <Officials officials={officials} state={state} isDark />

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
