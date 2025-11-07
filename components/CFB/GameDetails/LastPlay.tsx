import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { Athlete, PlayObject } from "hooks/NFLHooks/useNFLGamePossession";
import { useEffect, useState } from "react";
import { Image, LayoutChangeEvent, Text, View } from "react-native";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";
type LastPlayProps = {
  lastPlay?: string | PlayObject;
  isDark?: boolean;
};

export default function LastPlay({ lastPlay, isDark = true }: LastPlayProps) {
  const [currentPlay, setCurrentPlay] = useState(lastPlay);
  const [containerWidth, setContainerWidth] = useState(0);
  const styles = lastPlayStyles(isDark);
  const textColor = isDark ? Colors.dark.text : Colors.light.text;

  const onLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  useEffect(() => {
    setCurrentPlay(lastPlay);
  }, [lastPlay]);

  const getTextColor = (text?: string) => {
    if (text === "Two-minute warning") return "red";
    return isDark ? Colors.dark.text : Colors.light.text;
  };

  if (!currentPlay) return null;

  if (typeof currentPlay === "string") {
    return (
      <View style={{ marginVertical: 12 }} onLayout={onLayout}>
        <Text
          style={{
            fontFamily: Fonts.OSREGULAR,
            fontSize: 14,
            color: textColor,
          }}
        >
          {currentPlay}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 12, flexGrow: 1 }} onLayout={onLayout}>
      <HeadingTwo>Play By Play</HeadingTwo>

      {currentPlay.athletesInvolved?.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {currentPlay.athletesInvolved.map((athlete: Athlete) => (
            <View
              key={athlete.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              {athlete.headshot && (
                <Image
                  source={{ uri: athlete.headshot }}
                  style={styles.avatar}
                />
              )}
              <View style={styles.athleteDetails}>
                <Text style={styles.athleteName}>{athlete.fullName}</Text>
                <Text style={styles.athleteMeta}>{athlete.position || ""}</Text>
                <Text style={styles.athleteMeta}>
                  {`#${athlete.jersey || ""}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <Text
        style={[styles.playText, { color: getTextColor(currentPlay.text) }]}
      >
        {currentPlay.text}
      </Text>

      {currentPlay.drive?.description && (
        <Text style={styles.description}>
          Drive: {currentPlay.drive.description}
          {currentPlay.drive.timeElapsed?.displayValue
            ? ` (${currentPlay.drive.timeElapsed.displayValue})`
            : ""}
        </Text>
      )}
    </View>
  );
}
