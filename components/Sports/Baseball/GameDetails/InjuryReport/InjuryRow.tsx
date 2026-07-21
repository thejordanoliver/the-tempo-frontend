import {
  Athlete,
  FootballInjury,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import { Image, StyleSheet, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";

type Props = {
  injury: FootballInjury;
  player: Athlete;
  isLast: boolean;
  isDark: boolean;
};

const getHeadshotUrl = (
  headshot: Athlete["headshot"],
): string | null => {
  if (!headshot) {
    return null;
  }

  if (typeof headshot === "string") {
    return headshot;
  }

  return headshot.href ?? null;
};

const formatReturnDate = (
  value: string | number | Date | null | undefined,
): string | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString();
};

export default function InjuryRow({
  injury,
  player,
  isLast,
  isDark,
}: Props) {
  const styles = teamInjuryStyles(isDark);

  const headshotUrl = getHeadshotUrl(player.headshot);

  const playerName =
    player.shortName ??
    player.fullName ??
    player.displayName ??
    "Unknown Player";

  const playerDetails = [
    player.position,
    player.jersey ? `#${player.jersey}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const returnDate = formatReturnDate(
    injury.details?.returnDate,
  );

  return (
    <View
      style={[
        styles.injuryItem,
        {
          borderBottomWidth: isLast
            ? 0
            : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.avatarWrapper}>
        {headshotUrl ? (
          <Image
            source={{ uri: headshotUrl }}
            style={styles.avatar}
          />
        ) : null}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.playerHeader}>
          <Text style={styles.name}>
            {playerName}
          </Text>

          {playerDetails ? (
            <Text style={styles.jersey}>
              {playerDetails}
            </Text>
          ) : null}
        </View>

        {injury.details?.detail ? (
          <Text style={styles.details}>
            {injury.details.detail}
          </Text>
        ) : null}

        <Text style={styles.status}>
          {injury.status || "Status unavailable"}
        </Text>
      </View>

      {returnDate ? (
        <View>
          <Text style={styles.status}>
            Return: {returnDate}
          </Text>
        </View>
      ) : null}
    </View>
  );
}