import {
  Athlete,
  TeamInjury,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import { Image, StyleSheet, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";

type Injury = TeamInjury["injuries"][number];

type Props = {
  injury: Injury;
  player?: Athlete;
  isLast: boolean;
  isDark: boolean;
};

const formatReturnDate = (
  value: string | number | Date | null | undefined,
): string | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
};

export default function InjuryRow({ injury, player, isLast, isDark }: Props) {
  const styles = teamInjuryStyles(isDark);

  const headshot = player?.headshot;
  const playerName = player?.shortName;
  const position = player?.position?.trim() || null;
  const jerseyNumber = player?.jersey;
  const playerMeta = `${position} #${jerseyNumber}`;
  const returnDate = formatReturnDate(injury.details?.returnDate);

  return (
    <View
      style={[
        styles.injuryItem,
        {
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.avatarWrapper}>
        {headshot && (
          <Image
            source={{ uri: headshot }}
            style={styles.avatar}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.playerHeader}>
          <Text style={styles.name}>{playerName}</Text>

          <Text style={styles.jersey}>{playerMeta}</Text>
        </View>

        {injury.details?.detail ? (
          <Text style={styles.details}>{injury.details.detail}</Text>
        ) : null}

        <Text style={styles.status}>
          {injury.status || "Status unavailable"}
        </Text>
      </View>

      {returnDate ? (
        <View>
          <Text style={styles.status}>Return: {returnDate}</Text>
        </View>
      ) : null}
    </View>
  );
}
