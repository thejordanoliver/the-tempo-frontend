import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeamLogo, getTeamByESPNId } from "constants/teamsCFB";
import {
  getTeamByESPNId as getNFLTeamByESPNId,
  getNFLTeamLogo,
} from "constants/teamsNFL";
import { ScoringPlays } from "hooks/NFLHooks/useGameDetails";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LeagueType } from "types/types";
import HeadingTwo from "../../../Headings/HeadingTwo";
type Props = {
  scoringPlays?: ScoringPlays | null;
  loading?: boolean;
  awayTeamId?: number;
  homeTeamId?: number;
  isDark: boolean;
  league?: LeagueType;
};

export default function TeamScoringSummary({
  scoringPlays = [],
  loading = false,
  awayTeamId,
  homeTeamId,
  isDark,
  league = "NFL",
}: Props) {
  const styles = TeamScoringSummaryStyles(isDark);

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
          .filter((id): id is string => !!id),
      ),
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
      (sp) => normalizeESPNId(sp.team?.id) === selectedTeam,
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
      <HeadingTwo isDark={isDark}>Scoring Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={teams}
          selected={selectedTeam}
          onTabPress={setSelectedTeam}
          isDark={isDark}
          renderLabel={(id, isSelected, tabStyles) => {
            // ALL tab
            if (id === "ALL") {
              return (
                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  ALL
                </Text>
              );
            }

            // team tab
            const team =
              league === "CFB" ? getTeamByESPNId(id) : getNFLTeamByESPNId(id);
            const teamId = team?.id ?? 0;
            const teamCode = team?.code;
            const logo =
              league === "CFB"
                ? getCFBTeamLogo(teamId, isDark)
                : getNFLTeamLogo(teamId, isDark);

            return (
              <View style={styles.tabLabel}>
                {logo && (
                  <Image
                    source={logo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {teamCode}
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

const TeamScoringSummaryStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { marginTop: 10 },
    wrapper: {
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
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
      borderBottomColor: isDark ? Colors.midTone : Colors.lightGray,
    },
    periodText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 60,
    },
    playDesc: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      flexShrink: 1,
    },
    clockText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.midTone : Colors.darkGray,
      width: 45,
      textAlign: "right",
    },
    empty: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      padding: 20,
      color: isDark ? Colors.midTone : Colors.darkGray,
    },
    tabLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
  });
