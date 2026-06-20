import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import React from "react";
import MatchupComparison from "../GameDetails/MatchupComparison/MatchupComparison";

type GamePreviewContentProps = {
  firstFighterId: number;
  secondFighterId: number;
  firstFighterStance: string;
  secondFighterStance: string;
  firstFighterHeight: string;
  firstFighterAge: number | string;
  secondFighterAge: number | string;
  secondFighterHeight: string;
  firstFighterWeight: number | string;
  secondFighterWeight: number | string;
  firstFighterName: string;
  secondFighterName: string;
  firstFighterFlag: string;
  secondFighterFlag: string;
  firstFighterCountry: string;
  secondFighterCountry: string;
  firstFighterRecord: string;
  secondFighterRecord: string;
  firstFighterClass: string;
  secondFighterClass: string;
  firstFighterReach: string;
  secondFighterReach: string;
  firstFighterIsWinner: boolean;
  secondFighterIsWinner: boolean;
  secondFighterIsChampion: boolean;
  firstFighterIsChampion: boolean;
  gameStatusDescription: string;
  venueImage?: any;
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string;
  venueCapacity?: number | null;
  venueAttendance?: number;
  weather?: any;
  state: string;
};

export default function GamePreviewContent({
  firstFighterId,
  secondFighterId,
  firstFighterStance,
  secondFighterStance,
  firstFighterHeight,
  firstFighterAge,
  secondFighterAge,
  secondFighterHeight,
  firstFighterWeight,
  secondFighterWeight,
  firstFighterName,
  secondFighterName,
  firstFighterFlag,
  secondFighterFlag,
  firstFighterCountry,
  secondFighterCountry,
  firstFighterRecord,
  secondFighterRecord,
  firstFighterClass,
  secondFighterClass,
  firstFighterReach,
  secondFighterReach,
  firstFighterIsWinner,
  secondFighterIsWinner,
  secondFighterIsChampion,
  firstFighterIsChampion,
  gameStatusDescription,
  venueImage,
  venueName,
  venueLocation,
  venueAddress,
  venueCapacity,
  venueAttendance,
  weather,
}: GamePreviewContentProps) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      <MatchupComparison
        firstFighterId={firstFighterId}
        secondFighterId={secondFighterId}
        firstFighterStance={firstFighterStance}
        secondFighterStance={secondFighterStance}
        firstFighterHeight={firstFighterHeight}
        firstFighterAge={firstFighterAge}
        secondFighterAge={secondFighterAge}
        secondFighterHeight={secondFighterHeight}
        firstFighterWeight={firstFighterWeight}
        secondFighterWeight={secondFighterWeight}
        firstFighterName={firstFighterName}
        secondFighterName={secondFighterName}
        firstFighterFlag={firstFighterFlag}
        secondFighterFlag={secondFighterFlag}
        firstFighterCountry={firstFighterCountry}
        secondFighterCountry={secondFighterCountry}
        firstFighterRecord={firstFighterRecord}
        secondFighterRecord={secondFighterRecord}
        firstFighterClass={firstFighterClass}
        secondFighterClass={secondFighterClass}
        firstFighterReach={firstFighterReach}
        secondFighterReach={secondFighterReach}
        firstFighterIsWinner={firstFighterIsWinner}
        secondFighterIsWinner={secondFighterIsWinner}
        secondFighterIsChampion={secondFighterIsChampion}
        firstFighterIsChampion={firstFighterIsChampion}
        gameStatusDescription={gameStatusDescription}
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
    </BottomSheetScrollView>
  );
}
