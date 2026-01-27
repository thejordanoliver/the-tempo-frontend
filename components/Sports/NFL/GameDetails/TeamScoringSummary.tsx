import { Colors, Fonts } from "constants/Styles";
import { getTeamByESPNId } from "constants/teamsCFB";
import { getTeamByESPNId as getNFLTeamByESPNId } from "constants/teamsNFL";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { LeagueType } from "types/types";
import HeadingTwo from "../../../Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "../../../TabBars/FixedWidthTabBar";

type ScoringPlay = {
  type?: { text?: string };
  team?: { abbreviation?: string; id?: number };
  period?: { number?: number };
  clock?: { displayValue?: string };
  text?: string;
  awayScore: number;
  homeScore: number;
};

type Props = {
  scoringPlays?: ScoringPlay[] | null;
  loading?: boolean;
  awayTeamId?: number; // ✅ Now team ID
  homeTeamId?: number; // ✅ Now team ID
  lighter?: boolean;
  league?: LeagueType;
};

export default function TeamScoringSummary({
  scoringPlays = [],
  loading = false,
  awayTeamId,
  homeTeamId,
  lighter = false,
  league = "NFL",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark, lighter);

  const normalizeESPNId = (id?: number | string | null): string | null => {
    if (id === null || id === undefined) return null;
    return String(id);
  };

  // 🧠 Build tabs from ESPN IDs, not ESPN abbreviations
  const teams = useMemo(() => {
    const tabs: string[] = ["ALL"];

    const away = normalizeESPNId(awayTeamId);
    const home = normalizeESPNId(homeTeamId);

    if (away) tabs.push(away);
    if (home && home !== away) tabs.push(home);

    const uniqueIds = Array.from(
      new Set(
        scoringPlays
          ?.map((sp) => normalizeESPNId(sp.team?.id))
          .filter((id): id is string => !!id)
      )
    );

    uniqueIds.forEach((id) => {
      if (!tabs.includes(id)) {
        tabs.push(id);
      }
    });

    return tabs;
  }, [scoringPlays, awayTeamId, homeTeamId]);

  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0] ?? "");

  useEffect(() => {
    if (!teams.includes(selectedTeam)) {
      setSelectedTeam(teams[0] ?? "");
    }
  }, [teams, selectedTeam]);

  // 🧠 Filter by ESPN ID → internal id
  const teamPlays = useMemo(() => {
    if (selectedTeam === "ALL") return scoringPlays;

    return scoringPlays?.filter(
      (sp) => normalizeESPNId(sp.team?.id) === selectedTeam
    );
  }, [scoringPlays, selectedTeam]);

  if (!loading && scoringPlays?.length === 0) return null;

  const periodMap: Record<string, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
    OT: "OT",
    OVERTIME: "OT",
  };

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Scoring Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={teams}
          selected={selectedTeam}
          onTabPress={setSelectedTeam}
          lighter={lighter}
          renderLabel={(id, isSelected) => {
            // ALL tab
            if (id === "ALL") {
              return (
                <Text style={getLabelStyle(isDark, isSelected, lighter)}>
                  ALL
                </Text>
              );
            }

            // team tab
            const team =
              league === "CFB" ? getTeamByESPNId(id) : getNFLTeamByESPNId(id);
            const logo = lighter
              ? team?.logoLight || team?.logo
              : isDark
              ? team?.logoLight
              : team?.logo;
            const selectedOpacity = isSelected ? 1 : 0.5;

            return (
              <View style={styles.tabLabel}>
                {logo && (
                  <Image
                    source={logo}
                    style={[styles.logo, { opacity: selectedOpacity }]}
                    resizeMode="contain"
                  />
                )}
                <Text
                  style={{
                    ...getLabelStyle(isDark, isSelected, lighter),
                    opacity: selectedOpacity,
                  }}
                >
                  {team?.code ?? id}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.listContainer}>
          {teamPlays?.map((play, index) => (
            <View key={index} style={styles.playRow}>
              <Text style={styles.periodText}>
                {periodMap[String(play.period?.number)] ?? "-"}
                <Text style={styles.clockText}>
                  {" "}
                  {play.clock?.displayValue ?? ""}
                </Text>
              </Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.playDesc}>{play.text}</Text>
              </View>

              <Text style={styles.clockText}>
                {play.awayScore}-{play.homeScore}
              </Text>
            </View>
          ))}

          {teamPlays?.length === 0 && (
            <Text style={styles.empty}>No scoring plays</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: { marginTop: 10 },
    wrapper: {
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.lightGray,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      paddingTop: 12,
    },
    tabLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
    logo: { width: 26, height: 26 },
    listContainer: { marginTop: 12, gap: 12 },
    playRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.lightGray,
    },
    periodText: {
      fontFamily: Fonts.OSBOLD,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      width: 60,
    },
    playDesc: {
      fontFamily: Fonts.OSREGULAR,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      flexShrink: 1,
    },
    clockText: {
      fontFamily: Fonts.OSREGULAR,
      color: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.darkGray,
      width: 45,
      textAlign: "right",
    },
    empty: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      padding: 20,
      color: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.darkGray,
    },
  });
