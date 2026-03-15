import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import {
  conferenceListMap,
  getCBBTeamLogo,
  getTeamByESPNId,
  teams,
} from "constants/teamsCBB";
import { useRouter } from "expo-router";
import { useCBBConferenceStandings } from "hooks/CBBHooks/useCBBConferenceStandings";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";

type Props = {
  selectedConference?: string;
  onlyTeamConference?: boolean;
  teamName?: string; // expects full name like "Ohio State Buckeyes"
  women?: boolean; // NEW: fetch women's standings
};

// --- Helpers ---
function getTeamConference(teamName?: string): string | null {
  if (!teamName) return null;
  for (const [conference, teamNames] of Object.entries(conferenceListMap)) {
    if (teamNames.includes(teamName)) return conference;
  }
  return null;
}

const CONFERENCE_ALIASES: Record<string, string> = {
  SEC: "Southeastern Conference",
  ACC: "Atlantic Coast Conference",
  "Big 12": "Big 12 Conference",
  "Big Ten": "Big Ten Conference",
  "Pac-12": "Pac-12 Conference",
  AAC: "American Conference",
  MWC: "Mountain West Conference",
  "Sun Belt": "Sun Belt Conference",
  MAC: "Mid-American Conference",
  CUSA: "Conference USA",
};

function stripParen(s: string) {
  return s.replace(/\s*\(.*?\)\s*/g, "").trim();
}

function resolveConferenceKey(
  input: string | null | undefined,
  groupedKeys: string[],
): string | null {
  if (!input) return null;

  if (groupedKeys.includes(input)) return input;
  const alias = CONFERENCE_ALIASES[input];
  if (alias && groupedKeys.includes(alias)) return alias;

  const stripped = stripParen(input);
  const exactStrip = groupedKeys.find((k) => stripParen(k) === stripped);
  if (exactStrip) return exactStrip;

  const target = stripped.toLowerCase();
  return (
    groupedKeys.find((k) => {
      const key = stripParen(k).toLowerCase();
      return key === target || key.includes(target) || target.includes(key);
    }) ?? null
  );
}

// --- Component ---
export const CBBConferenceStandingsList = ({
  selectedConference,
  teamName,
  onlyTeamConference = false,
  women = false,
}: Props) => {
  const { standings, loading, error } = useCBBConferenceStandings({ women });
  const isDark = useColorScheme() === "dark";
  const styles = standingsStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();
  const teamConference = getTeamConference(teamName);
  const league = women ? "WCBB" : "CBB";
  const { isFavorite } = useFavoriteTeams();
  if (loading) {
    return (
      <View style={styles.center}>
        <StandingsSkeleton />
      </View>
    );
  }

  if (error)
    return (
      <View style={styles.center}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

  const safeStandings = Array.isArray(standings) ? standings : [];

  // --- Group by ESPN conference string ---
  const grouped = safeStandings.reduce(
    (acc, team) => {
      const key = team?.conference ?? "Unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(team);
      return acc;
    },
    {} as Record<string, typeof safeStandings>,
  );

  const groupedKeys = Object.keys(grouped);

  const conferences = (() => {
    // Top 25 = all conferences
    if (selectedConference === "Top 25") {
      return groupedKeys.sort();
    }

    // onlyTeamConference = resolve team’s map conference -> actual grouped key
    if (onlyTeamConference) {
      const resolved = resolveConferenceKey(teamConference, groupedKeys);
      return resolved ? [resolved] : [];
    }

    // normal single selected conference
    const resolved = resolveConferenceKey(selectedConference, groupedKeys);
    return resolved ? [resolved] : [];
  })();

  // --- Render Functions ---
  const renderLeftItem = ({
    item,
    index,
    isLastRow,
  }: {
    item: any;
    index: number;
    isLastRow: boolean;
  }) => {
    const team = getTeamByESPNId(item.teamId);
    const teamId = women ? team?.wid : team?.id;
    const teamLogo = getCBBTeamLogo(teamId, isDark, women);
    const teamCode = team?.code;
    const favorited = team ? isFavorite(league, String(teamId)) : false;

    const espnToInternal: Record<string, number> = {};
    teams.forEach((t) => {
      if (t.espnID) espnToInternal[String(t.espnID)] = Number(t.id);
    });

    const handleTeamPress = () => {
      if (!item.teamId) return;
      const internalId = espnToInternal[item.teamId];
      if (!internalId) return;
      router.push(`/team/cbb/${teamId}`);
    };

    return (
      <View
        style={[
          styles.row,
          !isLastRow && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          },
          favorited && {
            backgroundColor: isDark
              ? Colors.dark.itemBackground
              : Colors.light.itemBackground,
          },
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{item.rank ?? "-"}</Text>
        </View>

        <TouchableOpacity onPress={handleTeamPress} style={styles.teamInfo}>
          {teamLogo && <Image source={teamLogo} style={styles.logo} />}
          <Text style={styles.collegeTeamName}>{teamCode}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightItem = ({
    item,
    isLastRow,
    showDivision,
  }: {
    item: any;
    isLastRow: boolean;
    showDivision: boolean;
  }) => {
    const team = getTeamByESPNId(item.teamId);
    const teamId = women ? team?.wid : team?.id;
    const favorited = team ? isFavorite(league, String(teamId)) : false;

    let streakText = "-";

    let streakColor = item.streak?.startsWith("W")
      ? isDark
        ? Colors.dark.leafGreen
        : Colors.light.green
      : item.streak?.startsWith("L")
        ? isDark
          ? Colors.dark.lightRed
          : Colors.light.red
        : isDark
          ? Colors.white
          : Colors.black;

    if (item.streak != null && item.streak !== "-") {
      const streakValue = Number(item.streak);

      if (!isNaN(streakValue)) {
        if (streakValue > 0) streakText = `W${streakValue}`;
        else if (streakValue < 0) streakText = `L${Math.abs(streakValue)}`;
      } else if (typeof item.streak === "string") {
        streakText = item.streak;
      }
    }

    return (
      <View
        style={[
          styles.row,
          !isLastRow && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          },
          favorited && {
            backgroundColor: isDark
              ? Colors.dark.itemBackground
              : Colors.light.itemBackground,
          },
        ]}
      >
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.overall}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.confOverall}</Text>
        </View>

        {showDivision && (
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.divisionOverall}</Text>
          </View>
        )}

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.homeOverall}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.awayOverall}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.gamesBehind}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={[styles.statText, { color: streakColor }]}>
            {streakText}
          </Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.vsAPTop25}</Text>
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
        <Text style={[styles.rankText, { fontFamily: Fonts.OSSEMIBOLD }]}>
          #
        </Text>
      </View>
      <Text style={styles.teamHeaderText}>Team</Text>
    </View>
  );

  const renderStatsHeader = (showDivision: boolean) => (
    <View style={styles.row}>
      {[
        "Overall",
        "Conference",
        ...(showDivision ? ["Division"] : []),
        "Home",
        "Away",
        "GB",
        "Streak",
        "vs Top 25",
        "Pts For",
        "Pts Against",
      ].map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  function ConferenceSection({
    title,
    data,
    isLast,
  }: {
    title: string;
    data: typeof safeStandings;
    isLast: boolean;
  }) {
    const divisions = data.reduce(
      (acc, team) => {
        const div = team.division || "Overall";
        if (!acc[div]) acc[div] = [];
        acc[div].push(team);
        return acc;
      },
      {} as Record<string, typeof data>,
    );

    const hasDivisions = Object.keys(divisions).length > 1;

    // ✅ only marginTop 12 on the header container (already what you're doing)
    return (
      <View style={[styles.wrapper, { marginBottom: isLast ? 0 : 12 }]}>
        <View style={styles.header}>
          <Text style={styles.heading}>{title}</Text>
        </View>
        {Object.keys(divisions).map((div) => (
          <View key={div}>
            {Object.keys(divisions).length > 1 && (
              <Text style={styles.collegeDivisionHeader}>{div}</Text>
            )}

            <View style={{ flexDirection: "row" }}>
              <FlatList
                data={divisions[div]}
                keyExtractor={(item) => item.teamId}
                renderItem={({ item, index }) =>
                  renderLeftItem({
                    item,
                    index,
                    isLastRow: index === divisions[div].length - 1,
                  })
                }
                scrollEnabled={false}
                ListHeaderComponent={renderHeader}
                stickyHeaderIndices={[0]}
              />
              <ScrollView
                horizontal
                style={{ width: 280 }}
                showsHorizontalScrollIndicator={false}
              >
                <FlatList
                  data={divisions[div]}
                  keyExtractor={(item) => item.teamId}
                  renderItem={({ item, index }) =>
                    renderRightItem({
                      item,
                      showDivision: hasDivisions,
                      isLastRow: index === divisions[div].length - 1,
                    })
                  }
                  scrollEnabled={false}
                  ListHeaderComponent={renderStatsHeader(hasDivisions)}
                  stickyHeaderIndices={[0]}
                />
              </ScrollView>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
    >
      {conferences.length > 0 ? (
        conferences.map((conf, index) => {
          const data = (grouped[conf] ?? [])
            .slice()
            .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

          return (
            <ConferenceSection
              key={conf}
              title={conf}
              data={data}
              isLast={index === conferences.length - 1}
            />
          );
        })
      ) : (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={styles.emptyText}>
            No standings found for{" "}
            {onlyTeamConference
              ? (teamConference ?? "team conference")
              : selectedConference}
            .
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
