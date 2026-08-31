import {
  GameLocation,
  LastFiveGames,
} from "@/components/Sports/Basketball/GameDetails";
import LineScore from "@/components/Sports/Basketball/GameDetails/LineScore";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewModalStyles";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { LastFiveGame } from "../../Basketball/GameDetails/LastFiveGames";

type GamePreviewContentProps = {
  homeId: number;
  awayId: number;
  homeColor: string;
  homeName: string;
  homeCode: string;
  homeLogo: any;
  awayColor: string;
  awayName: string;
  awayCode: string;
  awayLogo: any;
  lineScore: any;
  homeLastGames: LastFiveGame[];
  awayLastGames: LastFiveGame[];
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
  isDark: boolean
};

export default function GamePreviewContent({
  homeId,
  awayId,
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
  isDark,
}: GamePreviewContentProps) {
  const styles = gamePreviewModalStyle({isDark: isDark});
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

        <LastFiveGames
          homeId={homeId}
          awayId={awayId}
          homeCode={homeCode}
          awayCode={awayCode}
          homeGames={homeLastGames}
          awayGames={awayLastGames}
          league={league}
          state={state}
          isDark={isDark}
        />
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
