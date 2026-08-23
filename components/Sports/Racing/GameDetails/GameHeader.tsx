import HeadingTwo from "@/components/Headings/HeadingTwo";
import { RacingEvent } from "@/types/racing/racing";
import { FlatList, View } from "react-native";
import { DriverHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { DriverRow } from "./DriverRow";
type RacingDriver = NonNullable<RacingEvent["drivers"]>[number];
type RacingStatistics = RacingDriver["statistics"];

function getStatisticValue(
  statistics: RacingStatistics | null | undefined,
  statisticName: string,
): string {
  const statistic = statistics?.find(
    (currentStatistic) => currentStatistic.name === statisticName,
  );

  return String(statistic?.displayValue) ?? "-";
}

function normalizeDriverId(value: RacingDriver["id"]): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const numericId = typeof value === "number" ? value : Number(value);

  return Number.isFinite(numericId) ? numericId : undefined;
}

type Props = {
  drivers: RacingDriver[];
  gameStatusDescription: string;
  isDark: boolean;
};

export default function GameHeader({
  drivers,
  gameStatusDescription,
  isDark,
}: Props) {
  const styles = DriverHeaderStyles(isDark);

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Drivers</HeadingTwo>
      <FlatList
        data={drivers}
        keyExtractor={(item, index) => String(item.id ?? `driver-${index}`)}
        renderItem={({ item }) => {
          const rank = getStatisticValue(item.statistics, "place");
          const time = getStatisticValue(item.statistics, "totalTime");
          const lapsCompleted = getStatisticValue(
            item.statistics,
            "lapsCompleted",
          );

          return (
            <DriverRow
              id={normalizeDriverId(item.id)}
              headshot={item.headshot ?? undefined}
              name={item.fullName ?? "Unknown Driver"}
              flag={item.flag ?? undefined}
              rank={rank}
              laps={lapsCompleted}
              time={time}
              isDark={isDark}
              isWinner={item.winner}
              gameStatusDescription={gameStatusDescription}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
