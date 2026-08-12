import {
  GameLocation,
  GameTeamStats,
  HeadCoaches,
  Highlights,
  LineScore,
  MatchupPredictor,
} from "@/components/Sports/Basketball/GameDetails";
import BoxScore from "@/components/Sports/Basketball/GameDetails/BoxScore";
import GameLeaders from "@/components/Sports/Basketball/GameDetails/GameLeaders";
import LastFiveGames, {
  LastFiveGame,
} from "@/components/Sports/Basketball/GameDetails/LastFiveGames";
import Officials from "@/components/Sports/Basketball/GameDetails/Officials";
import { Official } from "@/hooks/FootballHooks/useFootballGameDetails";
import { Coach } from "@/hooks/useTeams";
import { Highlight } from "@/types/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";

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
  homeLastGames: LastFiveGame[];
  awayLastGames: LastFiveGame[];
  playerStats: any[];
  teamStats: any[];
  officials: Official[];
  highlights: Highlight[];
  homeCoach: Coach | undefined | null;
  awayCoach: Coach | undefined | null;
  error?: string | null;
  leaders: any;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  state?: string | null;
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
  homeCoach,
  awayCoach,
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
  const styles = gamePreviewModalStyle();
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainerStyle}
    >
      <View style={styles.bottomSheetScrollViewWrapper}>
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
          homeId={homeId}
          homeLogo={homeLogo}
          awayId={awayId}
          awayLogo={awayLogo}
          state={state}
          isDark
        />

        <BoxScore
          playerStats={playerStats}
          homeId={homeId}
          homeName={homeName}
          homeLogo={homeLogo}
          awayId={awayId}
          awayName={awayName}
          awayLogo={awayLogo}
          isDark
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
          isDark
        />

        <LastFiveGames
          homeId={homeId}
          awayId={awayId}
          homeCode={homeCode}
          awayCode={awayCode}
          homeGames={homeLastGames}
          awayGames={awayLastGames}
          league={league}
          state={state}
          isDark
        />
        <Highlights highlights={highlights} isDark />

        <HeadCoaches
          homeName={homeName}
          awayName={awayName}
          homeCoach={homeCoach}
          awayCoach={awayCoach}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          isDark
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
      </View>
    </BottomSheetScrollView>
  );
}
