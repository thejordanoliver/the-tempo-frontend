import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  GameLocation,
  LastFiveGames,
  LineScore,
  Officials,
} from "components/Sports/NBA/GameDetails";
import React from "react";
import GameTeamStats from "../GameDetails/GameTeamStats";

type GamePreviewContentProps = {
  homeTeamId: any;
  homeColor: string;
  homeName: string;
  homeCode: string;
  homeLogo: any;
  awayTeamId: number;
  awayColor: string;
  awayName: string;
  awayCode: string;
  awayLogo: any;
  lineScore?: {
    home: string[];
    away: string[];
  };
  homeLastGames: { games: any[] };
  awayLastGames: { games: any[] };
  teamStats: any[];
  officials: any[];
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
  homeCode,
  homeLogo,
  awayTeamId,
  awayCode,
  awayLogo,
  homeColor,
  awayColor,
  lineScore,
  homeLastGames,
  awayLastGames,
  teamStats,
  officials,
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

      <GameTeamStats
        stats={teamStats}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        homeCode={homeCode}
        awayCode={awayCode}
        homeColor={homeColor}
        awayColor={awayColor}
        isDark
        state={state}
      />

      <LastFiveGames
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
        league={"SOCC"}
        state={state}
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
