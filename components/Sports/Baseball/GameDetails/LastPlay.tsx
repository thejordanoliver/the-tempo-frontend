import type {
  BaseballPlay,
  BaseballPlayParticipant,
} from "@/hooks/BaseballHooks/useBaseballGameDetails";
import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image, Text, View } from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";

type LastPlayProps = {
  lastPlay?: BaseballPlay | null;
  homeId?: number;
  awayId?: number;
  state?: string | null;
  league?: string;
};

type LastPlayAthlete = {
  id?: string;
  name?: string;
  headshot?: string;
  position?: string;
  jersey?: string;
  teamId?: string;
};

const DEFAULT_HEADSHOT =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781892365/playerPlaceholder_vi9zk3.png";

const normalizeValue = (
  value: string | number | null | undefined,
): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return String(value);
};

const participantsToAthletes = (
  participants?: BaseballPlayParticipant[],
): LastPlayAthlete[] => {
  if (!participants?.length) {
    return [];
  }

  return participants
    .filter((participant) => participant?.athlete)
    .map((participant) => {
      const athlete = participant.athlete;
      const fullName = [athlete.firstName, athlete.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        id: normalizeValue(athlete.id),
        name:
          (athlete.shortName ??
            athlete.displayName ??
            athlete.fullName ??
            fullName) ||
          undefined,
        headshot: normalizeValue(athlete.headshot),
        position: normalizeValue(athlete.position),
        jersey: normalizeValue(athlete.jersey),
        teamId: normalizeValue(participant.teamId),
      };
    });
};

export default function LastPlay({ lastPlay, state }: LastPlayProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = lastPlayStyles(isDark);

  if (!lastPlay || state === "pre" || state === "post") {
    return null;
  }

  const athletes = Array.isArray(lastPlay.participants)
    ? participantsToAthletes(lastPlay.participants)
    : [];

  const firstAthlete = athletes[0];

  const getTextColor = (play: BaseballPlay, text?: string | null): string => {
    const defaultColor = isDark ? Colors.white : Colors.black;

    if (!text) {
      return defaultColor;
    }

    if (play.scoringPlay) {
      return isDark ? Colors.dark.limeGreen : Colors.light.green;
    }

    const lowerText = text.toLowerCase();

    const isNegativePlay =
      lowerText.includes("strikeout") || lowerText.includes("strike");

    if (isNegativePlay) {
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    }

    return defaultColor;
  };

  const getIcon = (play: BaseballPlay) => {
    const isTimeout = play.text?.toLowerCase().includes("timeout");

    if (!isTimeout) {
      return null;
    }

    return (
      <Ionicons
        name="time-outline"
        color={isDark ? Colors.white : Colors.black}
        size={20}
        style={{ marginRight: 4 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Last Play</HeadingTwo>

      <View style={styles.wrapper}>
        <View style={styles.row}>
          {firstAthlete && (
            <Image
              source={{
                uri: firstAthlete.headshot || DEFAULT_HEADSHOT,
              }}
              style={styles.headhshot}
            />
          )}

          {getIcon(lastPlay)}

          <Text
            style={[
              styles.playText,
              {
                color: getTextColor(lastPlay, lastPlay?.text),
              },
              athletes.length > 0 ? styles.playTextWithAthletes : undefined,
            ]}
          >
            {lastPlay?.text}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.subText}>{lastPlay?.period?.displayValue}</Text>

          <Text style={styles.subText}>
            {lastPlay?.awayScore} - {lastPlay?.homeScore}
          </Text>
        </View>
      </View>
    </View>
  );
}
