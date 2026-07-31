import BoxScore from "@/components/Sports/Basketball/GameDetails/BoxScore";
import GameLeaders from "@/components/Sports/Basketball/GameDetails/GameLeaders";
import { Official } from "@/hooks/FootballHooks/useFootballGameDetails";
import { Highlight } from "@/types/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  GameLocation,
  GameTeamStats,
  HighlightVideoList,
  LineScore,
  MatchupPredictor,
} from "components/Sports/NBA/GameDetails";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";

type GamePreviewContentProps = {
  homeId: any;
  homeColor: string;
  homeName: string;
  homeCode: string;
  homeLogo: any;
  awayId: number;
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
  officials: Official[];
  highlights: Highlight[];
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
  homeId,
  homeColor,
  homeName,
  homeCode,
  homeLogo,
  awayId,
  awayColor,
  awayName,
  awayCode,
  awayLogo,
  homeChance,
  awayChance,
  lineScore,
  highlights,
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
        isDark={true}
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
        isDark={true}
        state={state}
      />

      <GameLeaders
        leaders={leaders}
        homeId={homeId}
        homeLogo={homeLogo}
        awayId={awayId}
        awayLogo={awayLogo}
        state={state}
        isDark={true}
      />

      <BoxScore
        playerStats={playerStats}
        homeId={homeId}
        homeName={homeName}
        homeLogo={homeLogo}
        awayId={awayId}
        awayName={awayName}
        awayLogo={awayLogo}
        isDark={true}
        league={league}
        state={state}
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
        isDark={true}
      />

      <LastFiveGames
        home={{
          teamId: homeId,
          teamCode: homeCode,
          games: homeLastGames.games,
        }}
        away={{
          teamId: awayId,
          teamCode: awayCode,
          games: awayLastGames.games,
        }}
        league={league}
        state={state}
        isDark={true}
      />

      <HighlightVideoList highlights={highlights} isDark={true} />

      <Officials officials={officials} isDark={true} state={state} />

      <GameLocation
        venueImage={venueImage}
        venueName={venueName}
        location={venueLocation}
        address={venueAddress}
        venueCapacity={venueCapacity}
        venueAttendance={venueAttendance}
        weather={weather}
        isDark={true}
      />
    </BottomSheetScrollView>
  );
}
