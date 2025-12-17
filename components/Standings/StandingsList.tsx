// components/NBAStandingsList.tsx
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { nbaDivisionsById, teams } from "constants/teams"; // your NBA team logos & info
import { useRouter } from "expo-router";
import {
  ConferenceStandings,
  StandingsTeam,
  useStandings,
} from "hooks/useStandings";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/StandingsStyles";
import { StandingsSkeleton } from "./StandingsSkeleton";

type SectionType = {
  title: string;
  data: StandingsTeam[];
};

export const StandingsList = () => {
  const { data = [], loading, error } = useStandings();
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();
  const [sortMode, setSortMode] = useState<"conference" | "division">(
    "conference"
  );

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
    const teamInfo = teams.find((t) => t.espnID === item.teamId);
    const teamLogo: ImageSourcePropType = isDark
      ? teamInfo?.logoLight ||
        teamInfo?.logo ||
        require("assets/Placeholders/teamPlaceholder.png")
      : teamInfo?.logo || require("assets/Placeholders/teamPlaceholder.png");

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
      <View style={{ marginTop: 12 }}>
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
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 100,
      }}
    >
      <Dropdown
        options={[
          { label: "Conference", value: "conference" },
          { label: "Division", value: "division" },
        ]}
        selectedValue={sortMode}
        onSelect={(value) => setSortMode(value as "conference" | "division")}
        isDark={isDark}
        absolute
      />
      {sortMode === "conference" ? (
        <>
          <Section title="Eastern Conference" data={east} />
          <Section title="Western Conference" data={west} />
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
