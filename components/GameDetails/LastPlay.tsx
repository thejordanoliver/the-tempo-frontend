import HeadingTwo from "components/Headings/HeadingTwo";
import players from "constants/players";
import useDbPlayersByTeam, { Player } from "hooks/useDbPlayersByTeam";
import { useEffect, useState } from "react";
import { Image, LayoutChangeEvent, Text, View } from "react-native";
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
};

type LastPlayProps = {
  lastPlay?: string | NBALastPlay;
  isDark?: boolean;
  homeTeamId?: string;
  awayTeamId?: string;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/40?text=👤";

export default function LastPlay({
  lastPlay,
  isDark = true,
  homeTeamId,
  awayTeamId,
}: LastPlayProps) {
  const [currentPlay, setCurrentPlay] = useState(lastPlay);
  const [containerWidth, setContainerWidth] = useState(0);

  const styles = lastPlayStyles(isDark);

  const onLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  useEffect(() => {
    setCurrentPlay(lastPlay);
  }, [lastPlay]);

  // ✅ Hooks for player lookup
  const homePlayersResult = useDbPlayersByTeam(homeTeamId || "");
  const awayPlayersResult = useDbPlayersByTeam(awayTeamId || "");

  const homePlayers = homePlayersResult.players || [];
  const awayPlayers = awayPlayersResult.players || [];

  // ✅ Avatar helper
  const getPlayerAvatar = (name?: string, headshot?: string): string => {
    if (!name) return headshot || DEFAULT_HEADSHOT;
    const fullName = name.trim().toLowerCase();

    const findMatch = (playerList: Player[]) =>
      playerList.find((p) => {
        if (!p.full_name) return false;
        const dbName = p.full_name.toLowerCase().trim();
        return dbName.includes(fullName) || fullName.includes(dbName);
      });

    const dbPlayer = findMatch(homePlayers) || findMatch(awayPlayers) || null;

    return dbPlayer?.avatarUrl || players[name] || headshot || DEFAULT_HEADSHOT;
  };

  // ✅ Text color helper
  const getTextColor = (text?: string) => {
    const defaultColor = isDark ? "#fff" : "#1d1d1d";
    if (!text) return defaultColor;
    const lower = text.toLowerCase();
    if (lower.includes("foul")) return "#ff6b6b";
    if (lower.includes("made")) return "#4ade80";
    if (lower.includes("missed")) return "#facc15";
    return defaultColor;
  };

  if (!currentPlay) return null;

  if (typeof currentPlay === "string") {
    return (
      <View style={styles.simpleContainer} onLayout={onLayout}>
        <Text
          style={[styles.simpleText, { color: isDark ? "#fff" : "#1d1d1d" }]}
        >
          {currentPlay}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <HeadingTwo>Last Play</HeadingTwo>

      {currentPlay.athletes?.length ? (
        <View style={styles.athleteContainer}>
          {currentPlay.athletes.map((athlete, idx) => {
            const avatarUrl = getPlayerAvatar(athlete.name, athlete.headshot);
            return (
              <View key={athlete.id || idx} style={styles.athleteItem}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View style={styles.athleteDetails}>
                  <Text style={styles.athleteName}>{athlete.name}</Text>
                  <Text style={styles.athleteMeta}>
                    {athlete.position || ""}
                  </Text>
                  <Text style={styles.athleteMeta}>
                    {athlete.jersey ? `#${athlete.jersey}` : ""}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      <Text
        style={[
          styles.playText,
          { color: getTextColor(currentPlay.text) },
          currentPlay.athletes?.length ? styles.playTextWithAthletes : null,
        ]}
      >
        {currentPlay.text}
      </Text>
    </View>
  );
}
