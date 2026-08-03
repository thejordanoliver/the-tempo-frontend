import { Play } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image, Text, View } from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";

type LastPlayProps = {
  lastPlay?: Play;
  homeId: number;
  awayId: number;
  state: string | null;
  league: string;
};

type LastPlayAthlete = {
  id?: string;
  name?: string;
  headshot?: string;
  position?: string;
  jersey?: string;
  teamId?: string;
};

type PlayParticipant = {
  athlete?: {
    id?: string | number | null;
    name?: string | null;
    headshot?: string | null;
    position?: string | null;
    jersey?: string | number | null;
  } | null;
  teamId?: string | number | null;
};

type StructuredPlay = Exclude<Play, string>;

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
  participants?: PlayParticipant[],
): LastPlayAthlete[] => {
  if (!participants?.length) {
    return [];
  }

  return participants
    .filter((participant) => participant?.athlete)
    .map((participant) => ({
      id: normalizeValue(participant.athlete?.id),
      name: normalizeValue(participant.athlete?.name),
      headshot: normalizeValue(participant.athlete?.headshot),
      position: normalizeValue(participant.athlete?.position),
      jersey: normalizeValue(participant.athlete?.jersey),
      teamId: normalizeValue(participant.teamId),
    }));
};

export default function LastPlay({ lastPlay, state }: LastPlayProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = lastPlayStyles(isDark);

  if (!lastPlay || state === "pre" || !lastPlay || state === "post") {
    return null;
  }

  if (typeof lastPlay === "string") {
    return (
      <View style={styles.simpleContainer}>
        <Text style={styles.simpleText}>{lastPlay}</Text>
      </View>
    );
  }

  const athletes = Array.isArray(lastPlay.participants)
    ? participantsToAthletes(lastPlay.participants)
    : [];

  const firstAthlete = athletes[0];

  const getTextColor = (play: StructuredPlay, text?: string): string => {
    const defaultColor = isDark ? Colors.white : Colors.black;

    if (!text) {
      return defaultColor;
    }

    if (play.scoringPlay) {
      return isDark ? Colors.dark.limeGreen : Colors.light.green;
    }

    const lowerText = text.toLowerCase();

    const isNegativePlay =
      lowerText.includes("foul") ||
      lowerText.includes("violation") ||
      lowerText.includes("missed") ||
      lowerText.includes("misses") ||
      lowerText.includes("turnover");

    if (isNegativePlay) {
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    }

    return defaultColor;
  };

  const getIcon = (play: StructuredPlay) => {
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
          <Text style={styles.subText}>
            {lastPlay?.period?.displayValue} {lastPlay?.clock?.displayValue}
          </Text>

          <Text style={styles.subText}>
            {lastPlay?.awayScore} - {lastPlay?.homeScore}
          </Text>
        </View>
      </View>
    </View>
  );
}
