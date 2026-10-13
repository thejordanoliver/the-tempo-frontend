import PillTabs from "components/TabBars/PillTabs";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import DraftBoardTab from "./DraftBoardTab";
import DraftList, { getDefaultDraftYear } from "./DraftList";
import DraftNewsTab from "./DraftNewsTab";

export { getDefaultDraftYear } from "./DraftList";

const DRAFT_TABS = ["Draft List", "Draft Board", "Draft News"] as const;

type DraftTab = (typeof DRAFT_TABS)[number];

const DRAFT_TAB_OPTIONS = DRAFT_TABS.map((tab) => ({
  label: tab,
  value: tab,
}));

type Props = {
  year: string;
  team: string;
  round: string;
  league: string;
  onYearChange: (year: string) => void;
  onTeamChange: (team: string) => void;
  onRoundChange: (round: string) => void;
};

export default function Draft({
  year,
  team,
  round,
  league,
  onYearChange,
  onTeamChange,
  onRoundChange,
}: Props) {
  const styles = DraftStyles;

  const [selectedTab, setSelectedTab] = useState<DraftTab>(DRAFT_TABS[0]);

  const [mountedTabs, setMountedTabs] = useState<Record<DraftTab, boolean>>({
    "Draft List": true,
    "Draft Board": false,
    "Draft News": false,
  });

  const safeYear = useMemo(
    () => year || String(getDefaultDraftYear(league)),
    [year, league],
  );

  const handleTabPress = (tab: DraftTab) => {
    setSelectedTab(tab);

    setMountedTabs((prev) => ({
      ...prev,
      [tab]: true,
    }));
  };

  return (
    <View style={styles.container}>
      <PillTabs
        tabs={DRAFT_TAB_OPTIONS}
        selectedValue={selectedTab}
        onChange={handleTabPress}
        containerStyle={styles.tabBar}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.tabScene,
            selectedTab !== "Draft List" && styles.hiddenTabScene,
          ]}
          pointerEvents={selectedTab === "Draft List" ? "auto" : "none"}
        >
          <DraftList
            year={year}
            team={team}
            round={round}
            league={league}
            onYearChange={onYearChange}
            onTeamChange={onTeamChange}
            onRoundChange={onRoundChange}
          />
        </View>

        {mountedTabs["Draft Board"] && (
          <View
            style={[
              styles.tabScene,
              selectedTab !== "Draft Board" && styles.hiddenTabScene,
            ]}
            pointerEvents={selectedTab === "Draft Board" ? "auto" : "none"}
          >
            <DraftBoardTab safeYear={safeYear} league={league} />
          </View>
        )}

        {mountedTabs["Draft News"] && (
          <View
            style={[
              styles.tabScene,
              selectedTab !== "Draft News" && styles.hiddenTabScene,
            ]}
            pointerEvents={selectedTab === "Draft News" ? "auto" : "none"}
          >
            <DraftNewsTab safeYear={safeYear} league={league} />
          </View>
        )}
      </View>
    </View>
  );
}

export const DraftStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
  },
  tabScene: {
    flex: 1,
  },
  hiddenTabScene: {
    display: "none",
  },
});
