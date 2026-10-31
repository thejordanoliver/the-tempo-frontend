import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LEAGUE_CONFIG } from "constants/leagues";
import { TICKER_TEAMS } from "constants/tickerTeams";
import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, Text, View } from "react-native";
import DraggableFlatList, {
  type DraggableFlatListProps,
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { Colors } from "constants/styles";
import { useTickerReorderScroll } from "hooks/TickerHooks/useTickerReorderScroll";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { hasBlockingTickerCommand } from "services/ticker/controller";
import { LEAGUES } from "services/ticker/protocol";
import { MAX_ROTATION_ENTRIES } from "services/ticker/rotation";
import { useTickerController, useTickerStore } from "store/tickerStore";
import { tickerRotationStyles as styles } from "styles/TickerStyles/TickerRotationStyles";
import type { SupportedTickerLeague, TickerRotationEntry } from "types/ticker";
import TickerSelectionSheet from "./TickerSelectionSheet";
import { TickerSettingOption } from "./TickerSettingsSection";
import { TickerAction } from "./TickerUI";

const VIEW_LABELS = {
  scores: "League scores",
  schedule: "Team schedule",
  ap: "AP Top 25",
  coaches: "Coaches Top 25",
  cfp: "College Football Playoff",
  favorites: "Saved favorite teams",
};
const teamsFor = (league: SupportedTickerLeague) =>
  TICKER_TEAMS[league]
    .filter(
      (team) =>
        team.id > 0 &&
        team.id <= 0xffffff &&
        team.isActive &&
        !team.isAllStar &&
        !team.isNational,
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

type RotationDraft = { id: string; entry: TickerRotationEntry };
type DragAnimationValues = Parameters<
  NonNullable<DraggableFlatListProps<RotationDraft>["onAnimValInit"]>
>[0];
type Picker = { id: string; type: "league" | "view" | "team" } | null;
export default function TickerRotationControl() {
  const state = useTickerStore();
  return (
    <RotationEditor
      key={`${state.connection}:${state.selectedDevice?.id ?? "none"}`}
    />
  );
}
function RotationEditor() {
  const state = useTickerStore();
  const ticker = useTickerController();
  const { text, colors, isDark } = useTickerTheme();
  const [expanded, setExpanded] = useState(false);
  const [rows, setRows] = useState<RotationDraft[]>([]);
  const [dragging, setDragging] = useState(false);
  const pageScroll = useTickerReorderScroll();
  const { beginDrag, moveDrag, releaseDrag, finishDrag, hold, cancelHold } =
    pageScroll;
  const [dragAnimation, setDragAnimation] =
    useState<DragAnimationValues | null>(null);
  const idleTranslation = useSharedValue(0);
  const translation = dragAnimation?.touchTranslate ?? idleTranslation;
  useAnimatedReaction(
    () => translation.value,
    (value) => {
      runOnJS(moveDrag)(value);
    },
    [translation, moveDrag],
  );
  useEffect(() => () => finishDrag(), [finishDrag]);
  const nextId = useRef(0);
  const entries = rows.map((row) => row.entry);
  const createRow = (entry: TickerRotationEntry): RotationDraft => ({
    id: `rotation-${nextId.current++}`,
    entry: { ...entry },
  });
  const [picker, setPicker] = useState<Picker>(null);
  const supported = state.status?.capabilities.includes("rotation_commit");
  const disabled =
    state.connection !== "connected" ||
    !state.authorized ||
    state.authorizing ||
    state.renaming ||
    state.syncingFavorites ||
    state.savingCustomHeader ||
    state.savingRotation ||
    hasBlockingTickerCommand(state.pendingCommands);
  const locked = disabled || dragging;
  const active = state.settings?.viewMode === "rotation";
  const needsTeam = entries.some(
    (entry) => entry.view === "schedule" && !entry.teamId,
  );
  const available = supported && state.rotationAvailable;
  const selected = picker
    ? rows.find((row) => row.id === picker.id)?.entry
    : null;
  const league = selected?.league ?? "nba";
  const college = ["cfb", "mcbb", "wcbb"].includes(league);
  const update = (id: string, patch: Partial<TickerRotationEntry>) =>
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, entry: { ...row.entry, ...patch } } : row,
      ),
    );
  const move = (id: string, direction: number) =>
    setRows((current) => {
      const from = current.findIndex((row) => row.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  const toggle = () => {
    if (!expanded) setRows((state.rotationEntries ?? []).map(createRow));
    setExpanded(!expanded);
  };
  const pickerItems =
    picker?.type === "league"
      ? LEAGUES.map((id) => ({
          id,
          name: LEAGUE_CONFIG[id].label,
          logo: isDark ? LEAGUE_CONFIG[id].logoLight : LEAGUE_CONFIG[id].logo,
          primaryColor: LEAGUE_CONFIG[id].color,
        }))
      : picker?.type === "team"
        ? teamsFor(league).map((team) => ({
            id: String(team.id),
            name: team.fullName,
            searchTerms: `${team.shortName ?? ""} ${team.code}`,
            logo: isDark ? (team.logoLight ?? team.logo) : team.logo,
            primaryColor: team.primaryColor ?? undefined,
          }))
        : Object.entries(VIEW_LABELS)
            .filter(
              ([view]) =>
                !["ap", "coaches", "cfp"].includes(view) ||
                (college && (view !== "cfp" || league === "cfb")),
            )
            .map(([id, name]) => ({ id, name }));
  return (
    <>
      <TickerSettingOption
        label="Custom rotation"
        value={
          active
            ? "Active"
            : state.rotationEntries?.length
              ? `${state.rotationEntries.length} saved items`
              : "Set up"
        }
        description={
          !supported
            ? "Requires ticker firmware 0.12.0 or newer."
            : (state.rotationIssue ??
              "Mix leagues, schedules, rankings, and favorites in your own order.")
        }
        expanded={expanded}
        disabled={!available || locked}
        onPress={toggle}
      />
      {expanded && (
        <>
          <Text style={text.caption}>
            Each item plays through once, then the next begins. Empty slates
            advance after one card interval. Your saved rotation runs without
            the app connected.
          </Text>
          <Text style={text.caption}>
            Touch and hold the drag handle to reorder. Release to snap an item
            into place. Drag near the screen edge to scroll farther.
          </Text>
          <DraggableFlatList<RotationDraft>
            data={rows}
            keyExtractor={(item) => item.id}
            extraData={{ locked, picker, isDark }}
            initialNumToRender={MAX_ROTATION_ENTRIES}
            removeClippedSubviews={false}
            activationDistance={8}
            scrollEnabled={false}
            outerScrollOffset={pageScroll.scrollOffset}
            autoscrollThreshold={1}
            autoscrollSpeed={0}
            onAnimValInit={setDragAnimation}
            onRelease={releaseDrag}
            animationConfig={{
              damping: 22,
              stiffness: 180,
              mass: 0.4,
              overshootClamping: true,
            }}
            onDragBegin={() => {
              beginDrag();
              setDragging(true);
            }}
            onDragEnd={({ data, from, to }) => {
              setRows(data);
              setDragging(false);
              finishDrag();
              if (from !== to)
                AccessibilityInfo.announceForAccessibility(
                  `Item ${from + 1} moved to position ${to + 1} of ${data.length}.`,
                );
            }}
            renderItem={({
              item,
              getIndex,
              drag,
              isActive,
            }: RenderItemParams<RotationDraft>) => {
              const index =
                getIndex() ?? rows.findIndex((row) => row.id === item.id);
              const entry = item.entry;
              return (
                <ScaleDecorator activeScale={1.015}>
                  <View
                    style={[
                      styles.item,
                      {
                        borderColor: isActive ? colors.blue : colors.gray,
                        backgroundColor: isActive
                          ? colors.itemBackground
                          : colors.background,
                      },
                      isActive && styles.draggingItem,
                    ]}
                  >
                    <View style={styles.itemHeader}>
                      <Pressable
                        accessibilityRole="adjustable"
                        accessibilityLabel={`Reorder item ${index + 1}`}
                        accessibilityHint="Touch and hold, then drag. Swipe up or down to change position with a screen reader."
                        accessibilityValue={{
                          min: 1,
                          max: rows.length,
                          now: index + 1,
                        }}
                        accessibilityState={{ disabled: locked }}
                        accessibilityActions={[
                          { name: "increment", label: "Move down" },
                          { name: "decrement", label: "Move up" },
                        ]}
                        onAccessibilityAction={({ nativeEvent }) => {
                          if (locked) return;
                          if (nativeEvent.actionName === "increment")
                            move(item.id, 1);
                          if (nativeEvent.actionName === "decrement")
                            move(item.id, -1);
                        }}
                        disabled={locked}
                        delayLongPress={180}
                        onPressIn={(event) => hold(event.nativeEvent.pageY)}
                        onPressOut={cancelHold}
                        onLongPress={drag}
                        style={({ pressed }) => [
                          styles.iconButton,
                          disabled && styles.muted,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="reorder-three-outline"
                          size={24}
                          color={isActive ? colors.blue : colors.icon}
                          accessible={false}
                        />
                      </Pressable>
                      <Text style={[text.label, styles.title]}>
                        Item {index + 1}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove item ${index + 1}`}
                        accessibilityState={{ disabled: locked }}
                        disabled={locked}
                        onPress={() =>
                          setRows((current) =>
                            current.filter((row) => row.id !== item.id),
                          )
                        }
                        style={({ pressed }) => [
                          styles.iconButton,
                          locked && styles.muted,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color={
                            isDark ? Colors.dark.lightRed : Colors.light.red
                          }
                          accessible={false}
                        />
                      </Pressable>
                    </View>
                    <TickerSettingOption
                      label="League"
                      value={
                        entry.league
                          ? LEAGUE_CONFIG[entry.league].label
                          : "Across your leagues"
                      }
                      disabled={locked || isActive}
                      onPress={() => setPicker({ id: item.id, type: "league" })}
                    />
                    <TickerSettingOption
                      label="Content"
                      value={VIEW_LABELS[entry.view]}
                      disabled={locked || isActive}
                      onPress={() => setPicker({ id: item.id, type: "view" })}
                    />
                    {entry.view === "schedule" && (
                      <TickerSettingOption
                        label="Team"
                        value={
                          teamsFor(entry.league!).find(
                            (team) => team.id === entry.teamId,
                          )?.fullName ?? "Choose a team"
                        }
                        disabled={locked || isActive}
                        onPress={() => setPicker({ id: item.id, type: "team" })}
                      />
                    )}
                    {entry.view === "favorites" && (
                      <Text style={text.caption}>
                        Uses the favorite teams last synced to this ticker. Sync
                        them from Content → Favorites before starting this
                        rotation.
                      </Text>
                    )}
                    <Text style={text.secondaryText}>
                      {entry.seconds} seconds per{" "}
                      {entry.view === "ap" ||
                      entry.view === "coaches" ||
                      entry.view === "cfp"
                        ? "ranked team"
                        : "game"}
                    </Text>
                    <Slider
                      accessibilityLabel={`Seconds per card for rotation item ${index + 1}`}
                      minimumValue={3}
                      maximumValue={60}
                      step={1}
                      value={entry.seconds}
                      disabled={locked || isActive}
                      minimumTrackTintColor={colors.text}
                      maximumTrackTintColor={colors.gray}
                      thumbTintColor={colors.text}
                      onValueChange={(seconds) =>
                        update(item.id, { seconds: Math.round(seconds) })
                      }
                    />
                  </View>
                </ScaleDecorator>
              );
            }}
          />
          <TickerSettingOption
            label="Add rotation item"
            value={`${entries.length}/${MAX_ROTATION_ENTRIES}`}
            icon="add-circle-outline"
            disabled={locked || entries.length >= MAX_ROTATION_ENTRIES}
            onPress={() => {
              const row = createRow({
                league: state.settings?.selectedLeague ?? "nba",
                view: "scores",
                teamId: null,
                seconds: state.settings?.durationSeconds ?? 6,
              });
              setRows((current) =>
                current.length < MAX_ROTATION_ENTRIES
                  ? [...current, row]
                  : current,
              );
            }}
          />
          {needsTeam && (
            <Text style={text.caption}>
              Choose a team for each schedule before saving.
            </Text>
          )}
          {state.error && (
            <Text accessibilityRole="alert" style={text.errorText}>
              {state.error}
            </Text>
          )}
          <TickerAction
            label={
              state.savingRotation
                ? "Saving rotation…"
                : "Save & start rotation"
            }
            disabled={locked || !entries.length || needsTeam}
            onPress={async () => {
              if (await ticker.saveRotation(entries)) setExpanded(false);
            }}
          />
          {active && (
            <TickerSettingOption
              label="Stop custom rotation"
              description="Return to league scores. Your saved list is kept."
              disabled={locked}
              onPress={() =>
                void ticker.command({ type: "set_view", value: "scores" })
              }
            />
          )}
        </>
      )}
      <TickerSelectionSheet
        visible={picker !== null}
        key={picker ? `${picker.id}:${picker.type}` : "closed"}
        title={
          picker?.type === "league"
            ? "Choose a league"
            : picker?.type === "team"
              ? "Choose a team"
              : "Choose rotation content"
        }
        subtitle={
          picker?.type === "view" ? LEAGUE_CONFIG[league].label : undefined
        }
        items={pickerItems}
        searchable={picker?.type === "team"}
        disabled={locked}
        selectedId={
          picker?.type === "league"
            ? selected?.league
            : picker?.type === "team"
              ? String(selected?.teamId)
              : selected?.view
        }
        onClose={() => setPicker(null)}
        onSelect={async (id) => {
          if (!picker || !selected || locked) return false;
          if (picker.type === "league")
            update(picker.id, {
              league: id as SupportedTickerLeague,
              view: "scores",
              teamId: null,
            });
          else if (picker.type === "team")
            update(picker.id, { teamId: Number(id) });
          else {
            const view = id as TickerRotationEntry["view"];
            update(picker.id, {
              view,
              league: view === "favorites" ? null : league,
              teamId: null,
            });
          }
          return true;
        }}
      />
    </>
  );
}
