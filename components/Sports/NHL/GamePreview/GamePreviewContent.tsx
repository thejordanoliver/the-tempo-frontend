import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import React from "react";

type GamePreviewContentProps = {
  homeColor: string;
  homeName: string;
  homeCode: string;
  homeLogo: any;
  awayColor: string;
  awayName: string;
  awayCode: string;
  awayLogo: any;
  lineScore: any;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCity?: string | null;
  venueCapacity?: string | null;
  venueAttendance?: number | null;
  weather?: any;
  gameStatusDescription: string;
};

export default function GamePreviewContent({
  homeCode,
  awayCode,
  homeName,
  awayName,
  lineScore,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueAttendance,
  venueCapacity,
  weather,
  gameStatusDescription,
}: GamePreviewContentProps) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={homeCode}
          awayCode={awayCode}
          league="NHL"
          isDark
          gameStatusDescription={gameStatusDescription}
        />
      )}

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
    </BottomSheetScrollView>
  );
}
