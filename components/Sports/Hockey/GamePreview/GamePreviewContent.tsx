import {
  GameLocation,
  HeadCoaches,
  Highlights,
  LastFiveGames,
  LineScore,
  Officials,
  TeamInjuries,
} from "@/components/Sports/Basketball/GameDetails";
import {
  Official,
  TeamInjury,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import { Coach } from "@/hooks/useTeams";
import { GamePreviewModalStyles } from "@/styles/ModalsStyles/GamePreviewModalStyles";
import { Highlight } from "@/types/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { LastFiveGame } from "../../Basketball/GameDetails/LastFiveGames";

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
  lineScore: any;
  injuries: TeamInjury[];
  homeLastGames: LastFiveGame[];
  awayLastGames: LastFiveGame[];
  homeCoach: Coach | undefined | null;
  awayCoach: Coach | undefined | null;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCity?: string | null;
  venueCapacity?: number | null;
  venueAttendance?: number | null;
  weather?: any;
  officials: Official[];
  highlights: Highlight[];
  gameStatusDescription: string;
  state: string;
  league: string;
  isDark: boolean;
};

export default function GamePreviewContent({
  homeColor,
  homeCode,
  homeLogo,
  awayColor,
  awayCode,
  homeId,
  awayId,
  homeName,
  awayName,
  awayLogo,
  homeCoach,
  awayCoach,
  lineScore,
  injuries,
  highlights,
  homeLastGames,
  awayLastGames,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueAttendance,
  venueCapacity,
  weather,
  officials,
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

        <Highlights highlights={highlights} isDark={isDark} />

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
          isDark={isDark}
        />

        <HeadCoaches
          homeCode={homeCode}
          awayCode={awayCode}
          homeCoach={homeCoach}
          awayCoach={awayCoach}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          isDark={isDark}
          state={state}
        />

        <Officials officials={officials ?? []} state={state} isDark={isDark} />

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
