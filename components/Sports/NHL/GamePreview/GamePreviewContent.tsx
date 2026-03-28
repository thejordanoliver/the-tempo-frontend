import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameSummary from "components/Sports/NHL/GameDetails/GameSummary";
import React from "react";
import NHLInjuries from "../GameDetails/NHLInjuries";
import ShotChart from "../GameDetails/ShotChart";

export default function GamePreviewContent({
  game,
  home,
  away,
  homeChance,
  awayChance,
  lineScore,
  homeLastGames,
  awayLastGames,
  highlights,
  plays,
  officials,
  injuries,
  teamPlayersMap,
  detailsLoading,
  detailsError,
  resolvedVenueImage,
  resolvedVenueName,
  resolvedVenueCity,
  resolvedVenueAddress,
  resolvedVenueCapacity,
  weather,
  isDark,
  gameStatusDescription,
}: any) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={home.code}
          awayCode={away.code}
          league="NHL"
          isDark
        />
      )}

      {!plays && (
        <ShotChart
          plays={plays}
          homeTeamId={String(home.espnID)}
          awayTeamId={String(away.espnID)}
          isDark
        />
      )}

      <GameSummary plays={plays ?? []} isDark />

      <HighlightVideoList highlights={highlights} isDark />

      <NHLInjuries
        injuries={injuries}
        loading={detailsLoading}
        error={null}
        awayTeamId={String(away.espnID)}
        homeTeamId={String(home.espnID)}
        isDark
      />

      <Officials
        officials={officials ?? []}
        loading={detailsLoading}
        error={null}
        isDark
      />
      <GameLocation
        venueImage={resolvedVenueImage}
        venueName={resolvedVenueName}
        location={resolvedVenueCity}
        address={resolvedVenueAddress}
        venueCapacity={resolvedVenueCapacity}
        venueAttendance={undefined}
        weather={weather}
        loading={false}
        error={null}
        isDark
      />
    </BottomSheetScrollView>
  );
}
