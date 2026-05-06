import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";

export default function GamePreviewContent({
  resolvedVenueImage,
  resolvedVenueName,
  resolvedVenueCity,
  resolvedVenueAddress,
  resolvedVenueCapacity,
  highlights,
  weather,
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
        <HighlightVideoList highlights={highlights} isDark />

        <GameLocation
          venueImage={resolvedVenueImage}
          venueName={resolvedVenueName}
          location={resolvedVenueCity}
          address={resolvedVenueAddress}
          venueCapacity={resolvedVenueCapacity}
          venueAttendance={undefined}
          weather={weather}
          isDark
        />
      </View>
    </BottomSheetScrollView>
  );
}
