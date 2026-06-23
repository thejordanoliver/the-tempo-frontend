import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  GameLocation,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
} from "components/Sports/NBA/GameDetails";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import TeamInjuries from "../GameDetails/InjuryReport/TeamInjuries";

type GamePreviewContentProps = {
  homeId: number;
  homeColor: string;
  homeCode: string;
  homeLogo: any;
  awayId: number;
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
  injuries: any[];
  teamPlayersMap: Record<string, any[]>;
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
  state: string;
  isChampionship: boolean;
  isMLB: boolean;
};

export default function GamePreviewContent({
  homeId,
  homeColor,
  homeCode,
  homeLogo,
  awayId,
  awayColor,
  awayCode,
  awayLogo,
  homeLastGames,
  awayLastGames,
  lineScore,
  officials,
  injuries,
  teamPlayersMap,
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
          isDark
          state={state}
          league={league}
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
          teamPlayersMap={teamPlayersMap}
          league={isMLB}
          isDark
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
