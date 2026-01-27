import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teams";
import { getTeamLogo as getCFBTeamLogo } from "constants/teamsCFB";
import { getNFLTeamsLogo } from "constants/teamsNFL";
import { useChampions } from "hooks/useChampions";
import { useMemo } from "react";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import AwardSeasonTableSkeleton from "./AwardSeasonTableSkeleton";

const ROW_HEIGHT = 50;

type Props = {
  title: string;
  lighter?: boolean;
  refreshSignal?: number;
  league: "CFB" | "NBA" | "NFL";
};

export default function ChampionsTable({
  title,
  lighter = false,
  league,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const useLightLogo = lighter || isDark;

  const { data, loading, error } = useChampions({
    league,
  });

  const styles = useMemo(() => tableStyles(isDark, lighter), [isDark, lighter]);

  /* ------------------------------------------------------------------ */
  /* LOADING / ERROR                                                     */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <View>
        <AwardSeasonTableSkeleton teams={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginVertical: 12 }}>
        <Text style={styles.error}>Failed to load.</Text>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* MAIN RENDER                                                         */
  /* ------------------------------------------------------------------ */

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerName}>{title}</Text>
        </View>

        {data.map((row) => {
          const logo =
            row.team && league === "CFB"
              ? getCFBTeamLogo(row.team.id, useLightLogo)
              : row.team && league === "NBA"
              ? getTeamLogo(row.team?.id, useLightLogo)
              : getNFLTeamsLogo(row.team?.id ?? 0, useLightLogo);
          const isSuperBowl = league === "NFL";

          return (
            <View
              key={`${row.season}-${row.id}-${row.selector}`}
              style={styles.row}
            >
              {/* LEFT: Logo + Team Info */}
              <View>
                <View style={styles.teamRow}>
                  {logo && (
                    <Image
                      source={logo}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  )}

                  <View>
                    <Text style={styles.teamName}>
                      {row.team?.name ?? row.team_name}
                    </Text>

                    {row.team?.conference && (
                      <Text style={styles.subText}>{row.team.conference}</Text>
                    )}
                  </View>
                </View>
              </View>
              {/* RIGHT: Counts */}
              <View>
                <Text style={styles.awardCount}>
                  {isSuperBowl ? `SB ${row.notes}` : row.season}
                </Text>
                {row.era && <Text style={styles.subText}>{row.era}</Text>}
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

    headerRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: Colors.lightGray,
      backgroundColor: lighter ? "transparent" : Colors.darkGray + "20",
    },

    headerName: {
      paddingHorizontal: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
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

    error: {
      padding: 12,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.dark.lightRed,
      textAlign: "center",
    },
  });
