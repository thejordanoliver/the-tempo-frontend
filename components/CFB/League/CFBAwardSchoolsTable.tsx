import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teamsCFB";
import { useCFBAwardSchools } from "hooks/CFBHooks/useCFBAwardSchools";
import { AwardCategory } from "hooks/useAwardSeasons";
import { useMemo } from "react";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";

type Props = {
  category: AwardCategory;
  title: string;
  lighter?: boolean;
  refreshSignal?: number;
};

export default function CFBAwardSchoolsTable({
  category,
  title,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const useLightLogo = lighter || isDark;

  const { data, loading, error } = useCFBAwardSchools({ category });

  const styles = useMemo(() => tableStyles(isDark, lighter), [isDark, lighter]);

  /* ------------------------------------------------------------------ */
  /* LOADING / ERROR                                                     */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <View style={{ marginVertical: 12 }}>
        <HeadingTwo lighter={lighter}>{title}</HeadingTwo>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginVertical: 12 }}>
        <HeadingTwo lighter={lighter}>{title}</HeadingTwo>
        <Text style={styles.errorText}>Failed to load.</Text>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* MAIN RENDER                                                         */
  /* ------------------------------------------------------------------ */

  return (
    <View style={{ marginBottom: 24 }}>
      <HeadingTwo lighter={lighter}>{title}</HeadingTwo>

      <View style={styles.table}>
        {data.map((row) => {
          const logo = getTeamLogo(row.team.id, useLightLogo);

          return (
            <View key={row.team.id} style={styles.row}>
              {/* LEFT: Logo + Team Info */}
              <View style={styles.left}>
                <View style={styles.teamRow}>
                  {logo && (
                    <Image
                      source={logo}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  )}

                  <View>
                    <Text style={styles.teamName}>{row.team.name}</Text>
                    <Text style={styles.subText}>{row.team.conference}</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT: Counts */}
              <View style={styles.right}>
                <Text style={styles.awardCount}>{row.total_awards}x</Text>
                <Text style={styles.subText}>
                  {row.unique_players}{" "}
                  {row.unique_players === 1 ? "Player" : "Players"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const tableStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    table: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: lighter
        ? Colors.white
        : isDark
        ? Colors.white
        : Colors.black,
      overflow: "hidden",
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
      alignItems: "center",
    },

    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    logo: {
      width: 28,
      height: 28,
    },

    left: {
      flex: 1,
    },

    right: {
      alignItems: "flex-end",
    },

    teamName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    awardCount: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    subText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      opacity: 0.75,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    muted: {
      padding: 12,
      fontFamily: Fonts.OSREGULAR,
      opacity: 0.6,
    },

    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
