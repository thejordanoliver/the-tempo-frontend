import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Styles";
import { getTeamByESPNId } from "constants/teams";
import useDbPlayersByTeam from "hooks/NBAHooks/usePlayersByTeam";
import { useEffect, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";
type NBALastPlay = {
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

  const homePlayersResult = useDbPlayersByTeam(homeTeamId || "");
  const awayPlayersResult = useDbPlayersByTeam(awayTeamId || "");

  const homePlayers = homePlayersResult.players || [];
  const awayPlayers = awayPlayersResult.players || [];

  const getPlayerAvatar = (espnId?: string, fallbackUrl?: string): string => {
    if (!espnId) return fallbackUrl || DEFAULT_HEADSHOT;
    const dbPlayer =
      homePlayers.find((p) => String(p.espn_id) === String(espnId)) ||
      awayPlayers.find((p) => String(p.espn_id) === String(espnId));
    return dbPlayer?.avatarUrl || fallbackUrl || DEFAULT_HEADSHOT;
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

  const athletes =
    "participants" in (currentPlay as any)
      ? participantsToAthletes((currentPlay as any).participants)
      : (currentPlay as NBALastPlay).athletes || [];

  const firstAthlete = athletes[0];

  const getTextColor = (currentPlay: NBALastPlay, text?: string) => {
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

  const getIcon = (currentPlay: NBALastPlay) => {
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
  // Determine team color safely
  let teamColor = Colors.light.green; // default

  if (typeof currentPlay !== "string" && currentPlay?.team?.id) {
    const team = getTeamByESPNId(currentPlay.team.id);
    teamColor = isDark
      ? team?.secondaryColor || Colors.light.green
      : team?.color || Colors.light.green;
  }

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
