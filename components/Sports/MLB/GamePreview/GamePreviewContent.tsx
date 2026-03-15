import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
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
            lighter={true}
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
              lighter
            />
          )}

        <LastFiveGames
          away={{
            teamId: away?.id,
            teamCode: away?.code,
            games: awayLastGames?.games,
          }}
          home={{
            teamId: home?.id,
            teamCode: home?.code,
            games: homeLastGames?.games,
          }}
          league="MLB"
          isDark={isDark}
          lighter
        />

        <HighlightVideoList highlights={highlights} lighter />

        <MLBInjuries
          injuries={injuries}
          loading={detailsLoading}
          error={detailsError}
          awayTeam={away?.code}
          homeTeam={home?.code}
          lighter
        />

        <Officials
          officials={officials ?? []}
          loading={false}
          error={null}
          lighter
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
          lighter
        />
      </View>
    </BottomSheetScrollView>
  );
}
