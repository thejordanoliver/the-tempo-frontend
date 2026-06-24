import BoxScore from "@/components/Sports/Basketball/GameDetails/BoxScore";
import GameLeaders from "@/components/Sports/Basketball/GameDetails/GameLeaders";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  GameLocation,
  GameTeamStats,
  LineScore,
  MatchupPredictor,
} from "components/Sports/NBA/GameDetails";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";

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
  error?: string | null;
  leaders: any;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  state: string;
  league: string;
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

      <GameTeamStats
        stats={teamStats}
        awayName={awayCode}
        awayLogo={awayLogo}
        awayColor={awayColor}
        homeName={homeCode}
        homeLogo={homeLogo}
        homeColor={homeColor}
        state={state}
        isDark
      />

      <BoxScore
        playerStats={playerStats}
        awayTeamId={Number(awayEspnId)}
        awayLogo={awayLogo}
        awayName={awayName}
        homeTeamId={Number(homeEspnId)}
        homeLogo={homeLogo}
        homeName={homeName}
        league={league}
        isDark
        state={state}
      />

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
        state={state}
      />

      <Officials officials={officials} isDark state={state} />

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
