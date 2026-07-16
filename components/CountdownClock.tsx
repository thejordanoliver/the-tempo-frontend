import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet, Text, View } from "react-native";

import { usePreferences } from "@/contexts/PreferencesContext";
import { CountdownType } from "@/types/date";
import { useEffect, useState } from "react";
import HeadingTwo from "./Headings/HeadingTwo";

type Props<TGame extends { date?: string | null }> = {
  game: TGame | null;
  loading: boolean;
};

export default function CountdownClock<TGame extends { date?: string | null }>({
  game,
  loading,
}: Props<TGame>) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const [countDown, setCountdown] = useState<CountdownType | null>(null);
  const styles = countdownClockStyles(isDark);
  const formatTime = (value?: number) => String(value ?? 0).padStart(2, "0");
  const gameDate = game?.date ?? null;

  useEffect(() => {
    if (!gameDate) {
      setCountdown(null);
      return;
    }

    const firstGameDate = new Date(gameDate).getTime();

    if (Number.isNaN(firstGameDate)) {
      setCountdown(null);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const updateCountdown = () => {
      const distance = firstGameDate - Date.now();

      if (distance <= 0) {
        setCountdown(null);

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();

    if (firstGameDate <= Date.now()) return;

    intervalId = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameDate]);

  if (loading || !countDown) return null;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Season Begins</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown?.days)}</Text>
          <Text style={styles.label}>Days</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown?.hours)}</Text>
          <Text style={styles.label}>Hours</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown?.minutes)}</Text>
          <Text style={styles.label}>Minutes</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(countDown?.seconds)}</Text>
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
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    timeContainer: {
      width: "22%",
      maxWidth: 92,
      minWidth: 72,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    time: {
      fontSize: 20,
      textAlign: "center",
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    label: {
      fontSize: 10,
      letterSpacing: 2,
      textAlign: "center",
      fontFamily: Fonts.OSSEMIBOLD,
      textTransform: "uppercase",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
