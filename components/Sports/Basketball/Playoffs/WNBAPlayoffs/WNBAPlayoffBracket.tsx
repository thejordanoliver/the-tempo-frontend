import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import Button from "components/Buttons/Button";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useWNBAPlayoffs } from "hooks/BasketballHooks/useWNBAPlayoffs";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import {
  getWNBARoundX,
  WNBAPlayoffBracketStyles,
} from "styles/PlayoffStyles/WNBAPlayoffBracketStyles";
import type { WNBAPlayoffSeries } from "types/basketball/wnbaPlayoffs";
import BracketConnectors from "./BracketConnectors";
import SeriesCard from "./SeriesCard";

type Props = { season: number; active?: boolean };

function getSeriesGame(series: WNBAPlayoffSeries) {
  return (
    series.games.find((game) => game.status.state === "in") ??
    series.games.find((game) => game.status.state === "pre") ??
    series.games[series.games.length - 1]
  );
}

export default function WNBAPlayoffBracket({ season, active = true }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = WNBAPlayoffBracketStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const router = useScopedRouter();
  const { data, loading, error, refresh } = useWNBAPlayoffs(season, {
    enabled: active,
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const openSeries = (series: WNBAPlayoffSeries) => {
    const game = getSeriesGame(series);
    if (!game) return;

    router.push({
      pathname: "/game/[sport]/[game]",
      params: {
        sport: "basketball",
        game: String(game.id),
        league: "wnba",
        leagueId: "wnba",
        data: encodeURIComponent(JSON.stringify(game)),
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.text}
        />
      }
    >
      {loading && !data && (
        <View style={global.emptyContainer}>
          <CustomActivityIndicator />
        </View>
      )}

      {error && (
        <View style={styles.heading}>
          <Text style={global.errorText}>{error}</Text>
          <Button
            isDark={isDark}
            onPress={() => {
              void refresh();
            }}
          >
            Try again
          </Button>
        </View>
      )}

      {data?.count === 0 && (
        <Text style={[global.emptyText, styles.heading]}>
          The playoff bracket will appear once postseason matchups are
          announced.
        </Text>
      )}

      {data && data.count > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.canvas}>
            <BracketConnectors color={colors.icon} isDark={isDark} />
            {data.rounds.map((round, roundIndex) => (
              <View key={round.id}>
                <Text
                  style={[
                    styles.roundTitle,
                    { left: getWNBARoundX(roundIndex), color: colors.text },
                  ]}
                >
                  {round.label}
                </Text>
                {round.series.map((series, seriesIndex) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    roundIndex={roundIndex}
                    seriesIndex={seriesIndex}
                    roundLabel={round.label}
                    isFinals={round.id === "finals"}
                    isDark={isDark}
                    onPress={openSeries}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScrollView>
  );
}
