import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DraftLeague = "nba" | "wnba" | "nfl";

type DraftProspectAttribute = {
  name?: string | null;
  displayName?: string | null;
  abbreviation?: string | null;
  displayValue?: string | null;
  label?: string | null;
  abbr?: string | null;
  value?: string | null;
};

type DraftProspectPosition = {
  id?: string | number | null;
  name?: string | null;
  displayName?: string | null;
  abbreviation?: string | null;
};

type DraftProspectTeam = {
  location?: string | null;
  name?: string | null;
  abbreviation?: string | null;
  shortDisplayName?: string | null;
};

export type DraftProspect = {
  id?: string | number | null;
  guid?: string | null;
  alternativeId?: string | number | null;
  displayName?: string | null;
  name?: string | null;
  displayWeight?: string | null;
  displayHeight?: string | null;
  weight?: string | number | null;
  height?: string | number | null;
  position?: DraftProspectPosition | null;
  positionId?: string | number | null;
  team?: DraftProspectTeam | null;
  college?: string | null;
  collegeId?: string | null;
  attributes?: DraftProspectAttribute[] | null;
  headshot?: { href?: string | null } | string | null;
  link?: string | null;
};

export type DraftCurrent = {
  pickId?: string | number | null;
  next?: string | number | null;
  bestAvailable?: DraftProspect | null;
  bestFit?: DraftProspect | null;
  bestAvailablePicks?: DraftProspect[] | null;
};

type Props = {
  current?: DraftCurrent | null;
  league?: DraftLeague;
  maxBestAvailablePicks?: number;
};

const BASKETBALL_POSITION_MAP: Record<string, string> = {
  "1": "Point Guard",
  "2": "Shooting Guard",
  "3": "Guard",
  "5": "Small Forward",
  "6": "Power Forward",
  "7": "Forward",
  "9": "Center",
};

const NFL_POSITION_MAP: Record<string, string> = {
  "8": "Quarterback",
  "9": "Running Back",
  "1": "Wide Receiver",
  "7": "Tight End",
  "10": "Fullback",
  "46": "Offensive Tackle",
  "47": "Offensive Guard",
  "91": "Center",
  "32": "Defensive Tackle",
  "30": "Linebacker",
  "264": "EDGE",
  "29": "Cornerback",
  "36": "Safety",
  "96": "Long Snapper",
  "80": "Place Kicker",
  "94": "Punter",
};

const headshotPlaceholder =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781892365/playerPlaceholder_vi9zk3.png";

const getProspectName = (prospect?: DraftProspect | null) =>
  prospect?.displayName || prospect?.name || "Unknown Prospect";

const getHeadshotUri = (prospect?: DraftProspect | null) => {
  if (!prospect?.headshot) return null;

  if (typeof prospect.headshot === "string") {
    return prospect.headshot;
  }

  return prospect.headshot.href ?? null;
};

const getSchoolName = (prospect?: DraftProspect | null) => {
  if (!prospect) return "";

  return (
    prospect.team?.shortDisplayName ||
    prospect.team?.location ||
    prospect.college ||
    prospect.team?.name ||
    ""
  );
};

const getProspectPosition = (
  prospect: DraftProspect | null | undefined,
  league?: DraftLeague,
) => {
  if (!prospect) return "";

  const explicitPosition =
    prospect.position?.displayName ||
    prospect.position?.abbreviation ||
    prospect.position?.name;

  if (explicitPosition) return explicitPosition;

  const positionId = prospect.position?.id ?? prospect.positionId;
  if (positionId === undefined || positionId === null) return "";

  const lookup = league === "nfl" ? NFL_POSITION_MAP : BASKETBALL_POSITION_MAP;

  return lookup[String(positionId)] ?? "";
};

const getAttributeValue = (
  prospect: DraftProspect | null | undefined,
  names: string[],
) => {
  const attributes = prospect?.attributes ?? [];

  const match = attributes.find((attribute) => {
    const values = [
      attribute.name,
      attribute.displayName,
      attribute.abbreviation,
      attribute.label,
      attribute.abbr,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return names.some((name) => values.includes(name.toLowerCase()));
  });

  return match?.displayValue ?? match?.value ?? null;
};

const openProspectLink = async (link?: string | null) => {
  if (!link) return;

  try {
    await Linking.openURL(link);
  } catch {
    // Keep card press safe if ESPN link cannot open.
  }
};

function StatPill({
  label,
  value,
  isDark,
}: {
  label: string;
  value?: string | number | null;
  isDark: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;

  const styles = draftProspectBoardStyles(isDark);

  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ProspectAvatar({
  prospect,
  size = 58,
  isDark,
}: {
  prospect: DraftProspect;
  size?: number;
  isDark: boolean;
}) {
  const styles = draftProspectBoardStyles(isDark);
  const uri = getHeadshotUri(prospect);

  if (!uri) {
    return (
      <View
        style={[
          styles.avatarFallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Image
          source={{ uri: headshotPlaceholder }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      resizeMode="cover"
    />
  );
}

function FeaturedProspectCard({
  label,
  icon,
  prospect,
  league,
  isDark,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  prospect: DraftProspect;
  league?: DraftLeague;
  isDark: boolean;
}) {
  const styles = draftProspectBoardStyles(isDark);

  const name = getProspectName(prospect);
  const school = getSchoolName(prospect);
  const position = getProspectPosition(prospect, league);
  const overallRank = getAttributeValue(prospect, ["overall", "ovr rk"]);
  const positionRank = getAttributeValue(prospect, ["rank", "pos rk"]);
  const height = prospect.displayHeight || prospect.height;
  const weight = prospect.displayWeight || prospect.weight;

  return (
    <TouchableOpacity
      activeOpacity={prospect.link ? 0.85 : 1}
      onPress={() => openProspectLink(prospect.link)}
      disabled={!prospect.link}
      style={styles.featuredCard}
    >
      <View style={styles.featuredHeader}>
        <View style={styles.featuredLabelRow}>
          <Ionicons
            name={icon}
            size={15}
            color={isDark ? Colors.lightGray : Colors.darkGray}
          />
          <Text style={styles.featuredLabel}>{label}</Text>
        </View>
      </View>

      <View style={styles.featuredBody}>
        <ProspectAvatar prospect={prospect} isDark={isDark} />

        <View style={styles.featuredInfo}>
          <Text style={styles.prospectName} numberOfLines={1}>
            {name}
          </Text>

          <Text style={styles.prospectMeta} numberOfLines={1}>
            {[school, position].filter(Boolean).join(" • ")}
          </Text>

          <Text style={styles.prospectSubMeta} numberOfLines={1}>
            {[height, weight].filter(Boolean).join(" • ")}
          </Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <StatPill label="OVR RK" value={overallRank} isDark={isDark} />
        <StatPill label="POS RK" value={positionRank} isDark={isDark} />
      </View>
    </TouchableOpacity>
  );
}

function AvailableProspectCard({
  prospect,
  index,
  league,
  isDark,
}: {
  prospect: DraftProspect;
  index: number;
  league?: DraftLeague;
  isDark: boolean;
}) {
  const styles = draftProspectBoardStyles(isDark);

  const name = getProspectName(prospect);
  const school = getSchoolName(prospect);
  const position = getProspectPosition(prospect, league);
  const overallRank = getAttributeValue(prospect, ["overall", "ovr rk"]);
  const positionRank = getAttributeValue(prospect, ["rank", "pos rk"]);

  return (
    <View style={styles.availableCard}>
      <View style={styles.availableRankBadge}>
        <Text style={styles.availableRankText}>{index + 1}</Text>
      </View>

      <ProspectAvatar prospect={prospect} size={48} isDark={isDark} />

      <Text style={styles.availableName} numberOfLines={1}>
        {name}
      </Text>

      <Text style={styles.availableMeta} numberOfLines={1}>
        {[school, position].filter(Boolean).join(" • ")}
      </Text>

      <View style={styles.compactStatRow}>
        <StatPill label="OVR" value={overallRank} isDark={isDark} />
        <StatPill label="POS" value={positionRank} isDark={isDark} />
      </View>
    </View>
  );
}

export default function DraftProspectBoard({
  current,
  league = "nba",
  maxBestAvailablePicks = 8,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = draftProspectBoardStyles(isDark);

  const featuredProspects = useMemo(
    () =>
      [
        {
          key: "best-available",
          label: "Best Available",
          icon: "star-outline" as const,
          prospect: current?.bestAvailable ?? null,
        },
        {
          key: "best-fit",
          label: "Best Fit",
          icon: "sparkles-outline" as const,
          prospect: current?.bestFit ?? null,
        },
      ].filter((item) => item.prospect),
    [current?.bestAvailable, current?.bestFit],
  );

  const bestAvailablePicks = useMemo(
    () => (current?.bestAvailablePicks ?? []).slice(0, maxBestAvailablePicks),
    [current?.bestAvailablePicks, maxBestAvailablePicks],
  );

  if (!featuredProspects.length && !bestAvailablePicks.length) {
    return null;
  }

  const clockText =
    current?.pickId !== undefined && current?.pickId !== null
      ? `Pick ${current.pickId} on the clock`
      : current?.next !== undefined && current?.next !== null
        ? `Pick ${current.next} up next`
        : "Live draft board";

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>Draft Board</Text>
          <Text style={styles.title}>{clockText}</Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {featuredProspects.length ? (
        <View style={styles.featuredGrid}>
          {featuredProspects.map((item, index) =>
            item.prospect ? (
              <View
                key={item.key}
                style={index === 0 ? styles.firstFeaturedCardWrapper : null}
              >
                <FeaturedProspectCard
                  label={item.label}
                  icon={item.icon}
                  prospect={item.prospect}
                  league={league}
                  isDark={isDark}
                />
              </View>
            ) : null,
          )}
        </View>
      ) : null}

      {bestAvailablePicks.length ? (
        <View style={styles.availableSection}>
          <Text style={styles.availableTitle}>Best Available Picks</Text>

          <FlatList
            data={bestAvailablePicks}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) =>
              String(item.id ?? item.guid ?? item.alternativeId ?? index)
            }
            contentContainerStyle={styles.availableList}
            renderItem={({ item, index }) => (
              <AvailableProspectCard
                prospect={item}
                index={index}
                league={league}
                isDark={isDark}
              />
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

const draftProspectBoardStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 12,
      marginTop: 4,
      marginBottom: 12,
      padding: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? Colors.midTone : Colors.black,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    eyebrow: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: isDark ? Colors.lightGray : Colors.darkGray,
      opacity: 0.8,
    },
    title: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 19,
      color: isDark ? Colors.white : Colors.black,
      marginTop: 2,
    },
    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    liveText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      color: isDark ? Colors.white : Colors.black,
    },
    featuredGrid: {
      gap: 10,
    },
    firstFeaturedCardWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.midTone : Colors.black,
      paddingBottom: 10,
    },
    featuredCard: {
      padding: 12,
      borderRadius: 16,
    },
    featuredHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    featuredLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    featuredLabel: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    featuredBody: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    featuredInfo: {
      flex: 1,
    },
    prospectName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 17,
      color: isDark ? Colors.white : Colors.black,
    },
    prospectMeta: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: 2,
    },
    prospectSubMeta: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: 2,
      opacity: 0.8,
    },
    avatar: {
      width: 58,
      height: 58,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
      overflow: "hidden",
    },
    statRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    statLabel: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      letterSpacing: 0.4,
    },
    statValue: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      color: isDark ? Colors.white : Colors.black,
    },
    availableSection: {
      marginTop: 14,
    },
    availableTitle: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
      marginBottom: 10,
    },
    availableList: {
      gap: 10,
      paddingRight: 4,
    },
    availableCard: {
      width: 150,
      padding: 10,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    availableRankBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
      zIndex: 2,
    },
    availableRankText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      color: isDark ? Colors.white : Colors.black,
    },
    availableName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
      marginTop: 8,
    },
    availableMeta: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: 2,
    },
    compactStatRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
    },
  });
