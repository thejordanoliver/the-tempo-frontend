import { DriverHeaderStyles } from "@/styles/GameDetailStyles/DriverHeaderStyles";
import { globalStyles } from "constants/styles";
import { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import type { RacingDriver, RacingEvent } from "types/racing/racing";
import { RACING_LEAGUE_CONFIG } from "utils/customheader/racingConfig";
import { DriverRow } from "./DriverRow";

function getStatistic(driver: RacingDriver, name: string) {
  const stat = driver.statistics?.find((entry) => entry.name === name);
  const value = stat?.displayValue ?? stat?.value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

type Props = {
  drivers: RacingDriver[];
  league: RacingEvent["league"];
  status: RacingEvent["status"];
  sessionName?: string | null;
  isDark: boolean;
};

export default function DriversHeader({
  drivers,
  league,
  status,
  sessionName,
  isDark,
}: Props) {
  const styles = useMemo(() => DriverHeaderStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const { width, fontScale } = useWindowDimensions();
  const compact = width / fontScale < 350;
  const series = RACING_LEAGUE_CONFIG[league];

  const isLive = status?.state === "in";
  const isFinal = status?.state === "post";
  const title = isLive ? "Running order" : isFinal ? "Results" : "Drivers";
  const statusLabel = isLive ? "Live" : status?.description;
  const rows = drivers.map((driver) => ({
    driver,
    position:
      driver.position && driver.position > 0
        ? String(driver.position)
        : getStatistic(driver, "place"),
    laps: getStatistic(driver, "lapsCompleted"),
    time: getStatistic(driver, "totalTime"),
  }));
  const showLaps = rows.some(({ laps }) => laps !== null);
  const showTime = rows.some(({ time }) => time !== null);

  return (
    <View style={styles.section}>
      <View style={styles.panel}>
        <View style={[styles.header]}>
          <View style={styles.headerTitle}>
            <Text style={global.label}>{series.label}</Text>
            <Text accessibilityRole="header" style={global.heading}>
              {title}
            </Text>
            {!!sessionName && (
              <Text style={global.secondaryText}>{sessionName}</Text>
            )}
          </View>
          {!!statusLabel && (
            <View style={styles.status}>
              {isLive && <View style={styles.statusDot} />}
              <Text style={[styles.statusText, isFinal?  styles.finalText: null]}>{statusLabel}</Text>
            </View>
          )}
        </View>

        {rows.length > 0 ? (
          <>
            <View style={[styles.line, styles.columnHeader]}>
              <View style={styles.position}>
                <Text style={global.label}>Pos</Text>
              </View>
              <Text style={[global.label, styles.identity]}>Driver</Text>
              {!compact && showLaps && (
                <Text style={[global.label, styles.laps]}>Laps</Text>
              )}
              {!compact && showTime && (
                <Text style={[global.label, styles.time]}>Time</Text>
              )}
            </View>
            {rows.map(({ driver, position, laps, time }, index) => (
              <DriverRow
                key={driver.id ?? driver.uid ?? index}
                driver={driver}
                league={league}
                position={position}
                laps={laps}
                time={time}
                showLaps={showLaps}
                showTime={showTime}
                compact={compact}
                isWinner={!!isFinal && driver.winner}
                styles={styles}
                global={global}
              />
            ))}
          </>
        ) : (
          <Text style={[global.emptyText, styles.empty]}>
            {isFinal ? "No results available" : "No drivers available"}
          </Text>
        )}
      </View>
    </View>
  );
}
