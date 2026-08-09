import {
  GameLocation,
  GameTeamStats,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
} from "@/components/Sports/Basketball/GameDetails";
import {
  PlayerStatsByTeam,
  TeamStat,
} from "@/hooks/BaseballHooks/useBaseballGameDetails";
import { Highlight } from "@/types/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import BoxScore from "../GameDetails/BoxScore";
import TeamInjuries from "../GameDetails/InjuryReport/TeamInjuries";

type GamePreviewContentProps = {
  homeId: number;
  homeEspnId: number;
  homeColor: string;
  homeCode: string;
  homeName: string;
  homeLogo: any;
  awayId: number;
  awayEspnId: number;
  awayColor: string;
  awayCode: string;
  awayName: string;
  awayLogo: any;
  homeChance: number;
  awayChance: number;
  lineScore?: {
    home: string[];
    away: string[];
  };
  homeLastGames: { games: any[] };
  awayLastGames: { games: any[] };
  homeHits: number | null;
  awayHits: number | null;
  homeRuns: number | null;
  awayRuns: number | null;
  awayErrors: number;
  homeErrors: number;
  teamStats: {
    team: any;
    stats: TeamStat[];
  }[];
  playerStats: PlayerStatsByTeam[];
  officials: any[];
  injuries: any[];

  error?: string | null;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  gameStatusDescription: string;
  league: string;
  state?: "pre" | "in"| "post" | null;
  isChampionship: boolean;
  highlights: Highlight[];
  isMLB: boolean;
};

export default function GamePreviewContent({
  homeId,
  homeEspnId,
  homeColor,
  homeCode,
  homeName,
  homeLogo,
  awayId,
  awayEspnId,
  awayColor,
  awayCode,
  awayName,
  awayLogo,
  homeLastGames,
  awayLastGames,
  lineScore,
  homeHits,
  awayHits,
  homeRuns,
  awayRuns,
  awayErrors,
  homeErrors,
  teamStats,
  playerStats,
  officials,
  injuries,
  homeChance,
  awayChance,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueCapacity,
  venueAttendance,
  weather,
  isChampionship,
  state,
  league,
  isMLB,
}: GamePreviewContentProps) {
  const styles = gamePreviewModalStyle(isChampionship);

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainerStyle}
    >
      <View style={styles.bottomSheetScrollViewWrapper}>
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

        <LineScore
          linescore={lineScore}
          homeCode={homeCode}
          awayCode={awayCode}
          homeHits={homeHits}
          awayHits={awayHits}
          homeRuns={homeRuns}
          awayRuns={awayRuns}
          awayErrors={awayErrors}
          homeErrors={homeErrors}
          isDark
          state={state}
          league={league}
        />

        <GameTeamStats
          stats={teamStats}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeCode={homeCode}
          awayCode={awayCode}
          awayColor={awayColor}
          homeColor={homeColor}
          isDark
          state={state}
          league={league}
        />

        <BoxScore
          awayTeamId={awayId}
          homeTeamId={homeId}
          awayName={awayName}
          homeName={homeName}
          awayLogo={awayLogo}
          homeLogo={homeLogo}
          playerStats={playerStats}
          state={state}
          isDark
        />

        <Officials officials={officials ?? []} isDark state={state} />

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
          isDark
        />

        <TeamInjuries
          injuries={injuries}
          homeId={homeEspnId}
          awayId={awayEspnId}
          homeCode={homeCode}
          awayCode={awayCode}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          isDark
          state={state}
          league={league}
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
      </View>
    </BottomSheetScrollView>
  );
}
