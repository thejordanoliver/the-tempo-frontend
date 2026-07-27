import {
  Team,
  TeamBoxScoreStat,
  TeamInjury,
  TeamLeaders,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  GameLocation,
  LineScore,
  MatchupPredictor,
  Officials,
} from "components/Sports/NBA/GameDetails";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import TeamInjuries from "../../Baseball/GameDetails/InjuryReport/TeamInjuries";
import GameLeaders from "../GameDetails/GameLeaders";
import GameTeamStats from "../GameDetails/GameTeamStats";

type GamePreviewContentProps = {
  homeColor: string;
  homeCode: string;
  homeLogo: any;
  awayColor: string;
  awayCode: string;
  homeId: number;
  awayId: number;
  homeEspnId: number;
  awayEspnId: number;
  awayLogo: any;
  homeChance: number;
  awayChance: number;
  lineScore?: {
    home: string[];
    away: string[];
  };
  teamStats: {
    team: Team;
    stats: TeamBoxScoreStat[];
  }[];
  leaders: TeamLeaders[];
  injuries: TeamInjury[];
  homeLastGames: { games: any[] };
  awayLastGames: { games: any[] };
  officials: any[];
  error?: string | null;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueSurface?: boolean;
  venueAddress?: string;
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  state: string;
  league: string;
  isChampionship: boolean;
};

export default function GamePreviewContent({
  homeColor,
  homeId,
  homeEspnId,
  homeCode,
  homeLogo,
  awayColor,
  awayId,
  awayEspnId,
  awayCode,
  awayLogo,
  lineScore,
  teamStats,
  leaders,
  injuries,
  officials,
  homeChance,
  awayChance,
  venueImage,
  venueName,
  venueLocation,
  venueSurface,
  venueAddress,
  venueCapacity,
  venueAttendance,
  weather,
  isChampionship,
  state,
  league,
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
          state={state}
          isDark
        />

        <LineScore
          linescore={lineScore}
          homeCode={homeCode}
          awayCode={awayCode}
          state={state}
          league={league}
          isDark
        />

        <GameTeamStats
          teamStats={teamStats}
          awayLogo={awayLogo}
          homeLogo={homeLogo}
          awayCode={awayCode}
          homeCode={homeCode}
          homeColor={homeColor}
          awayColor={awayColor}
          state={state}
          isDark
        />

        <GameLeaders
          leaders={leaders}
          awayId={awayId}
          homeId={homeId}
          awayLogo={awayLogo}
          homeLogo={homeLogo}
          awayCode={awayCode}
          homeCode={homeCode}
          league={league}
          state={state}
          isDark
        />

        <TeamInjuries
          injuries={injuries}
          awayId={awayEspnId}
          homeId={homeEspnId}
          homeCode={homeCode}
          awayCode={awayCode}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          state={state}
          league={league}
          isDark
        />

        <Officials officials={officials ?? []} state={state} isDark />

        <GameLocation
          venueImage={venueImage}
          venueName={venueName}
          location={venueLocation}
          address={venueAddress}
          venueCapacity={venueCapacity}
          venueAttendance={venueAttendance}
          weather={weather}
          grass={venueSurface}
          surface={"football"}
          isDark
        />
      </View>
    </BottomSheetScrollView>
  );
}
