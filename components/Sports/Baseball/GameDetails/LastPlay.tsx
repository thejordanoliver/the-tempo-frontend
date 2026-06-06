import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";

type MLBLastPlayParticipant = {
  athlete?: {
    id?: string;
    displayName?: string;
    fullName?: string;
    shortName?: string;
    name?: string;
  };
  type?: "pitcher" | "batter" | string;
};

type MLBLastPlay = {
  id?: string;
  atBatId?: string;
  sequenceNumber?: string;

  text?: string;
  description?: string;

  inning?: number;
  half?: "Top" | "Bottom";

  awayScore?: number;
  homeScore?: number;
  scoreValue?: number;
  scoringPlay?: boolean;

  pitchVelocity?: number | null;

  pitchCount?: {
    balls?: number;
    strikes?: number;
  };

  resultCount?: {
    balls?: number;
    strikes?: number;
  };

  outs?: number;

  period?: {
    displayValue?: string;
    number?: number;
    type?: string;
  };

  type?: {
    id?: string;
    text?: string;
  };

  team?: {
    id?: string;
  };

  participants?: MLBLastPlayParticipant[];
};

type LastPlayProps = {
  lastPlay?: string | MLBLastPlay | null;
  gameStatusDescription: string;
};

export default function LastPlay({
  lastPlay,
  gameStatusDescription,
}: LastPlayProps) {
  const [currentPlay, setCurrentPlay] = useState(lastPlay);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = lastPlayStyles(isDark);

  useEffect(() => {
    setCurrentPlay(lastPlay);
  }, [lastPlay]);

  const normalizeText = (text?: string) => {
    if (!text) return "";

    return text
      .replace(/home\s*run/gi, "Home Run")
      .replace(/strikeout/gi, "Strikeout")
      .replace(/double\s*play/gi, "Double Play")
      .replace(/groundout/gi, "Groundout")
      .replace(/flyout/gi, "Flyout")
      .replace(/walk/gi, "Walk")
      .replace(/single/gi, "Single")
      .replace(/double/gi, "Double")
      .replace(/triple/gi, "Triple");
  };

  const getTextColor = (text?: string) => {
    const defaultColor = isDark ? Colors.white : Colors.black;

    if (!text) return defaultColor;

    const lower = text.toLowerCase();

    if (lower.includes("home run")) {
      return isDark ? Colors.dark.limeGreen : Colors.light.green;
    }

    if (lower.includes("strikeout")) {
      return isDark ? Colors.dark.lightRed : Colors.light.red;
    }

    if (lower.includes("double play")) {
      return isDark ? Colors.dark.limeGreen : Colors.light.green;
    }

    if (lower.includes("walk")) {
      return isDark ? Colors.dark.limeGreen : Colors.light.green;
    }

    return defaultColor;
  };

  const getParticipantName = (
    play: MLBLastPlay,
    participantType: "pitcher" | "batter",
  ) => {
    const participant = play.participants?.find(
      (item) => item.type === participantType,
    );

    return (
      participant?.athlete?.displayName ||
      participant?.athlete?.fullName ||
      participant?.athlete?.shortName ||
      participant?.athlete?.name ||
      null
    );
  };

  const playText = useMemo(() => {
    if (!currentPlay) return "";

    if (typeof currentPlay === "string") {
      return currentPlay;
    }

    const directText =
      currentPlay.text || currentPlay.description || currentPlay.type?.text;

    const batter = getParticipantName(currentPlay, "batter");
    const pitcher = getParticipantName(currentPlay, "pitcher");

    if (directText && directText !== "End Batter/Pitcher") {
      return directText;
    }

    if (batter && pitcher) {
      return `${batter} facing ${pitcher}`;
    }

    if (batter) {
      return `${batter} at bat`;
    }

    if (pitcher) {
      return `${pitcher} pitching`;
    }

    if (directText === "End Batter/Pitcher") {
      return "At bat ended";
    }

    return directText || "";
  }, [currentPlay]);

  const scoreText = useMemo(() => {
    if (!currentPlay || typeof currentPlay === "string") return null;

    const awayScore =
      typeof currentPlay.awayScore === "number" ? currentPlay.awayScore : null;

    const homeScore =
      typeof currentPlay.homeScore === "number" ? currentPlay.homeScore : null;

    if (awayScore === null || homeScore === null) return null;

    return `${awayScore} - ${homeScore}`;
  }, [currentPlay]);

  const countText = useMemo(() => {
    if (!currentPlay || typeof currentPlay === "string") return null;

    const balls =
      currentPlay.pitchCount?.balls ?? currentPlay.resultCount?.balls ?? null;

    const strikes =
      currentPlay.pitchCount?.strikes ??
      currentPlay.resultCount?.strikes ??
      null;

    if (balls === null || strikes === null) return null;

    return `${balls}-${strikes}`;
  }, [currentPlay]);

  const inningText = useMemo(() => {
    if (!currentPlay || typeof currentPlay === "string") return null;

    if (currentPlay.period?.displayValue) {
      return currentPlay.period.displayValue;
    }

    if (currentPlay.half && currentPlay.inning) {
      return `${currentPlay.half} ${currentPlay.inning}`;
    }

    return null;
  }, [currentPlay]);

  const outsText = useMemo(() => {
    if (!currentPlay || typeof currentPlay === "string") return null;

    if (typeof currentPlay.outs !== "number") return null;

    return `${currentPlay.outs} ${currentPlay.outs === 1 ? "out" : "outs"}`;
  }, [currentPlay]);

  if (
    !currentPlay ||
    !playText ||
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Final"
  ) {
    return null;
  }

  if (typeof currentPlay === "string") {
    return (
      <View style={styles.simpleContainer}>
        <HeadingTwo isDark={isDark}>Last Play</HeadingTwo>
        <Text style={styles.simpleText}>{normalizeText(playText)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Last Play</HeadingTwo>

      <View style={styles.wrapper}>
        <View style={styles.row}>
          <Text style={[styles.playText, { color: getTextColor(playText) }]}>
            {normalizeText(playText)}
          </Text>

          {currentPlay.pitchVelocity ? (
            <Text style={styles.subText}>{currentPlay.pitchVelocity} MPH</Text>
          ) : null}

          {outsText ? <Text style={styles.subText}>{outsText}</Text> : null}
        </View>
        <View style={styles.statusContainer}>
          {inningText ? <Text style={styles.subText}>{inningText}</Text> : null}
          {scoreText ? <Text style={styles.subText}>{scoreText}</Text> : null}
        </View>
      </View>
    </View>
  );
}
