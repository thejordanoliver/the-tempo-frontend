import useRoster from "@/hooks/LeagueHooks/useRoster";
import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";

type LastPlayType = {
  id?: string;
  text: string;
  teamId?: string;
  homeWinPercentage?: number;
  athletes?: {
    id?: string;
    name?: string;
    headshot?: string;
    position?: string;
    jersey?: string;
    teamId?: string;
  }[];
  scoringPlay: boolean;
  period: { number: number; displayValue: string };
  homeScore: number;
  awayScore: number;
  clock: { displayValue: string };
  team: { id: string };
  participants?: {
    athlete: {
      id: string;
      name?: string;
      headshot?: string;
      position?: string;
      jersey?: string;
    };
    teamId?: string;
  }[];
};

type LastPlayProps = {
  lastPlay?: string | LastPlayType;
  homeTeamId: number;
  awayTeamId: number;
  state: string | undefined;
  league: string;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/40?text=👤";

export default function LastPlay({
  lastPlay,
  homeTeamId,
  awayTeamId,
  state,
  league,
}: LastPlayProps) {
  const [currentPlay, setCurrentPlay] = useState(lastPlay);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = lastPlayStyles(isDark);

  useEffect(() => {
    setCurrentPlay(lastPlay);
  }, [lastPlay]);

  const homePlayersResult = useRoster(homeTeamId, league);
  const awayPlayersResult = useRoster(awayTeamId, league);

  const homePlayers = homePlayersResult.players || [];
  const awayPlayers = awayPlayersResult.players || [];

  const getPlayerAvatar = (espnId?: string, fallbackUrl?: string): string => {
    if (!espnId) return fallbackUrl || DEFAULT_HEADSHOT;
    const player =
      homePlayers.find((p) => String(p.espn_id) === String(espnId)) ||
      awayPlayers.find((p) => String(p.espn_id) === String(espnId));
    return player?.headshot_url || fallbackUrl || DEFAULT_HEADSHOT;
  };

  const participantsToAthletes = (participants?: any[]) => {
    if (!participants || !participants.length) return [];
    return participants.map((p) => ({
      id: p.athlete?.id,
      name: p.athlete?.name || "",
      headshot: p.athlete?.headshot || "",
      position: p.athlete?.position || "",
      jersey: p.athlete?.jersey || "",
      teamId: p.teamId || "",
    }));
  };

  const isObject = (val: unknown): val is Record<string, any> =>
    typeof val === "object" && val !== null;

  const athletes =
    isObject(currentPlay) && "participants" in currentPlay
      ? participantsToAthletes((currentPlay as any).participants)
      : isObject(currentPlay)
        ? (currentPlay as LastPlayType).athletes || []
        : [];

  const firstAthlete = athletes[0];

  const getTextColor = (currentPlay: LastPlayType, text?: string) => {
    const defaultColor = isDark ? Colors.white : Colors.black;
    if (!text) return defaultColor;
    const lower = text.toLowerCase();
    if (currentPlay.scoringPlay === true)
      return isDark ? Colors.dark.limeGreen : Colors.light.green;
    if (lower.includes("foul"))
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    if (lower.includes("violation"))
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    if (lower.includes("missed") || lower.includes("misses"))
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    if (lower.includes("turnover"))
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    return defaultColor;
  };

  const getIcon = (currentPlay: LastPlayType) => {
    if (currentPlay.text.includes("timeout"))
      return (
        <Ionicons
          name="time-outline"
          color={isDark ? Colors.white : Colors.black}
          size={20}
          style={{ marginRight: 4 }}
        />
      );
  };

  if (state !== "in" || !currentPlay) return null;

  if (typeof currentPlay === "string") {
    return (
      <View style={styles.simpleContainer}>
        <Text style={styles.simpleText}>{currentPlay}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Last Play</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.row}>
          {firstAthlete && (
            <Image
              source={{
                uri: getPlayerAvatar(firstAthlete.id, firstAthlete.headshot),
              }}
              style={styles.avatar}
            />
          )}
          {getIcon(currentPlay)}
          <Text
            style={[
              styles.playText,
              { color: getTextColor(currentPlay, currentPlay.text) },
              athletes.length ? styles.playTextWithAthletes : null,
            ]}
          >
            {currentPlay.text}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.subText}>
            {currentPlay.clock.displayValue} {currentPlay.period.displayValue}
          </Text>
          <Text style={styles.subText}>
            {currentPlay.awayScore} - {currentPlay.homeScore}
          </Text>
        </View>
      </View>
    </View>
  );
}
