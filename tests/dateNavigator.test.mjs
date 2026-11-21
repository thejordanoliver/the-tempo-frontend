import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { flush, sportsHookHarness } from "./helpers/sportsHookHarness.mjs";

const require = createRequire(import.meta.url);
dayjs.extend(utc);
dayjs.extend(timezone);

function harness({ reduceMotion = false } = {}) {
  const h = sportsHookHarness();
  Object.assign(h.modules, {
    "react/jsx-runtime": require("react/jsx-runtime"),
    "react-native": {
      Modal: "NativeModal",
      Pressable: "Pressable",
      TouchableOpacity: "TouchableOpacity",
      View: "View",
      Text: "Text",
      Image: "Image",
      StyleSheet: { create: (styles) => styles, absoluteFill: {} },
    },
    "@expo/vector-icons": { Ionicons: "Icon" },
    "expo-blur": { BlurView: "BlurView" },
    "react-native-calendars": {
      Calendar: "Calendar",
      LocaleConfig: { locales: {} },
    },
    "contexts/PreferencesContext": {
      usePreferences: () => ({ resolvedColorScheme: "light" }),
    },
    "hooks/useReducedMotion": { useReducedMotion: () => reduceMotion },
  });
  return h;
}

function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return;
  if (predicate(tree)) return tree;
  for (const child of [tree.props?.children].flat(Infinity)) {
    const found = find(child, predicate);
    if (found) return found;
  }
}

const calendarProps = {
  visible: true,
  selectedDate: "2026-10-31",
  markedDates: { "2026-10-31": { marked: true, dotColor: "red" } },
  onClose() {},
  onSelectDate() {},
};

test("calendar opens with a native modal and does no calendar work while closed", () => {
  for (const reduceMotion of [false, true]) {
    const h = harness({ reduceMotion });
    // The harness rejects imports of react-native-modal, whose interaction
    // handles crash on React Native 0.88.
    const CalendarModal = h.load("components/CalendarModal.tsx").default;
    const modal = CalendarModal(calendarProps);
    assert.equal(modal.type, "NativeModal");
    assert.equal(modal.props.visible, true);
    assert.equal(modal.props.animationType, reduceMotion ? "none" : "fade");
    assert.equal(
      CalendarModal({ ...calendarProps, visible: false }).props.children,
      null,
    );

    const content = modal.props.children;
    h.start(content.type, [content.props]);
    const calendar = find(h.state, (node) => node.type === "Calendar");
    assert.equal(calendar.props.initialDate, "2026-10-31");
    assert.equal(calendar.props.markedDates["2026-10-31"].selected, true);
    assert.equal(calendar.props.markedDates["2026-10-31"].dotColor, "red");
    h.stop();
  }
});

test("month browsing and repeated Today jumps preserve markers without duplicate month notifications", async () => {
  const h = harness();
  const months = [];
  const CalendarModal = h.load("components/CalendarModal.tsx").default;
  const { props, type } = CalendarModal({
    ...calendarProps,
    onMonthChange: (month) => months.push(month),
  }).props.children;
  h.start(type, [props]);
  const calendar = () => find(h.state, (node) => node.type === "Calendar");
  const todayButton = () =>
    find(
      h.state,
      (node) =>
        node.type === "TouchableOpacity" &&
        find(node, (child) => child.props?.children === "Today"),
    );
  const today = dayjs().tz("America/New_York").format("YYYY-MM-DD");

  for (const month of ["2030-01-01", "2030-02-01"]) {
    const data = { year: 2030, month: Number(month.slice(5, 7)) };
    calendar().props.onMonthChange(data);
    calendar().props.onMonthChange(data);
    await flush();
    assert.equal(calendar().props.initialDate, month);

    todayButton().props.onPress();
    await flush();
    assert.equal(calendar().props.initialDate, today);
    assert.equal(calendar().props.markedDates[today].selected, true);
    assert.equal(calendar().props.markedDates["2026-10-31"].dotColor, "red");
  }
  assert.deepEqual(months, [
    "2026-10-01",
    "2030-01-01",
    `${today.slice(0, 7)}-01`,
    "2030-02-01",
    `${today.slice(0, 7)}-01`,
  ]);
  h.stop();
});

test("reopening after browsing restores the selected month and its marker request", async () => {
  const months = [];
  const props = {
    ...calendarProps,
    onMonthChange: (month) => months.push(month),
  };
  for (const browsing of [true, false]) {
    const h = harness();
    const CalendarModal = h.load("components/CalendarModal.tsx").default;
    const content = CalendarModal(props).props.children;
    h.start(content.type, [content.props]);
    const calendar = find(h.state, (node) => node.type === "Calendar");
    assert.equal(calendar.props.initialDate, props.selectedDate);
    if (browsing) {
      calendar.props.onMonthChange({ year: 2026, month: 12 });
      await flush();
    }
    assert.equal(
      CalendarModal({ ...props, visible: false }).props.children,
      null,
    );
    h.stop();
  }
  assert.deepEqual(months, ["2026-10-01", "2026-12-01", "2026-10-01"]);
});

test("date selection, backdrop, back button, close button and accessibility escape remain wired", () => {
  const h = harness();
  const events = [];
  const CalendarModal = h.load("components/CalendarModal.tsx").default;
  const modal = CalendarModal({
    ...calendarProps,
    onClose: () => events.push("close"),
    onSelectDate: (date) => events.push(date),
  });
  h.start(modal.props.children.type, [modal.props.children.props]);
  find(h.state, (node) => node.type === "Calendar").props.onDayPress({
    dateString: "2026-11-01",
  });
  assert.deepEqual(events, ["2026-11-01", "close"]);
  modal.props.onRequestClose();
  find(h.state, (node) => node.type === "Pressable").props.onPress();
  find(
    h.state,
    (node) => node.props?.accessibilityLabel === "Close calendar",
  ).props.onPress();
  find(
    h.state,
    (node) => node.props?.accessibilityViewIsModal,
  ).props.onAccessibilityEscape();
  assert.equal(events.filter((event) => event === "close").length, 5);
  h.stop();
});

test("date navigator keeps local date labels and calls the latest navigation handlers", () => {
  const h = harness();
  const events = [];
  const DateNavigator = h.load("components/DateNavigator.tsx").default;
  const props = {
    selectedDate: new Date(2026, 9, 31),
    isDark: false,
    onChangeDate: (days) => events.push(days),
    onOpenCalendar: () => events.push("open"),
  };
  h.start(DateNavigator, [props]);
  const buttons = () => h.state.props.children;
  buttons()[0].props.onPress();
  buttons()[1].props.onPress();
  buttons()[2].props.onPress();
  assert.deepEqual(events, [-1, "open", 1]);
  assert.equal(buttons()[1].props.children.props.children, "Oct 31");

  h.update([
    {
      ...props,
      selectedDate: new Date(2026, 10, 1),
      onChangeDate: (days) => events.push(days * 10),
    },
  ]);
  assert.equal(buttons()[1].props.children.props.children, "Nov 1");
  assert.equal(
    buttons()[1].props.accessibilityLabel,
    "Sunday, November 1, 2026",
  );
  buttons()[2].props.onPress();
  assert.equal(events.at(-1), 10);
  h.stop();
});
