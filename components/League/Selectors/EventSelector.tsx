import Dropdown from "components/Dropdown";
import SelectorSkeleton from "components/Skeletons/SelectorSkeleton";
import { DATE_SELECTOR_SIDE_PADDING } from "constants/dateSelectorConstants";
import { useMemo, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

type CalendarEvent = {
  label: string;
  startDate: string;
  endDate?: string | null;
};

type Props = {
  events: CalendarEvent[];
  selectedEventIndex?: number;
  onSelectEvent: (index: number) => void;
  isDark: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function getDefaultUFCEventIndex(events: CalendarEvent[]) {
  if (!events.length) return 0;

  const now = Date.now();

  const currentIndex = events.findIndex((event) => {
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate ?? event.startDate).getTime();

    return (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start <= now &&
      now <= end
    );
  });

  if (currentIndex >= 0) return currentIndex;

  const upcomingIndex = events.findIndex((event) => {
    const start = new Date(event.startDate).getTime();
    return Number.isFinite(start) && start >= now;
  });

  return upcomingIndex >= 0 ? upcomingIndex : events.length - 1;
}

export default function EventSelector({
  events,
  selectedEventIndex,
  onSelectEvent,
  isDark,
  loading = false,
  children,
}: Props) {
  const { width } = useWindowDimensions();
  const selectorWidth = Math.min(480, width - 2 * DATE_SELECTOR_SIDE_PADDING);
  const options = useMemo(
    () =>
      events.map((event, index) => ({
        label: event.label.trim() || "Event",
        value: String(index),
      })),
    [events],
  );

  if (!options.length) {
    return (
      <>
        {loading && (
          <SelectorSkeleton
            itemCount={1}
            itemWidth={selectorWidth}
            itemHeight={38}
          />
        )}
        {children}
      </>
    );
  }

  const index = selectedEventIndex ?? getDefaultUFCEventIndex(events);
  const safeIndex = Math.min(Math.max(index, 0), options.length - 1);

  return (
    <Dropdown
      options={options}
      accessibilityLabel="Select event"
      selectedValue={String(safeIndex)}
      onSelect={(value) => onSelectEvent(Number(value))}
      isDark={isDark}
      width={selectorWidth}
      style={styles.selector}
      triggerIcon="calendar-outline"
      labelLines={2}
      scrollToSelected
    >
      {children}
    </Dropdown>
  );
}

const styles = StyleSheet.create({
  selector: {
    marginHorizontal: DATE_SELECTOR_SIDE_PADDING,
    marginVertical: 8,
  },
});
