import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import React from "react";
import { View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";

export default function GamePreviewContent({
  venueImage,
  venueName,
  venueCity,
  venueAddress,
  venueCapacity,
  venueAttendance,
  venueSurface,
  weather,
  isChampionship,
}: any) {
  const styles = gamePreviewModalStyle(isChampionship);

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainerStyle}
    >
      <View style={styles.bottomSheetScrollViewWrapper}>
        <GameLocation
          venueImage={venueImage}
          venueName={venueName}
          location={venueCity}
          address={venueAddress}
          venueCapacity={venueCapacity}
          venueAttendance={venueAttendance}
          grass={venueSurface}
          weather={weather}
          loading={false}
          error={null}
          isDark
        />
      </View>
    </BottomSheetScrollView>
  );
}
