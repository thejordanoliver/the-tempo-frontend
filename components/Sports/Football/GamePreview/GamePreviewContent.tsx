import {
  GameLocation,
  GameTeamStats,
  HeadCoaches,
  Highlights,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
} from "@/components/Sports/Basketball/GameDetails";
import {
  FootballDrive,
  PlayObject,
  TeamInjury,
  TeamLeaders,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import { Coach } from "@/hooks/useTeams";
import { Highlight } from "@/types/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import TeamInjuries from "../../Baseball/GameDetails/InjuryReport/TeamInjuries";
import { TeamStatsEntry } from "../../Basketball/GameDetails/GameTeamStats";
import { LastFiveGame } from "../../Basketball/GameDetails/LastFiveGames";
import GameLeaders from "../GameDetails/GameLeaders";
import PlayByPlay from "../GameDetails/PlayByPlay/PlayByPlay";

type GamePreviewContentProps = {
  homeColor: string;
  homeCode: string;
  homeLogo: any;
  awayColor: string;
  awayCode: string;
  homeId: number;
  awayId: number;
  homeName: string;
  awayName: string;
  awayLogo: any;
  homeChance: number;
  awayChance: number;
  lineScore?: {
    home: string[];
    away: string[];
  };
  fieldPlay: PlayObject | null;
  drives: {
    previous: FootballDrive[];
    current: FootballDrive[];
  };
  teamStats?: TeamStatsEntry[];
  leaders: TeamLeaders[];
  injuries: TeamInjury[];
  homeLastGames: LastFiveGame[];
  awayLastGames: LastFiveGame[];
  homeCoach: Coach | undefined | null;
  awayCoach: Coach | undefined | null;
  officials: any[];
  error?: string | null;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueSurface?: boolean;
  venueAddress?: string;
  highlights: Highlight[];
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  state?: "pre" | "in" | "post" | null;
  league: string;
  isChampionship: boolean;
};

export default function GamePreviewContent({
  homeColor,
  homeId,
  homeCode,
  homeLogo,
  awayColor,
  awayId,
  awayCode,
  awayLogo,
  lineScore,
  teamStats,
  leaders,
  injuries,
  officials,
  homeName,
  awayName,
  fieldPlay,
  drives,
  homeCoach,
  awayCoach,
  homeLastGames,
  awayLastGames,
  homeChance,
  awayChance,
  venueImage,
  venueName,
  venueLocation,
  venueSurface,
  venueAddress,
  venueCapacity,
  venueAttendance,
  highlights,
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

        <PlayByPlay
          width={420}
          height={130}
          awayCode={awayCode}
          homeCode={homeCode}
          awayName={awayName}
          homeName={homeName}
          awayLogo={awayLogo}
          homeLogo={homeLogo}
          awayTeamId={awayId}
          homeTeamId={homeId}
          awayColor={awayColor}
          homeColor={homeColor}
          drives={drives}
          play={fieldPlay}
          showPlay={Boolean(fieldPlay)}
          isDark
          state={state}
          league={league}
        />

        <GameTeamStats
          stats={teamStats}
          awayName={awayCode}
          awayLogo={awayLogo}
          awayColor={awayColor}
          homeName={homeCode}
          homeLogo={homeLogo}
          homeColor={homeColor}
          league={league}
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

        <TeamInjuries
          injuries={injuries}
          awayId={awayId}
          homeId={homeId}
          homeCode={homeCode}
          awayCode={awayCode}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          state={state}
          league={league}
          isDark
        />

        <HeadCoaches
          homeCode={homeCode}
          awayCode={awayCode}
          homeCoach={homeCoach}
          awayCoach={awayCoach}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
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
