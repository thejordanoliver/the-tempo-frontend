import { PlayObject } from "@/hooks/FootballHooks/useFootballGameDetails";
import { Colors } from "constants/styles";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import HeadingTwo from "../../../../Headings/HeadingTwo";
import FixedWidthTabBar from "../../../../TabBars/FixedWidthTabBar";
import DrivesList from "../DrivesList";

type League = "nfl" | "cfb" | string;

type Props = {
  previousDrives?: PlayObject[] | null;
  currentDrives?: PlayObject[] | null;
  loading?: boolean;
  error?: string | null;

  awayTeamId: number | string | null;
  homeTeamId: number | string | null;

  awayLogo: any;
  homeLogo: any;
  awayCode: string;
  homeCode: string;

  awayTeamEspnId?: number | string | null;
  homeTeamEspnId?: number | string | null;

  isDark: boolean;
  league?: League;
  gameStatusDescription: string;
};

export default function TeamDrives({
  previousDrives = [],
  currentDrives = [],
  loading = false,
  error = null,
  awayTeamId,
  homeTeamId,
  awayTeamEspnId,
  homeTeamEspnId,
  awayLogo,
  homeLogo,
  awayCode,
  homeCode,
  isDark,
  league = "nfl",
  gameStatusDescription,
}: Props) {
  const styles = TeamDrivesStyles;
  const [selectedTab, setSelectedTab] = useState<"away" | "home">("away");

  const normalizeId = (id?: number | string | null): string | null => {
    if (id === null || id === undefined || id === "") return null;
    return String(id);
  };

  const prev = useMemo(() => {
    return Array.isArray(previousDrives) ? previousDrives : [];
  }, [previousDrives]);

  const curr = useMemo(() => {
    return Array.isArray(currentDrives) ? currentDrives : [];
  }, [currentDrives]);

  const allDrives = useMemo(() => {
    return [...curr, ...prev];
  }, [curr, prev]);

  const awayLocalId = useMemo(() => normalizeId(awayTeamId), [awayTeamId]);
  const homeLocalId = useMemo(() => normalizeId(homeTeamId), [homeTeamId]);

  const awayEspnId = useMemo(
    () => normalizeId(awayTeamEspnId ?? awayTeamId),
    [awayTeamEspnId, awayTeamId],
  );

  const homeEspnId = useMemo(
    () => normalizeId(homeTeamEspnId ?? homeTeamId),
    [homeTeamEspnId, homeTeamId],
  );

  const tabs = useMemo(
    () =>
      [
        {
          key: "away",
          label: awayCode ?? "Away",
          logo: awayLogo,
          localId: awayLocalId,
          espnId: awayEspnId,
        },
        {
          key: "home",
          label: homeCode ?? "Home",
          logo: homeLogo,
          localId: homeLocalId,
          espnId: homeEspnId,
        },
      ] as const,
    [
      awayCode,
      awayLogo,
      awayLocalId,
      awayEspnId,
      homeCode,
      homeLogo,
      homeLocalId,
      homeEspnId,
    ],
  );

  const selectedTeam = useMemo(() => {
    return tabs.find((team) => team.key === selectedTab);
  }, [tabs, selectedTab]);

  const selectedCurrentDrives = useMemo(() => {
    if (!selectedTeam) return curr;

    return curr.filter((drive) => {
      const driveTeamId = normalizeId(drive.team?.id);

      return (
        driveTeamId === selectedTeam.espnId ||
        driveTeamId === selectedTeam.localId
      );
    });
  }, [curr, selectedTeam]);

  const selectedPreviousDrives = useMemo(() => {
    if (!selectedTeam) return prev;

    return prev.filter((drive) => {
      const driveTeamId = normalizeId(drive.team?.id);

      return (
        driveTeamId === selectedTeam.espnId ||
        driveTeamId === selectedTeam.localId
      );
    });
  }, [prev, selectedTeam]);

  const selectedDriveCount =
    selectedCurrentDrives.length + selectedPreviousDrives.length;

  if (!loading && allDrives.length === 0) return null;

  if (
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Canceled" ||
    gameStatusDescription === "Delayed" ||
    gameStatusDescription === "Postponed"
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Drives</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((tab) => tab.key)}
          selected={selectedTab}
          onTabPress={(tabKey) => setSelectedTab(tabKey as "away" | "home")}
          isDark={isDark}
          renderLabel={(tabKey, isSelected, tabStyles) => {
            const team = tabs.find((tab) => tab.key === tabKey);

            if (!team) return null;

            return (
              <View style={styles.tabLabel}>
                {team.logo && (
                  <Image
                    source={team.logo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {team.label}
                </Text>
              </View>
            );
          }}
        />

        {selectedDriveCount === 0 && !loading ? (
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            No drives found for this team.
          </Text>
        ) : (
          <DrivesList
            previousDrives={selectedPreviousDrives}
            currentDrives={selectedCurrentDrives}
            loading={loading}
            error={error}
            isDark={isDark}
            league={league}
          />
        )}
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
  emptyText: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 13,
    textAlign: "center",
  },
});
