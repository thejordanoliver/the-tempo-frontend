import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LineScore from "components/Sports/NBA/GameDetails/LineScore";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import MLBInjuries from "../GameDetails/MLBInjuries";

export default function GamePreviewContent({
  home,
  away,
  homeChance,
  awayChance,
  lineScore,
  homeLastGames,
  awayLastGames,
  teamPlayersMap,
  officials,
  injuries,
  detailsLoading,
  detailsError,
  resolvedVenueImage,
  resolvedVenueName,
  resolvedVenueCity,
  resolvedVenueAddress,
  resolvedVenueCapacity,
  highlights,
  weather,
  gameStatusDescription,
  isChampionship,
  isDark,
}: any) {
  const styles = gamePreviewModalStyle(isChampionship);

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainerStyle}
    >
      <View style={styles.bottomSheetScrollViewWrapper}>
        {gameStatusDescription != "Scheduled" && (
          <LineScore
            linescore={lineScore}
            homeCode={home?.code}
            awayCode={away?.code}
            league="MLB"
            isDark
          />
        )}

        {homeChance != 0 &&
          awayChance != 0 &&
          gameStatusDescription === "Scheduled" && (
            <MatchupPredictor
              away={{
                name: away?.code,
                logo: away.logoLight || away.logo,
                color: away?.color,
                chance: awayChance,
              }}
              home={{
                name: home?.code,
                logo: home.logoLight || home.logo,
                color: home?.color,
                chance: homeChance,
              }}
              size={180}
              isDark
            />
          )}

        <HighlightVideoList highlights={highlights} isDark />

        <MLBInjuries
          injuries={injuries}
          loading={detailsLoading}
          isDark
          teamPlayersMap={teamPlayersMap}
        />

        <Officials
          officials={officials ?? []}
          loading={false}
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
      </View>
    </BottomSheetScrollView>
  );
}
