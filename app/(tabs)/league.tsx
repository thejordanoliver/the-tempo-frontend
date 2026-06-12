import { useLeagueData } from "@/hooks/useLeagueData";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import CalendarModal from "../../components/CalendarModal";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import DateNavigator from "../../components/DateNavigator";
import LeagueGamesList from "../../components/League/LeagueGamesList";
import SportsListModal, {
  SportsListModalRef,
} from "../../components/League/SportsListModal";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function LeagueScreen() {
  const navigation = useNavigation();

  const { resolvedColorScheme, viewMode } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const sportsModalRef = useRef<SportsListModalRef>(null);

  const {
    selectedDate,
    setSelectedDate,
    refreshing,
    handleRefresh,
    gamesByCategory,
    markedDates,
    loading: gamesLoading,
  } = useLeagueData();

  const openLeagueModal = useCallback(() => {
    setLeagueModalVisible(true);
    sportsModalRef.current?.present();
  }, []);

  // --------------------------------------------------
  // Header
  // --------------------------------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={openLeagueModal}
        />
      ),
    });
  }, [navigation, leagueModalVisible, openLeagueModal]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <>
      <View style={styles.container}>
        <View style={styles.contentArea}>
          <DateNavigator
            selectedDate={selectedDate}
            onChangeDate={(d) =>
              setSelectedDate((prevDate) =>
                dayjs(prevDate).add(d, "day").startOf("day").toDate(),
              )
            }
            onOpenCalendar={() => setShowCalendarModal(true)}
            isDark={isDark}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? Colors.white : Colors.black}
                colors={[isDark ? Colors.white : Colors.black]}
              />
            }
          >
            <LeagueGamesList
              gamesByCategory={gamesByCategory}
              loading={gamesLoading}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              isDark={isDark}
              viewMode={viewMode}
            />
          </ScrollView>
        </View>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(d) => {
          setSelectedDate(dayjs(d).startOf("day").toDate());
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onOpen={() => setLeagueModalVisible(true)}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}