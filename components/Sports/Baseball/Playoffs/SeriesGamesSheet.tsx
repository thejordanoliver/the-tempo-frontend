import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Colors } from "constants/styles";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { MLBPlayoffBracketStyles } from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffSeries } from "types/baseball/baseball";
import BaseballGameCard from "../Games/BaseballGameCard";

type Props = {
  series: MLBPlayoffSeries | null;
  isDark: boolean;
  onClose: () => void;
};

export function SeriesGamesSheet({ series, isDark, onClose }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const styles = MLBPlayoffBracketStyles(isDark);
  const seriesId = series?.id;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (seriesId) sheetRef.current?.present();
      else sheetRef.current?.dismiss();
    });
    return () => cancelAnimationFrame(frame);
  }, [seriesId]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["70%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={{ backgroundColor: Colors.midTone }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetScrollView contentContainerStyle={styles.seriesGames}>
        <Text style={styles.leagueTitle}>{series?.label}</Text>
        {series?.games.map((game) => (
          <View key={game.id} style={styles.seriesGame}>
            <Text style={styles.seriesLabel}>
              {game.series.gameNumber ? `Game ${game.series.gameNumber} · ` : ""}
              Best of {series.bestOf}
            </Text>
            <BaseballGameCard game={game} isMLB onNavigate={() => sheetRef.current?.dismiss()} />
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
