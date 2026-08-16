import { Colors, Fonts } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { CountdownType } from "@/types/date";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import HeadingTwo from "./Headings/HeadingTwo";
import SeasonBeginsAnimation from "./SeasonBeginsAnimation";

type CountdownGame = {
  id?: string | number | null;
  date?: string | null;
};

type Props<TGame extends CountdownGame> = {
  game: TGame | null;
  loading: boolean;
  teamLogo?: any;
  teamName?: string;
  teamColor?: string;
  teamSecondaryColor?: string;
};

// Survives screen unmounts for the current app session.
const playedSeasonAnimations = new Set<string>();

export default function CountdownClock<TGame extends CountdownGame>({
  game,
  loading,
  teamLogo,
  teamName,
  teamColor,
  teamSecondaryColor,
}: Props<TGame>) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = countdownClockStyles(isDark);

  const [countDown, setCountdown] = useState<CountdownType | null>(null);
  const [hasReachedZero, setHasReachedZero] = useState(false);
  const [countdownEnded, setCountdownEnded] = useState(false);

  const gameDate = game?.date ?? null;
  const animationKey = String(game?.id ?? gameDate ?? "");

  const formatTime = (value?: number) =>
    String(value ?? 0).padStart(2, "0");

  useEffect(() => {
    setCountdown(null);
    setHasReachedZero(false);
    setCountdownEnded(false);

    if (!gameDate || !animationKey) {
      return;
    }

    const firstGameDate = new Date(gameDate).getTime();

    if (Number.isNaN(firstGameDate)) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const updateCountdown = () => {
      const distance = firstGameDate - Date.now();

      if (distance <= 0) {
        setCountdown(null);
        setCountdownEnded(true);
        stopInterval();

        if (!playedSeasonAnimations.has(animationKey)) {
          playedSeasonAnimations.add(animationKey);
          setHasReachedZero(true);
        } else {
          setHasReachedZero(false);
        }

        return;
      }

      setCountdownEnded(false);
      setHasReachedZero(false);

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor(
          (distance % (1000 * 60 * 60)) / (1000 * 60),
        ),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();

    if (firstGameDate > Date.now()) {
      intervalId = setInterval(updateCountdown, 1000);
    }

    return stopInterval;
  }, [animationKey, gameDate]);

  if (loading) {
    return null;
  }

  if (hasReachedZero && teamLogo) {
    return (
      <View style={styles.container}>
        <SeasonBeginsAnimation
          visible
          isDark={isDark}
          teamLogo={teamLogo}
          teamName={teamName}
          teamColor={teamColor}
          teamSecondaryColor={teamSecondaryColor}
        />
      </View>
    );
  }

  // Prevents the 00:00:00:00 countdown from appearing after the animation.
  if (countdownEnded || !countDown) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Season Begins</HeadingTwo>

      <View style={styles.wrapper}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown.days)}</Text>
          <Text style={styles.label}>Days</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown.hours)}</Text>
          <Text style={styles.label}>Hours</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown.minutes)}</Text>
          <Text style={styles.label}>Minutes</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown.seconds)}</Text>
          <Text style={styles.label}>Seconds</Text>
        </View>
      </View>
    </View>
  );
}
const countdownClockStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 12,
      width: "100%",
    },

    wrapper: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },

    timeContainer: {
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      justifyContent: "center",
      maxWidth: 92,
      minWidth: 72,
      paddingVertical: 12,
      width: "22%",
    },

    time: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      fontVariant: ["tabular-nums"],
      textAlign: "center",
    },

    label: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 10,
      letterSpacing: 2,
      textAlign: "center",
      textTransform: "uppercase",
    },
  });
