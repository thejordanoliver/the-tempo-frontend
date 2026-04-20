import AwardSeasonTableSkeleton from "components/League/AwardSeasonTableSkeleton";
import { Colors, Fonts } from "constants/styles";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AwardCategory } from "types/types";

const ROW_HEIGHT = 50;

type LeagueType = "cfb" | "cbb";

type Props = {
  league?: LeagueType; // ✅ NEW
  category: AwardCategory;
  title: string;
  refreshSignal?: number;
  data: any[];
  loading: boolean;
  error: string | null;
};

export default function AwardSchoolsTable({
  league = "cfb",
  category,
  title,
  loading,
  error,
  data,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const useLightLogo = isDark;

  const styles = useMemo(() => tableStyles(isDark), [isDark]);

  /* ------------------------------------------------------------------ */
  /* LOADING / ERROR                                                     */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <View style={styles.container}>
        <AwardSeasonTableSkeleton teams={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load.</Text>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* MAIN RENDER                                                         */
  /* ------------------------------------------------------------------ */

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerName}>{title}</Text>
        </View>

        {data.map((row) => {
          // ✅ Dynamic logo selection
          const logo =
            league === "cfb"
              ? getCFBTeamLogo(row.team.id, useLightLogo)
              : getCBBTeamLogo(row.team.id, useLightLogo);

          return (
            <View key={`${league}-${row.team.id}`} style={styles.row}>
              {/* LEFT */}
              <View style={styles.left}>
                <View style={styles.teamRow}>
                  {logo && (
                    <Image
                      source={logo}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.teamName}>{row.team.name}</Text>
                </View>
              </View>

              {/* RIGHT */}
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

const tableStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
    },
    table: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: isDark ? Colors.white : Colors.black,
      overflow: "hidden",
    },

    headerRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: Colors.lightGray,
      backgroundColor: Colors.darkGray + "20",
    },

    headerName: {
      paddingHorizontal: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
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
      color: isDark ? Colors.white : Colors.black,
    },

    awardCount: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },

    subText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      opacity: 0.75,
      color: isDark ? Colors.white : Colors.black,
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
