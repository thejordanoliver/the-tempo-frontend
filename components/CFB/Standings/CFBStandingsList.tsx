import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "components/Dropdown";
import { StandingsSkeleton } from "components/Standings/StandingsSkeleton";
import { Colors } from "constants/Colors";
import { getTeamIdByESPN, getTeamLogoESPN } from "constants/teamsCFB";
import { useRouter } from "expo-router";
import { CFBTeamRank, useCFBRankings } from "hooks/CFBHooks/useCFBRankings";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { getStyles } from "styles/Standings.styles";
export const CFBStandingsList = () => {
  const { rankings = [], loading, error } = useCFBRankings();
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();
  // 🏈 Added "cfp" (Playoff Rankings)
  const [pollMode, setPollMode] = useState<"ap" | "coaches" | "cfp">("ap");


  if (loading)
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  const selectedPoll = rankings.find((r) => r.type === pollMode);
  const filteredRankings = selectedPoll?.ranks ?? [];
  const droppedOutTeams = selectedPoll?.droppedOut ?? [];

  const getConferenceAbbrev = (conf?: string) => {
    if (!conf) return "N/A";
    const name = conf.toLowerCase();

    if (name.includes("sun belt")) return "Sun Belt";

    if (name.includes("American")) return "AAC";
    return conf;
  };

  // --- Render functions ---
  const renderLeftItem = ({ item }: { item: CFBTeamRank; index: number }) => {
    const teamLogo = item.team
      ? getTeamLogoESPN(item.team.id, isDark)
      : undefined;

    const trendNum = Number(item.trend);
    const isUp = trendNum > 0;
    const isDown = trendNum < 0;

    return (
      <View style={styles.row}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{item.current}</Text>
        </View>

        <View style={styles.teamInfo}>
          <TouchableOpacity
            style={styles.teamInfoWrapper}
            onPress={() => {
              const internalId = getTeamIdByESPN(Number(item.team?.id));
              if (!internalId) return;
              router.push({
                pathname: "/team/cfb/[teamId]",
                params: { teamId: Number(internalId) }, // <-- force number
              });
            }}
          >
            {teamLogo && <Image source={teamLogo} style={styles.logo} />}
            <Text style={styles.collegeTeamName}>
              {item.team?.abbreviation || item.team?.nickname || "N/A"}
            </Text>
          </TouchableOpacity>

          {trendNum !== 0 && !isNaN(trendNum) && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={isUp ? "arrow-up" : "arrow-down"}
                size={10}
                color={
                  isUp
                    ? isDark
                      ? Colors.dark.limeGreen
                      : Colors.light.green // correct branch
                    : isDark
                    ? Colors.dark.lightRed
                    : Colors.light.red
                }
                style={{ marginRight: 2 }}
              />
              <Text
                style={[
                  styles.collegeTeamTrend,
                  {
                    color: isUp
                      ? isDark
                        ? Colors.dark.limeGreen
                        : Colors.light.green // correct branch
                      : isDark
                      ? Colors.dark.lightRed
                      : Colors.light.red,
                  },
                ]}
              >
                {Math.abs(trendNum)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderRightItem = ({ item }: { item: CFBTeamRank }) => (
    <View style={styles.row}>
      <View style={styles.statCell}>
        <Text style={styles.statText}>{item.recordSummary || "N/A"}</Text>
      </View>
      <View style={styles.statCell}>
        <Text style={styles.statText}>{item.points ?? 0}</Text>
      </View>
      <View style={styles.statCell}>
        <Text style={styles.statText}>{item.firstPlaceVotes ?? 0}</Text>
      </View>
      <View style={styles.statCell}>
        <Text style={styles.statText}>
          {getConferenceAbbrev(item.team?.groups?.shortName)}
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.row}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#</Text>
      </View>
      <Text style={styles.teamHeaderText}>Team</Text>
    </View>
  );

  const renderStatsHeader = () => (
    <View style={styles.row}>
      {["Record", "Points", "1st Votes", "Conference"].map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  const renderDroppedOut = () => {
    if (!droppedOutTeams.length) return null;

    return (
      <View style={{ marginTop: 24 }}>
        <View style={styles.header}>
          <Text style={styles.heading}>Dropped From Rankings</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {droppedOutTeams.map((item) => (
            <Text
              key={item.team?.id || `dropped-${item.previous}-${item.date}`}
              style={styles.droppedoutNames}
            >
              {item.team?.name || "Unknown"} ({item.previous})
            </Text>
          ))}
        </View>
      </View>
    );
  };

  function Section({ title, data }: { title: string; data: CFBTeamRank[] }) {
    return (
      <View style={{ marginTop: 24 }}>
        <View style={styles.header}>
          <Text style={styles.heading}>{title}</Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={data}
            keyExtractor={(item) =>
              item.team?.id || `dropped-${item.current}-${item.date}`
            }
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
              keyExtractor={(item) =>
                item.team?.id || `dropped-${item.current}-${item.date}`
              }
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
  const pollLabel =
    pollMode === "ap"
      ? "AP Poll"
      : pollMode === "coaches"
      ? "Coaches Poll"
      : "CFP Rankings";

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
    >
      {/* --- Dropdown Header --- */}
      <Dropdown
        options={[
          { label: "AP Poll", value: "ap" },
          { label: "Coaches Poll", value: "coaches" },
          { label: "CFP Rankings", value: "cfp" }, // 🏆 Added CFP
        ]}
        selectedValue={pollMode}
        onSelect={(value) => setPollMode(value as "ap" | "coaches" | "cfp")}
        isDark={isDark}
        absolute
      />

      {/* --- Rankings Section --- */}
      <Section title={pollLabel} data={filteredRankings} />

      {renderDroppedOut()}
    </ScrollView>
  );
};
