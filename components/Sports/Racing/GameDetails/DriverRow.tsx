import type { DriverHeaderStyles } from "@/styles/GameDetailStyles/DriverHeaderStyles";
import placeholderImage from "assets/Placeholders/playerPlaceholder.png";
import type { globalStyles } from "constants/styles";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { RacingDriver, RacingLeague } from "types/racing/racing";

type Props = {
  driver: RacingDriver;
  league: RacingLeague;
  position: string | null;
  laps: string | null;
  time: string | null;
  showLaps: boolean;
  showTime: boolean;
  compact: boolean;
  isWinner: boolean;
  styles: ReturnType<typeof DriverHeaderStyles>;
  global: ReturnType<typeof globalStyles>;
};

export function DriverRow({
  driver,
  league,
  position,
  laps,
  time,
  showLaps,
  showTime,
  compact,
  isWinner,
  styles,
  global,
}: Props) {
  const router = useScopedRouter();
  const [failedHeadshot, setFailedHeadshot] = useState<string | null>(null);
  const [failedFlag, setFailedFlag] = useState<string | null>(null);
  const name =
    driver.fullName ||
    driver.displayName ||
    driver.name ||
    driver.shortName ||
    "Unknown driver";
  const metadata = [driver.team, driver.country].filter(Boolean).join(" · ");
  const hasFlag = !!driver.flag && failedFlag !== driver.flag;
  const id = Number(driver.id);
  const canOpenProfile = Number.isSafeInteger(id) && id > 0;

  const profile = (
    <>
      <Image
        source={
          driver.headshot && failedHeadshot !== driver.headshot
            ? { uri: driver.headshot }
            : placeholderImage
        }
        onError={() => setFailedHeadshot(driver.headshot)}
        resizeMode="cover"
        style={styles.headshot}
      />
      <View style={styles.driverInfo}>
        <Text style={[global.textMedium, styles.name]}>{name}</Text>
        {(!!metadata || hasFlag) && (
          <View style={styles.metadata}>
            {hasFlag && (
              <Image
                source={{ uri: driver.flag ?? undefined }}
                onError={() => setFailedFlag(driver.flag)}
                resizeMode="contain"
                style={styles.flag}
              />
            )}
            {!!metadata && (
              <Text style={[global.caption, styles.metadataText]}>
                {metadata}
              </Text>
            )}
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.line, styles.row, isWinner && styles.winner]}>
      <View style={styles.position}>
        <Text
          accessibilityLabel={
            isWinner
              ? "Winner"
              : position
                ? `Position ${position}`
                : "Position unavailable"
          }
          style={[
            global.subtitle,
            styles.positionNumber,
            isWinner && styles.winnerPosition,
          ]}
        >
          {position ?? "—"}
        </Text>
      </View>
      <View style={styles.identity}>
        {canOpenProfile ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${name} driver profile`}
            onPress={() =>
              router.push({
                pathname: "/player/racing/[id]",
                params: { id, league },
              })
            }
            style={({ pressed }) => [styles.profile, pressed && global.pressed]}
          >
            {profile}
          </Pressable>
        ) : (
          <View style={styles.profile}>{profile}</View>
        )}
        {compact && (laps !== null || time !== null) && (
          <View style={styles.inlineStats}>
            {laps !== null && (
              <Text style={global.secondaryText}>Laps {laps}</Text>
            )}
            {time !== null && (
              <Text style={global.secondaryText}>Time {time}</Text>
            )}
          </View>
        )}
      </View>
      {!compact && showLaps && (
        <Text
          accessibilityLabel={
            laps === null ? "Laps unavailable" : `Laps ${laps}`
          }
          style={[global.secondaryText, styles.laps]}
        >
          {laps ?? "—"}
        </Text>
      )}
      {!compact && showTime && (
        <Text
          accessibilityLabel={
            time === null ? "Time unavailable" : `Time ${time}`
          }
          style={[global.secondaryText, styles.time]}
        >
          {time ?? "—"}
        </Text>
      )}
    </View>
  );
}
