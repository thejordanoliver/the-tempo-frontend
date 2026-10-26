import {
  GameLocation,
  GameTeamStats,
  LastFiveGames,
  LineScore,
  Officials,
} from "@/components/Sports/Basketball/GameDetails";
import { GamePreviewModalStyles } from "@/styles/ModalsStyles/GamePreviewModalStyles";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { LastFiveGame } from "../../Basketball/GameDetails/LastFiveGames";
import SoccerPlayByPlay from "../GameDetails/SoccerPlayByPlay";
import type { SoccerPlayByPlayEvent } from "types/soccer/playByPlay";

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
  lineScore?: {
    home: string[];
    away: string[];
  };
  homeLastGames: LastFiveGame[];
  awayLastGames: LastFiveGame[];
  teamStats: any[];
  playByPlay?: SoccerPlayByPlayEvent[];
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
  isDark: boolean;
};

export default function GamePreviewContent({
  homeId,
  homeCode,
  homeLogo,
  awayId,
  awayCode,
  awayLogo,
  homeColor,
  awayColor,
  lineScore,
  homeLastGames,
  awayLastGames,
  teamStats,
  playByPlay,
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
  isDark,
}: GamePreviewContentProps) {
  const styles = GamePreviewModalStyles({ isDark: isDark });

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
          isDark={isDark}
          state={state}
        />

        <SoccerPlayByPlay
          events={playByPlay}
          awayId={awayId}
          homeId={homeId}
          awayCode={awayCode}
          homeCode={homeCode}
          awayLogo={awayLogo}
          homeLogo={homeLogo}
          isDark={isDark}
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
          isDark={isDark}
          state={state}
        />

        <LastFiveGames
          homeId={homeId}
          awayId={awayId}
          homeCode={homeCode}
          awayCode={awayCode}
          homeGames={homeLastGames}
          awayGames={awayLastGames}
          league={"soccer"}
          state={state}
          isDark={isDark}
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
          isDark={isDark}
        />
      </View>
    </BottomSheetScrollView>
  );
}
