import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Styles";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Text, View, useColorScheme } from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";

type MLBLastPlay = {
  id?: string;
  text: string;
  inning?: number;
  half?: "Top" | "Bottom";
  pitchVelocity: number;
  awayScore: number;
  homeScore: number;
  pitchCount: {
    balls: number;
    strikes: number;
  };
};

type LastPlayProps = {
  lastPlay?: string | MLBLastPlay;
};

export default function LastPlay({ lastPlay }: LastPlayProps) {
  const [currentPlay, setCurrentPlay] = useState(lastPlay);
  const [containerWidth, setContainerWidth] = useState(0);

  const isDark = useColorScheme() === "dark";
  const styles = lastPlayStyles(isDark);

  const onLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  useEffect(() => {
    setCurrentPlay(lastPlay);
  }, [lastPlay]);

  const normalizeText = (text: string) => {
    if (!text) return text;

    return text
      .replace(/home\s*run/gi, "Home Run")
      .replace(/strikeout/gi, "Strikeout")
      .replace(/walk/gi, "Walk")
      .replace(/double\s*play/gi, "Double Play")
      .replace(/flyout/gi, "Flyout")
      .replace(/groundout/gi, "Groundout")
      .replace(/single/gi, "Single")
      .replace(/double/gi, "Double")
      .replace(/triple/gi, "Triple");
  };

  const getTextColor = (text?: string) => {
    const defaultColor = isDark ? Colors.white : Colors.black;
    if (!text) return defaultColor;

    const lower = text.toLowerCase();

    if (lower.includes("home run"))
      return isDark ? Colors.dark.limeGreen : Colors.light.green;

    if (lower.includes("strikeout"))
      return isDark ? Colors.dark.lightRed : Colors.light.red;

    if (lower.includes("double play"))
      return isDark ? Colors.dark.limeGreen : Colors.light.green;

    if (lower.includes("walk"))
      return isDark ? Colors.dark.limeGreen : Colors.light.green;

    return defaultColor;
  };

  if (!currentPlay) return null;

  if (typeof currentPlay === "string") {
    return (
      <View style={styles.simpleContainer} onLayout={onLayout}>
        <HeadingTwo>Last Play</HeadingTwo>
        <Text style={styles.simpleText}>{normalizeText(currentPlay)}</Text>
      </View>
    );
  }

  

  return (
    <View style={styles.container} onLayout={onLayout}>
      <HeadingTwo>Last Play</HeadingTwo>

      <View style={styles.wrapper}>
        <View style={styles.statusContainer}>
          <Text
            style={[styles.playText, { color: getTextColor(currentPlay.text) }]}
          >
            {normalizeText(currentPlay.text)}
          </Text>
          {currentPlay.pitchVelocity ? (
            <Text style={[styles.subText]}>
              {currentPlay.pitchVelocity} MPH
            </Text>
          ) : null}
        </View>
        <Text style={styles.subText}>
          {currentPlay.awayScore} - {currentPlay.homeScore}
        </Text>
      </View>
    </View>
  );
}
