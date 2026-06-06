import { LeagueType } from "@/types/types";
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

type GamePreviewContentProps = {
  homeColor: string;
  homeCode: string;
  homeLogo: any;
  awayColor: string;
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
  officials: any[];
  error?: string | null;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCapacity?: string | null;
  venueAttendance?: number | null;
  weather?: any;
  gameStatusDescription: string;
  league: LeagueType;
  isChampionship: boolean;
};

export default function GamePreviewContent({
  homeColor,
  homeCode,
  homeLogo,
  awayColor,
  awayCode,
  awayLogo,
  lineScore,
  officials,
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
  gameStatusDescription,
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
          isDark
          gameStatusDescription={gameStatusDescription}
        />

        <LineScore
          linescore={lineScore}
          homeCode={homeCode}
          awayCode={awayCode}
          isDark
          gameStatusDescription={gameStatusDescription}
          league={league}
        />

        <Officials
          officials={officials ?? []}
          isDark
          gameStatusDescription={gameStatusDescription}
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
