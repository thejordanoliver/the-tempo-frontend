// components/NBAStandingsList.tsx
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { globalStyles } from "constants/Styles";
import { getTeamByESPNId, nbaDivisionsById } from "constants/teams"; // your NBA team logos & info
import { useRouter } from "expo-router";
import {
  ConferenceStandings,
  StandingsTeam,
  useStandings,
} from "hooks/useStandings";
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

type SectionType = {
  title: string;
  data: StandingsTeam[];
};

type Props = {
  year?: string;
  onYearChange?: (y: string) => void;
};

export const StandingsList = ({ year, onYearChange }: Props) => {
  const { data = [], loading, error } = useStandings(year);
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();
  const [sortMode, setSortMode] = useState<"conference" | "division">(
    "conference"
  );

  const yearOptions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // NFL season starts Aug 1
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

  if (error) return <Text style={global.errorText}>{error}</Text>;
  // --- Group by conference ---
  const east = (
    data?.find(
      (c) => c.abbreviation === "East" || c.name === "Eastern Conference"
    )?.standings || []
  ).sort((a, b) => b.winPercent - a.winPercent);

  const west = (
    data?.find(
      (c) => c.abbreviation === "West" || c.name === "Western Conference"
    )?.standings || []
  ).sort((a, b) => b.winPercent - a.winPercent);

  // --- Group by division ---
  const divisions: Record<string, StandingsTeam[]> = {};
  data?.forEach((conf) => {
    conf.standings.forEach((team) => {
      if (!divisions[team.division]) divisions[team.division] = [];
      divisions[team.division].push(team);
    });
  });

  // --- Group by division using mapped list ---
  const divisionStandings: SectionType[] = Object.entries(nbaDivisionsById).map(
    ([divisionName, idList]) => {
      const teamsInDivision =
        data
          ?.flatMap((conf: ConferenceStandings) => conf.standings)
          .filter((team: StandingsTeam) => idList.includes(Number(team.teamId)))
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
    const team = getTeamByESPNId(Number(item.teamId));
    const teamLogo = isDark ? team?.logoLight || team?.logo : team?.logo;
    const teamCode = team?.code;
    return (
      <View style={styles.row}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        <TouchableOpacity
          style={styles.teamInfo}
          onPress={() =>
            router.push({
              pathname: "/team/[teamId]",
              params: { teamId: String(team?.id) },
            })
          }
        >
          <Image source={teamLogo} style={styles.logo} />
          <Text style={styles.teamName}>{teamCode}</Text>
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
          <Text style={styles.statText}>{item.conferenceRecord}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.vsdiv}</Text>
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
        "Conf",
        "Div",
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
          <Section title="East Conference" data={east} />
          <Section title="West Conference" data={west} />
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
