import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLayoutEffect, useRef, useState } from "react";
import { useColorScheme, View } from "react-native";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
export default function UFCLeagueScreen() {
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);
  const navigation = useNavigation();
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "fights" | "news" | "standings" | "champions" | "stats" | "forum"
  >("fights");

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="UFC"
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={() => {
            setLeagueModalVisible(true);
            sportsModalRef.current?.present();
          }}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, leagueModalVisible]);

  const tabs = [
    "fights",
    "news",
    "champions",
    "standings",
    "stats",
    "forum",
  ] as const;

  return (
    <>
      <View style={styles.container}>
        <MainScrollTabBar
          tabs={tabs}
          selected={selectedTab}
          onTabPress={setSelectedTab}
        />
      </View>
      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
