import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import Modal from "react-native-modal";

LocaleConfig.locales["custom"] = {
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
  dayNamesShort: ["S", "M", "T", "W", "T", "F", "S"],
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

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  markedDates: { [key: string]: any };
};

export default function CalendarModal({
  visible,
  onClose,
  onSelectDate,
  markedDates,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(() => calendarModalStyles(isDark), [isDark]);

  const [selectedDate, setSelectedDate] = useState(
    dayjs().tz("America/New_York").format("YYYY-MM-DD"),
  );

  const [calendarKey, setCalendarKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setCalendarKey((prev) => prev + 1);
    }
  }, [visible, resolvedColorScheme]);

  const goToToday = () => {
    const today = dayjs().tz("America/New_York").format("YYYY-MM-DD");
    setSelectedDate(today);
    setCalendarKey((prev) => prev + 1);
  };

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: "transparent",
      calendarBackground: "transparent",

      textSectionTitleColor: isDark ? Colors.white : Colors.black,
      todayTextColor: isDark ? Colors.dark.lightRed : Colors.light.red,
      dayTextColor: isDark ? Colors.white : Colors.black,
      textDisabledColor: isDark ? Colors.darkGray : Colors.lightGray,

      dotColor: isDark ? Colors.white : Colors.black,
      selectedDotColor: isDark ? Colors.black : Colors.white,

      monthTextColor: isDark ? Colors.white : Colors.black,
      arrowColor: isDark ? Colors.white : Colors.black,

      textDayFontFamily: Fonts.OSBOLD,
      textMonthFontFamily: Fonts.OSBOLD,
      textDayHeaderFontFamily: Fonts.OSBOLD,

      textMonthFontSize: 24,
      textDayFontSize: 20,
      textDayHeaderFontSize: 18,
    }),
    [isDark],
  );

  const calendarMarkedDates = useMemo(() => {
    const selectedMarkedDate = markedDates?.[selectedDate] ?? {};

    return {
      ...markedDates,
      [selectedDate]: {
        ...selectedMarkedDate,
        customStyles: {
          ...(selectedMarkedDate.customStyles ?? {}),
          container: {
            ...(selectedMarkedDate.customStyles?.container ?? {}),
            backgroundColor: "transparent",
          },
          text: {
            ...(selectedMarkedDate.customStyles?.text ?? {}),
            color: isDark ? Colors.dark.limeGreen : Colors.light.green,
            fontFamily: Fonts.OSBOLD,
          },
        },
      },
    };
  }, [isDark, markedDates, selectedDate]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={isDark ? 0.5 : 0.25}
      style={styles.modal}
      useNativeDriver
    >
      <BlurView
        intensity={100}
        tint={"systemMaterial"}
        style={styles.blurContainer}
      >
        <View style={styles.calendarWrapper}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons
              name="close"
              size={28}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Ionicons
              name="calendar"
              size={18}
              color={isDark ? Colors.white : Colors.black}
              style={styles.todayIcon}
            />
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>

          <Calendar
            key={`${resolvedColorScheme}-${calendarKey}`}
            current={dayjs(selectedDate)
              .tz("America/New_York")
              .format("YYYY-MM-DD")}
            markedDates={calendarMarkedDates}
            markingType="custom"
            onDayPress={(day: CalendarDay) => {
              setSelectedDate(day.dateString);
              onSelectDate(day.dateString);
              onClose();
            }}
            enableSwipeMonths
            disableMonthChange={false}
            theme={calendarTheme}
          />
        </View>
      </BlurView>
    </Modal>
  );
}

const calendarModalStyles = (isDark: boolean) =>
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
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.55)"
        : "rgba(255, 255, 255, 0.65)",
    },
    calendarWrapper: {
      borderRadius: 20,
      padding: 20,
      width: "100%",
      height: 500,
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
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
    },
  });
