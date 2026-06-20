// components/Sports/Soccer/Game/SoccerKeyEvents.tsx

import { getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { SoccerKeyEvent } from "@/hooks/SoccerHooks/useSoccerGameDetails";
import { formatPeriod } from "@/utils/games";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import HeadingTwo from "../../../Headings/HeadingTwo";

type Props = {
  keyEvents?: SoccerKeyEvent[] | null;
  loading?: boolean;

  awayTeamId?: number | string | null;
  homeTeamId?: number | string | null;

  awayLogo: any;
  homeLogo: any;
  awayCode: string;
  homeCode: string;

  awayTeamEspnId?: number | string | null;
  homeTeamEspnId?: number | string | null;

  isDark: boolean;
  gameStatusDescription?: string | null;
};

type SelectedTab = "all" | "away" | "home";
type KeyEventKind = "goal" | "yellow-card" | "red-card" | null;

type TeamTab = {
  key: SelectedTab;
  label: string;
  logo: any;
  ids: string[];
};

const hiddenStatuses = new Set([
  "Scheduled",
  "Canceled",
  "Cancelled",
  "Delayed",
  "Postponed",
]);

const eventPriority: Record<string, number> = {
  goal: 1,
  penaltyscored: 1,
  owngoal: 1,
  redcard: 2,
  yellowcard: 3,
  substitution: 4,
  halftime: 5,
  start2ndhalf: 5,
  kickoff: 5,
  endgame: 5,
  startdelay: 6,
  enddelay: 6,
};

function normalizeId(id?: number | string | null): string | null {
  if (id === null || id === undefined || id === "") return null;
  return String(id);
}

function normalizeEventType(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getEventType(event: SoccerKeyEvent) {
  const type = normalizeEventType(event.type?.type);
  const text = normalizeEventType(event.type?.text);

  return {
    normalized: type || text,
    combined: `${type} ${text}`.trim(),
  };
}

function getEventLabel(event: SoccerKeyEvent) {
  return event.type?.text || event.type?.type || "Event";
}

function getEventKind(event: SoccerKeyEvent): KeyEventKind {
  const { combined } = getEventType(event);

  if (combined.includes("redcard")) {
    return "red-card";
  }

  if (combined.includes("yellowcard")) {
    return "yellow-card";
  }

  if (
    event.scoringPlay ||
    combined.includes("goal") ||
    combined.includes("penaltyscored") ||
    combined.includes("owngoal")
  ) {
    return "goal";
  }

  return null;
}

function getEventTextColor(
  kind: KeyEventKind,
  isDark: boolean,
): string | undefined {
  if (kind === "red-card")
    return isDark ? Colors.dark.lightRed : Colors.light.red;
  if (kind === "yellow-card")
    return isDark ? Colors.dark.yellow : Colors.light.yellow;
  if (kind === "goal")
    return isDark ? Colors.dark.limeGreen : Colors.light.green;

  return undefined;
}

function getMainText(event: SoccerKeyEvent) {
  return event.shortText || event.text || getEventLabel(event);
}

function getParticipantText(event: SoccerKeyEvent) {
  const participants = Array.isArray(event.participants)
    ? event.participants
        .map((participant) => participant?.athlete?.displayName)
        .filter(Boolean)
    : [];

  return participants.join(" • ");
}

function getSortValue(event: SoccerKeyEvent, index: number) {
  const period = Number(event.period?.number ?? 0);
  const clock = Number(event.clock?.value ?? 0);
  const { normalized } = getEventType(event);
  const priority = eventPriority[normalized] ?? 99;

  return period * 100000 + clock * 10 + priority + index / 1000;
}

function getImageSource(image: any): ImageSourcePropType | null {
  if (!image) return null;

  if (typeof image === "string") {
    return { uri: image };
  }

  return image;
}

export default function SoccerKeyEvents({
  keyEvents = [],
  loading = false,

  awayTeamId,
  homeTeamId,

  awayLogo,
  homeLogo,
  awayCode,
  homeCode,

  awayTeamEspnId,
  homeTeamEspnId,

  isDark,
  gameStatusDescription,
}: Props) {
  const styles = SoccerKeyEventsStyles(isDark);
  const global = globalStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<SelectedTab>("all");

  const events = useMemo(() => {
    if (!Array.isArray(keyEvents)) return [];

    return [...keyEvents].filter(Boolean).sort((a, b) => {
      const aIndex = keyEvents.indexOf(a);
      const bIndex = keyEvents.indexOf(b);

      return getSortValue(a, aIndex) - getSortValue(b, bIndex);
    });
  }, [keyEvents]);

  const tabs = useMemo<TeamTab[]>(
    () => [
      {
        key: "all",
        label: "ALL",
        logo: null,
        ids: [],
      },
      {
        key: "away",
        label: awayCode ?? "Away",
        logo: awayLogo,
        ids: [awayTeamId, awayTeamEspnId]
          .map(normalizeId)
          .filter((id): id is string => Boolean(id)),
      },
      {
        key: "home",
        label: homeCode ?? "Home",
        logo: homeLogo,
        ids: [homeTeamId, homeTeamEspnId]
          .map(normalizeId)
          .filter((id): id is string => Boolean(id)),
      },
    ],
    [
      awayCode,
      awayLogo,
      awayTeamId,
      awayTeamEspnId,
      homeCode,
      homeLogo,
      homeTeamId,
      homeTeamEspnId,
    ],
  );

  const selectedTeam = useMemo(() => {
    return tabs.find((team) => team.key === selectedTab);
  }, [tabs, selectedTab]);

  const filteredEvents = useMemo(() => {
    if (selectedTab === "all" || !selectedTeam) return events;

    return events.filter((event) => {
      const eventTeamId = normalizeId(event.team?.id);

      if (!eventTeamId) return false;

      return selectedTeam.ids.includes(eventTeamId);
    });
  }, [events, selectedTab, selectedTeam]);

  if (!loading && events.length === 0) return null;

  if (gameStatusDescription && hiddenStatuses.has(gameStatusDescription)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Key Events</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((tab) => tab.key)}
          selected={selectedTab}
          onTabPress={(tabKey) => setSelectedTab(tabKey as SelectedTab)}
          isDark={isDark}
          renderLabel={(tabKey, isSelected, tabStyles) => {
            const team = tabs.find((tab) => tab.key === tabKey);

            if (!team) return null;

            const logoSource = getImageSource(team.logo);

            return (
              <View style={styles.tabLabel}>
                {logoSource && (
                  <Image
                    source={logoSource}
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

        <View style={styles.listContainer}>
          {filteredEvents.map((event, index) => {
            const kind = getEventKind(event);
            const eventColor = getEventTextColor(kind, isDark);
            const eventColorStyle: TextStyle | undefined = eventColor
              ? { color: eventColor }
              : undefined;

            const period = formatPeriod({
              period: event.period?.number ?? null,
              isSOCC: true,
            });
            const clock = event.clock?.displayValue || "";
            const participantText = getParticipantText(event);
            const eventText = getMainText(event);

            const teamId = Number(event?.team?.id) || 0;
            const teamLogo = teamId ? getSOCCTeamLogo(teamId, isDark) : null;
            const teamLogoSource = getImageSource(teamLogo);

            return (
              <View
                key={`${event.id ?? "soccer-key-event"}-${index}`}
                style={styles.eventRow}
              >
                <View style={styles.timeColumn}>
                  <Text style={styles.periodText}>{period}</Text>
                  {!!clock && <Text style={styles.clockText}>{clock}</Text>}
                </View>

                <View style={styles.eventBody}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventType, eventColorStyle]}>
                      {getEventLabel(event)}
                    </Text>

                    {!!teamId && teamLogoSource && (
                      <Image style={styles.tabLogo} source={teamLogoSource} />
                    )}
                  </View>

                  <Text style={[styles.eventText, eventColorStyle]}>
                    {eventText}
                  </Text>

                  {!!participantText && (
                    <Text style={[styles.participantsText, eventColorStyle]}>
                      {participantText}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          {filteredEvents.length === 0 && !loading && (
            <Text style={global.emptyText}>No key events for this team.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const SoccerKeyEventsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
    },
    wrapper: {
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
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
    listContainer: {
      marginTop: 12,
    },
    eventRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.midTone : Colors.lightGray,
    },
    timeColumn: {
      flexDirection: "row",
      gap: 4,
      width: 48,
      alignItems: "center",
    },
    periodText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 12,
    },
    clockText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.midTone : Colors.darkGray,
      fontSize: 12,
    },
    eventBody: {
      flex: 1,
    },
    eventHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    eventType: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 13,
      flexShrink: 1,
    },
    eventText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 12,
      lineHeight: 18,
    },
    participantsText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.midTone : Colors.darkGray,
      fontSize: 12,
      marginTop: 4,
    },
  });
