import {
  GameLocation,
  LastFiveGames,
} from "@/components/Sports/Basketball/GameDetails";
import LineScore from "@/components/Sports/Basketball/GameDetails/LineScore";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";

type GamePreviewContentProps = {
  homeTeamId: number;
  homeColor: string;
  homeName: string;
  homeCode: string;
  homeLogo: any;
  awayTeamId: number;
  awayColor: string;
  awayName: string;
  awayCode: string;
  awayLogo: any;
  lineScore: any;
  homeLastGames: { games: any[] };
  awayLastGames: { games: any[] };
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCity?: string | null;
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  gameStatusDescription: string;
  state?: string;
  league: string;
};

export default function GamePreviewContent({
  homeTeamId,
  awayTeamId,
  homeCode,
  awayCode,
  homeName,
  awayName,
  lineScore,
  homeLastGames,
  awayLastGames,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueAttendance,
  venueCapacity,
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
