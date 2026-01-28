// components/MLBStandingsList.tsx
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { mlbDivisionsById, teams } from "constants/teamsMLB"; // your MLB team logos & info
import { useRouter } from "expo-router";
import {
  ConferenceStandings,
  StandingsTeam,
  useMLBStandings,
} from "hooks/MLBHooks/useStandings";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/LeagueStyles/StandingsStyles";
import { StandingsSkeleton } from "./StandingsSkeleton";

type Props = {
  year?: string;
  onYearChange?: (y: string) => void;
};
type SectionType = {
  title: string;
  data: StandingsTeam[];
};

export const StandingsList = ({ year, onYearChange }: Props) => {
  const { standings: conferences, loading, error } = useMLBStandings(year);
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();
  const [sortMode, setSortMode] = useState<"conference" | "division">(
    "conference"
  );

  const yearOptions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const seasonHasStarted =
      now.getMonth() > 7 || (now.getMonth() === 7 && now.getDate() >= 1);

    const maxSeason = seasonHasStarted ? currentYear : currentYear - 1;

    const arr = [];
    for (let y = maxSeason; y >= maxSeason - 24; y--) {
      arr.push({ label: String(y), value: String(y) });
    }

    return arr;
  }, []);

  const safeYear =
    Number(year) > Number(yearOptions[0]?.value) ? yearOptions[0].value : year;

  if (loading)
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  // --- Group by conference ---
  const american = (
    conferences?.find(
      (c) => c.abbreviation === "AL" || c.name === "American League"
    )?.standings || []
  ).sort((a, b) => b.winPercent - a.winPercent);

  const national = (
    conferences?.find(
      (c) => c.abbreviation === "NL" || c.name === "National League"
    )?.standings || []
  ).sort((a, b) => b.winPercent - a.winPercent);

  // --- Group by division ---
  const divisions: Record<string, StandingsTeam[]> = {};
  conferences?.forEach((conf) => {
    conf.standings.forEach((team) => {
      if (!divisions[team.division]) divisions[team.division] = [];
      divisions[team.division].push(team);
    });
  });

  // --- Group by division using mapped list ---
  const divisionStandings: SectionType[] = Object.entries(mlbDivisionsById).map(
    ([divisionName, idList]) => {
      const numericIds = idList.map(Number); // <-- FIX

      const teamsInDivision =
        conferences
          ?.flatMap((conf: ConferenceStandings) => conf.standings)
          .filter((team: StandingsTeam) =>
            numericIds.includes(Number(team.teamId))
          )
          .sort(
            (a: StandingsTeam, b: StandingsTeam) => b.winPercent - a.winPercent
          ) || [];

      return {
        title: `${divisionName} Division`,
        data: teamsInDivision,
      };
    }
  );

  const renderLeftItem = ({
    item,
    index,
  }: {
    item: StandingsTeam;
    index: number;
  }) => {
    const teamInfo = teams.find((t) => t.espnID === +item.teamId);
    const teamLogo = isDark ? teamInfo?.logoLight : teamInfo?.logo;

    return (
      <View style={styles.row}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        <TouchableOpacity
          style={styles.teamInfo}
          onPress={() =>
            router.push({
              pathname: "/team/mlb/[teamId]",
              params: { teamId: String(teamInfo?.id) },
            })
          }
        >
          <Image source={teamLogo} style={styles.logo} />
          <Text style={styles.teamName}>{teamInfo?.code}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightItem = ({ item }: { item: StandingsTeam }) => {
    const winStreak = item.streak?.startsWith("W");

    const streakColor = winStreak
      ? isDark
        ? Colors.dark.limeGreen
        : Colors.light.green
      : isDark
      ? Colors.dark.lightRed
      : Colors.light.red;

    return (
      <View style={styles.row}>
        <View style={styles.statCell}>
          <Text style={styles.statText}>
            {item.wins}-{item.losses}
          </Text>
        </View>
        <View style={styles.statCell}>
          <Text style={[styles.statText, { color: streakColor }]}>
            {item.streak}
          </Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>
            {(item.winPercent * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.gamesBehind}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.homeRecord}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.roadRecord}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.pointsFor}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.pointsAgainst}</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.row}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#</Text>
      </View>
      <View>
        <Text style={styles.teamHeaderText}>Team</Text>
      </View>
    </View>
  );

  const renderStatsHeader = () => (
    <View style={styles.row}>
      {[
        "W-L",
        "Streak",
        "Win %",
        "GB",
        "Home",
        "Away",
        "Pts For",
        "Pts Against",
      ].map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  function Section({ title, data }: SectionType) {
    return (
      <View style={{ marginTop: 20 }}>
        <HeadingTwo style={styles.header}>{title}</HeadingTwo>
        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.teamId}
            renderItem={renderLeftItem}
            scrollEnabled={false}
            ListHeaderComponent={renderHeader}
            stickyHeaderIndices={[0]}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ width: 220 }}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => String(item.teamId)}
              renderItem={renderRightItem}
              scrollEnabled={false}
              ListHeaderComponent={renderStatsHeader}
              stickyHeaderIndices={[0]}
            />
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={{ flexDirection: "row" }}>
        <Dropdown
          options={[
            { label: "Conference", value: "conference" },
            { label: "Division", value: "division" },
          ]}
          selectedValue={sortMode}
          onSelect={(value) => setSortMode(value as any)}
          isDark={isDark}
          absolute
          style={{ right: 100 }}
        />

        {onYearChange && (
          <Dropdown
            options={yearOptions}
            selectedValue={safeYear ?? ""}
            onSelect={onYearChange}
            isDark={isDark}
            absolute
            style={{ right: 0 }}
          />
        )}
      </View>
      {sortMode === "conference" ? (
        <>
          <Section title="American League" data={american} />
          <Section title="National League" data={national} />
        </>
      ) : (
        divisionStandings.map((section) => (
          <Section
            key={section.title}
            title={section.title}
            data={section.data}
          />
        ))
      )}
    </ScrollView>
  );
};
