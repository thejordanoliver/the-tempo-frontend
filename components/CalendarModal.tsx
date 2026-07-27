import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { BlurView } from "expo-blur";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Calendar,
  LocaleConfig,
} from "react-native-calendars";
import Modal from "react-native-modal";

dayjs.extend(utc);
dayjs.extend(timezone);

LocaleConfig.locales.custom = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],

  dayNamesShort: [
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
  ],

  today: "Today",
};

LocaleConfig.defaultLocale = "custom";

type CalendarDay = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

type CalendarMonth = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

type MarkedDate = {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
  disableTouchEvent?: boolean;
};

type Props = {
  visible: boolean;
  selectedDate?: string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  onMonthChange?: (date: string) => void;
  markedDates: Record<string, MarkedDate>;
};

const getValidCalendarDate = (
  value?: string,
): string => {
  if (!value) {
    return dayjs()
      .tz("America/New_York")
      .format("YYYY-MM-DD");
  }

  const parsedDate = dayjs(
    value,
    "YYYY-MM-DD",
  );

  if (parsedDate.isValid()) {
    return parsedDate.format(
      "YYYY-MM-DD",
    );
  }

  return dayjs()
    .tz("America/New_York")
    .format("YYYY-MM-DD");
};

const getMonthAnchor = (
  value: string,
): string => {
  const parsedDate = dayjs(
    value,
    "YYYY-MM-DD",
  );

  if (!parsedDate.isValid()) {
    return dayjs()
      .startOf("month")
      .format("YYYY-MM-DD");
  }

  return parsedDate
    .startOf("month")
    .format("YYYY-MM-DD");
};

export default function CalendarModal({
  visible,
  selectedDate,
  onClose,
  onSelectDate,
  onMonthChange,
  markedDates,
}: Props) {
  const { resolvedColorScheme } =
    usePreferences();

  const isDark =
    resolvedColorScheme === "dark";

  const styles =
    calendarModalStyles(isDark);

  const [selectedDay, setSelectedDay] =
    useState(() =>
      getValidCalendarDate(
        selectedDate,
      ),
    );

  const [
    displayedCalendarDate,
    setDisplayedCalendarDate,
  ] = useState(() =>
    getValidCalendarDate(
      selectedDate,
    ),
  );

  const [calendarKey, setCalendarKey] =
    useState(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const validSelectedDate =
      getValidCalendarDate(
        selectedDate,
      );

    setSelectedDay(validSelectedDate);
    setDisplayedCalendarDate(
      validSelectedDate,
    );

    setCalendarKey(
      (previous) => previous + 1,
    );
  }, [visible, selectedDate]);

  const combinedMarkedDates =
    useMemo(() => {
      const existingSelectedDateMark =
        markedDates[selectedDay] ?? {};

      return {
        ...markedDates,

        [selectedDay]: {
          ...existingSelectedDateMark,
          selected: true,
          selectedColor: "transparent",
          selectedTextColor:
            Colors.dark.limeGreen,
        },
      };
    }, [markedDates, selectedDay]);

  const handleMonthChange = (
    month: CalendarMonth,
  ) => {
    const monthString = String(
      month.month,
    ).padStart(2, "0");

    const anchorDate =
      `${month.year}-${monthString}-01`;

    setDisplayedCalendarDate(
      anchorDate,
    );

    onMonthChange?.(anchorDate);
  };

  const goToToday = () => {
    const today = dayjs()
      .tz("America/New_York")
      .format("YYYY-MM-DD");

    setSelectedDay(today);
    setDisplayedCalendarDate(today);

    setCalendarKey(
      (previous) => previous + 1,
    );

    onMonthChange?.(
      getMonthAnchor(today),
    );
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.5}
      style={styles.modal}
      useNativeDriver
    >
      <BlurView
        intensity={100}
        tint={
          isDark
            ? "systemMaterialDark"
            : "systemMaterialLight"
        }
        style={styles.blurContainer}
      >
        <View style={styles.calendarWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={28}
              color={
                isDark
                  ? Colors.white
                  : Colors.black
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.todayButton}
            onPress={goToToday}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={
                isDark
                  ? Colors.white
                  : Colors.black
              }
              style={styles.todayIcon}
            />

            <Text style={styles.todayText}>
              Today
            </Text>
          </TouchableOpacity>

          <Calendar
            key={calendarKey}
            current={displayedCalendarDate}
            markedDates={
              combinedMarkedDates
            }
            onMonthChange={
              handleMonthChange
            }
            onDayPress={(
              day: CalendarDay,
            ) => {
              setSelectedDay(
                day.dateString,
              );

              setDisplayedCalendarDate(
                day.dateString,
              );

              onSelectDate(
                day.dateString,
              );

              onClose();
            }}
            enableSwipeMonths
            disableMonthChange={false}
            hideExtraDays={false}
            theme={{
              backgroundColor:
                "transparent",

              calendarBackground:
                "transparent",

              textSectionTitleColor:
                isDark
                  ? Colors.white
                  : Colors.black,

              todayTextColor: isDark
                ? Colors.dark.lightRed
                : Colors.light.red,

              dayTextColor: isDark
                ? Colors.white
                : Colors.black,

              textDisabledColor: isDark
                ? Colors.darkGray
                : Colors.lightGray,

              dotColor: isDark
                ? Colors.white
                : Colors.black,

              selectedDotColor: isDark
                ? Colors.white
                : Colors.black,

              selectedDayBackgroundColor:
                "transparent",

              selectedDayTextColor:
                Colors.dark.limeGreen,

              monthTextColor: isDark
                ? Colors.white
                : Colors.black,

              arrowColor: isDark
                ? Colors.white
                : Colors.black,

              textDayFontFamily:
                Fonts.OSBOLD,

              textMonthFontFamily:
                Fonts.OSBOLD,

              textDayHeaderFontFamily:
                Fonts.OSBOLD,

              textMonthFontSize: 24,
              textDayFontSize: 20,
              textDayHeaderFontSize: 18,
            }}
          />
        </View>
      </BlurView>
    </Modal>
  );
}

const calendarModalStyles = (
  isDark: boolean,
) =>
  StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: "center",
      alignItems: "center",
    },

    blurContainer: {
      flex: 1,
      width: "100%",
      height: "100%",
      paddingTop: 100,
      justifyContent: "flex-start",
      alignItems: "center",
    },

    calendarWrapper: {
      width: "100%",
      height: 500,
      padding: 20,
      borderRadius: 20,
    },

    closeButton: {
      alignSelf: "flex-end",
      marginBottom: 10,
      padding: 5,
    },

    todayButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginBottom: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },

    todayIcon: {
      marginRight: 6,
    },

    todayText: {
      color: isDark
        ? Colors.white
        : Colors.black,
      fontFamily: Fonts.OSBOLD,
    },
  });
