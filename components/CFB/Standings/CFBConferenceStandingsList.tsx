import { useRoute } from "@react-navigation/native";
import { Fonts } from "constants/fonts";
import { getTeamCodeESPN, getTeamLogoESPN } from "constants/teamsCFB";
import { useCFBConferenceStandings } from "hooks/CFBHooks/useCFBConferenceStandings";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  useColorScheme,
  View, TouchableOpacity
} from "react-native";
import { getStyles } from "styles/Standings.styles";
import { useRouter } from "expo-router";
import { teams } from "constants/teamsCFB"; // your internal teams array

type Props = {
  selectedConference: string;
};



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

export const CFBConferenceStandingsList = ({ selectedConference }: Props) => {
  const { standings, loading, error } = useCFBConferenceStandings();
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
const router = useRouter(); // ✅ this gives you .push()


  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            color: isDark ? "#aaa" : "#666",
            fontFamily: Fonts.OSLIGHT,
          }}
        >
          Loading Conference Standings...
        </Text>
      </View>
    );

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  // --- Group by conference ---
  const grouped = standings.reduce((acc, team) => {
    if (!acc[team.conference]) acc[team.conference] = [];
    acc[team.conference].push(team);
    return acc;
  }, {} as Record<string, typeof standings>);

  const normalizedConference =
    CONFERENCE_ALIASES[selectedConference] || selectedConference;
  const conferences =
    selectedConference === "Top 25"
      ? Object.keys(grouped).sort()
      : Object.keys(grouped).filter((c) => c === normalizedConference);


  

  // --- Render Functions ---
  const renderLeftItem = ({ item }: { item: any }) => {
    const teamLogo = getTeamLogoESPN(item.teamId, isDark);
    const teamCode = getTeamCodeESPN(item.teamId);

// --- ESPN → internal mapping ---
const espnToInternal: Record<string, number> = {};
teams.forEach((t) => {
  if (t.espnID) espnToInternal[String(t.espnID)] = Number(t.id);
});


const handleTeamPress = () => {
  if (!item.teamId) return;

  // Map ESPN ID to internal ID
  const internalId = espnToInternal[item.teamId];
  if (!internalId) return;

  // Navigate using your internal ID
  router.push(`/team/cfb/${internalId}`);
};

  return (
    <TouchableOpacity
      onPress={handleTeamPress}
      style={[
        styles.row,
        { borderBottomColor: isDark ? "#333" : "#ccc", alignItems: "center" },
      ]}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{item.rank ?? "-"}</Text>
      </View>
      <View style={styles.teamInfo}>
        {teamLogo && <Image source={teamLogo} style={styles.logo} />}
        <Text style={styles.collegeTeamName}>{teamCode}</Text>
      </View>
    </TouchableOpacity>
  );
};
  const renderRightItem = ({
    item,
    showDivision,
  }: {
    item: any;
    showDivision: boolean;
  }) => {
    // Determine streak display and color
    let streakText = "-";
    let streakColor = isDark ? "#fff" : "#1d1d1d";

    if (item.streak != null && item.streak !== "-") {
      const streakValue = Number(item.streak);
      if (!isNaN(streakValue)) {
        if (streakValue > 0) {
          streakText = `W${streakValue}`;
          streakColor = "#2ecc71"; // green for win streak
        } else if (streakValue < 0) {
          streakText = `L${Math.abs(streakValue)}`;
          streakColor = "#e74c3c"; // red for loss streak
        }
      } else if (typeof item.streak === "string") {
        // Handle ESPN's string-based format like "W6" or "L2"
        streakText = item.streak;
        streakColor = item.streak.startsWith("W")
          ? "#2ecc71"
          : item.streak.startsWith("L")
          ? "#e74c3c"
          : isDark
          ? "#fff"
          : "#1d1d1d";
      }
    }

    return (
      <View
        style={[
          styles.row,
          { borderBottomColor: isDark ? "#333" : "#ccc", flexDirection: "row" },
        ]}
      >
        <View style={styles.statCell}>
          <Text
            style={[styles.statText, { color: isDark ? "#fff" : "#1d1d1d" }]}
          >
            {item.overall}
          </Text>
        </View>
        <View style={styles.statCell}>
          <Text
            style={[styles.statText, { color: isDark ? "#fff" : "#1d1d1d" }]}
          >
            {item.confOverall}
          </Text>
        </View>

        {showDivision && (
          <View style={styles.statCell}>
            <Text
              style={[styles.statText, { color: isDark ? "#fff" : "#1d1d1d" }]}
            >
              {item.divisionOverall}
            </Text>
          </View>
        )}

        <View style={styles.statCell}>
          <Text
            style={[styles.statText, { color: isDark ? "#fff" : "#1d1d1d" }]}
          >
            {item.homeOverall}
          </Text>
        </View>
        <View style={styles.statCell}>
          <Text
            style={[styles.statText, { color: isDark ? "#fff" : "#1d1d1d" }]}
          >
            {item.awayOverall}
          </Text>
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
    <View
      style={[
        styles.row,
        {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#444" : "#ccc",
          alignItems: "center",
        },
      ]}
    >
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { fontFamily: Fonts.OSSEMIBOLD }]}>
          #
        </Text>
      </View>
      <Text
        style={[styles.teamHeaderText, { color: isDark ? "#fff" : "#1d1d1d" }]}
      >
        Team
      </Text>
    </View>
  );

  const renderStatsHeader = (showDivision: boolean) => (
    <View
      style={[
        styles.row,
        {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#444" : "#ccc",
        },
      ]}
    >
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
          <Text
            style={[
              styles.statText,
              {
                fontFamily: Fonts.OSSEMIBOLD,
                color: isDark ? "#fff" : "#1d1d1d",
              },
            ]}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );

  function ConferenceSection({
    title,
    data,
  }: {
    title: string;
    data: typeof standings;
  }) {
    const divisions = data.reduce((acc, team) => {
      const div = team.division || "Overall";
      if (!acc[div]) acc[div] = [];
      acc[div].push(team);
      return acc;
    }, {} as Record<string, typeof data>);
    const hasDivisions = Object.keys(divisions).length > 1;

    return (
      <View style={{ marginTop: 12 }}>
        <View
          style={[
            styles.header,
            { borderBottomColor: isDark ? "#444" : "#ccc" },
          ]}
        >
          <Text
            style={[
              styles.heading,
              {
                color: isDark ? "#fff" : "#1d1d1d",
                fontSize: 20,
                fontFamily: Fonts.OSSEMIBOLD,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        {Object.keys(divisions).map((div) => (
          <View key={div} style={{ marginTop: 8 }}>
            {Object.keys(divisions).length > 1 && (
              <Text
                style={{
                  fontFamily: Fonts.OSSEMIBOLD,
                  color: isDark ? "#aaa" : "#555",
                  fontSize: 16,
                  marginBottom: 4,
                  marginLeft: 4,
                }}
              >
                {div}
              </Text>
            )}

            <View style={{ flexDirection: "row" }}>
              <FlatList
                data={divisions[div]}
                keyExtractor={(item) => item.teamId}
                renderItem={renderLeftItem}
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
                  renderItem={({ item }) =>
                    renderRightItem({ item, showDivision: hasDivisions })
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
        conferences.map((conf) => (
          <ConferenceSection
            key={conf}
            title={conf}
            data={grouped[conf].sort(
              (a, b) => (a.rank ?? 999) - (b.rank ?? 999)
            )}
          />
        ))
      ) : (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text
            style={{
              color: isDark ? "#aaa" : "#333",
              fontFamily: Fonts.OSLIGHT,
            }}
          >
            No standings found for {selectedConference}.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
