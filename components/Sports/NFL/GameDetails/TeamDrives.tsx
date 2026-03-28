import { Colors } from "constants/Styles";
import { getCFBTeamLogo, getTeamByESPNId } from "constants/teamsCFB";
import {
  getTeamByESPNId as getNFLTeamByESPNId,
  getNFLTeamLogo,
} from "constants/teamsNFL";
import { PlayObject } from "hooks/NFLHooks/useGameDetails";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import HeadingTwo from "../../../Headings/HeadingTwo";
import FixedWidthTabBar from "../../../TabBars/FixedWidthTabBar";
import DrivesList from "./DrivesList";
type Props = {
  previousDrives?: PlayObject[] | null;
  currentDrives?: PlayObject[] | null;
  loading?: boolean;
  error?: string | null;
  awayTeamId: number;
  homeTeamId: number;
  isDark: boolean;
  league?: "NFL" | "CFB";
};

export default function TeamDrives({
  previousDrives = [],
  currentDrives = [],
  loading = false,
  error = null,
  awayTeamId,
  homeTeamId,
  isDark,
  league = "NFL",
}: Props) {
  const styles = TeamDrivesStyles;

  const normalizeESPNId = (id?: number | string | null): string | null => {
    if (id === null || id === undefined) return null;
    return String(id);
  };

  const prev = Array.isArray(previousDrives) ? previousDrives : [];
  const curr = Array.isArray(currentDrives) ? currentDrives : [];

  const allDrives = useMemo(() => [...curr, ...prev], [curr, prev]);

  /* ------------------------------- */
  /* Build tabs like scoring summary */
  /* ------------------------------- */

  const teams = useMemo(() => {
    const tabs: string[] = ["ALL"];

    const away = normalizeESPNId(awayTeamId);
    const home = normalizeESPNId(homeTeamId);

    if (away) tabs.push(away);
    if (home && home !== away) tabs.push(home);

    const uniqueIds = Array.from(
      new Set(
        allDrives
          ?.map((d) => normalizeESPNId(d.team?.id))
          .filter((id): id is string => !!id),
      ),
    );

    uniqueIds.forEach((id) => {
      if (!tabs.includes(id)) {
        tabs.push(id);
      }
    });

    return tabs;
  }, [allDrives, awayTeamId, homeTeamId]);

  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0] ?? "");

  useEffect(() => {
    if (!teams.includes(selectedTeam)) {
      setSelectedTeam(teams[0] ?? "");
    }
  }, [teams, selectedTeam]);

  /* ------------------------------- */
  /* Filter drives like scoring plays */
  /* ------------------------------- */

  const teamDrives = useMemo(() => {
    if (selectedTeam === "ALL") return allDrives;

    return allDrives.filter(
      (d) => normalizeESPNId(d.team?.id) === selectedTeam,
    );
  }, [allDrives, selectedTeam]);

  if (!loading && allDrives.length === 0) return null;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Drives</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={teams}
          selected={selectedTeam}
          onTabPress={setSelectedTeam}
          isDark={isDark}
          renderLabel={(id, isSelected, tabStyles) => {
            if (id === "ALL") {
              return (
                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  ALL
                </Text>
              );
            }

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

        <DrivesList
          previousDrives={[]}
          currentDrives={teamDrives}
          loading={loading}
          error={error}
          isDark={isDark}
          league={league}
        />
      </View>
    </View>
  );
}

const TeamDrivesStyles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  wrapper: {
    borderColor: Colors.midTone,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    paddingTop: 12,
  },
  tabLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tabLogo: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});
