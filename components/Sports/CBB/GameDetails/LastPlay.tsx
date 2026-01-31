import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Styles";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Text, View, useColorScheme } from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";

type PlayerAvatarSource = {
  espnId?: string | number;
  avatar?: string | null;
};

type NBALastPlay = {
  id?: string;
  text: string;
  scoringPlay: boolean;
  period: { number: number; displayValue: string };
  homeScore: number;
  awayScore: number;
  clock: { displayValue: string };
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
  lastPlay?: string | NBALastPlay;
  homeTeamId?: string;
  awayTeamId?: string;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/40?text=👤";

export default function LastPlay({
  lastPlay,
  homeTeamId,
  awayTeamId,
}: LastPlayProps) {
  const [currentPlay, setCurrentPlay] = useState(lastPlay);
  const [containerWidth, setContainerWidth] = useState(0);

  const isDark = useColorScheme() === "dark";
  const styles = lastPlayStyles(isDark);

  const onLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  useEffect(() => {
    setCurrentPlay(lastPlay);
  }, [lastPlay]);

  /**
   * 🔒 CBB player hooks
   */
  const homeResult = usePlayersByTeam(homeTeamId || "");
  const awayResult = usePlayersByTeam(awayTeamId || "");

  /**
   * ✅ Normalize CBB players
   */
  const homePlayers: PlayerAvatarSource[] = (homeResult.players ?? []).map(
    (p) => ({
      espnId: p.id,
      avatar: p.imageUrl ?? null,
    })
  );

  const awayPlayers: PlayerAvatarSource[] = (awayResult.players ?? []).map(
    (p) => ({
      espnId: p.id,
      avatar: p.imageUrl ?? null,
    })
  );

  /**
   * 🧠 Unified avatar lookup
   */
  const getPlayerAvatar = (
    espnId?: string | number,
    fallbackUrl?: string
  ): string => {
    if (!espnId) return fallbackUrl || DEFAULT_HEADSHOT;

    const player =
      homePlayers.find((p) => String(p.espnId) === String(espnId)) ||
      awayPlayers.find((p) => String(p.espnId) === String(espnId));

    return player?.avatar || fallbackUrl || DEFAULT_HEADSHOT;
  };

  const participantsToAthletes = (participants?: any[]) => {
    if (!participants?.length) return [];
    return participants.map((p) => ({
      id: p.athlete?.id,
      name: p.athlete?.name || "",
      headshot: p.athlete?.headshot || "",
      position: p.athlete?.position || "",
      jersey: p.athlete?.jersey || "",
      teamId: p.teamId || "",
    }));
  };

  const athletes =
    typeof currentPlay === "object" && "participants" in currentPlay
      ? participantsToAthletes(currentPlay.participants)
      : [];

  const firstAthlete = athletes[0];

  const getTextColor = (play: NBALastPlay, text?: string) => {
    const defaultColor = isDark ? Colors.white : Colors.black;
    if (!text) return defaultColor;

    const lower = text.toLowerCase();

    if (play.scoringPlay)
      return isDark ? Colors.dark.limeGreen : Colors.light.green;

    if (
      lower.includes("foul") ||
      lower.includes("violation") ||
      lower.includes("missed") ||
      lower.includes("misses") ||
      lower.includes("turnover")
    ) {
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    }

    return defaultColor;
  };

  const getIcon = (play: NBALastPlay) => {
    if (play.text.toLowerCase().includes("timeout")) {
      return (
        <Ionicons
          name="time-outline"
          color={isDark ? Colors.white : Colors.black}
          size={20}
          style={{ marginRight: 4 }}
        />
      );
    }
    return null;
  };

  if (!currentPlay) return null;

  if (typeof currentPlay === "string") {
    return (
      <View style={styles.simpleContainer} onLayout={onLayout}>
        <Text style={styles.simpleText}>{currentPlay}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <HeadingTwo>Last Play</HeadingTwo>

      <View style={styles.wrapper}>
        <View style={styles.row}>
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
