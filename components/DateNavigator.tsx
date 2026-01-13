// components/DateNavigator.tsx
import React from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Fonts, Colors } from "constants/Styles";

dayjs.extend(utc);
dayjs.extend(timezone);
type Props = {
  selectedDate: Date;
  onChangeDate: (days: number) => void;
  onOpenCalendar: () => void;
  isDark: boolean;
};

export default function DateNavigator({
  selectedDate,
  onChangeDate,
  onOpenCalendar,
  isDark,
}: Props) {
  const styles = getStyles(isDark);

  return (
    <View style={styles.dateNavContainer}>
      <TouchableOpacity
        onPress={() => onChangeDate(-1)}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/icons8/back.png")}
          style={{ width: 20, height: 20, tintColor: isDark ? Colors.black : Colors.white }}
        />
      </TouchableOpacity>

 <TouchableOpacity onPress={onOpenCalendar} style={styles.dateNavButton} activeOpacity={0.7}>
  <Text style={styles.dateNavText}>
    {dayjs(selectedDate).tz("America/New_York").format("MMM D")}
  </Text>
</TouchableOpacity>


      <TouchableOpacity
        onPress={() => onChangeDate(1)}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/icons8/forward.png")}
          style={{ width: 20, height: 20, tintColor: isDark ? Colors.black : Colors.white }}
        />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    dateNavContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 12,
    },
    dateNavButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 12,
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderRadius: 6,
    },
    dateNavText: {
      color: isDark ? Colors.black : Colors.white,
      fontSize: 18,
      fontFamily: Fonts.OSMEDIUM,
    },
  });
