import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Fonts } from "constants/fonts";
import { BlurView } from "expo-blur";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export type ConferenceListModalRef = {
  present: () => void;
  close: () => void;
};

type Props = {
  onSelect: (conference: string | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

const conferences = [
  "All Conferences",
  "Top 25",
  "SEC",
  "Big Ten",
  "Big 12",
  "ACC",
  "Pac-12",
  "AAC",
  "MWC",
  "Sun Belt",
  "CUSA",
  "MAC",
  "FBS Independents",
];

const ConferenceListModal = forwardRef<ConferenceListModalRef, Props>(
  ({ onSelect, onOpen, onClose }, ref) => {
    const [selected, setSelected] = useState<string | null>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const styles = getStyles(isDark);

    const snapPoints = useMemo(() => ["80%", "90%"], []);
    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      close: () => modalRef.current?.close(),
    }));

    return (
      <BottomSheetModal
        ref={modalRef}
          index={2} // ✅ Start fully at 80%
        snapPoints={snapPoints}
        onChange={(index) => {
          if (index >= 0) onOpen?.();
          else onClose?.();
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            disappearsOnIndex={-1}
          />
        )}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        backgroundStyle={{ backgroundColor: "transparent", overflow: "hidden" }}
        handleComponent={() => (
          <View style={styles.header}>
            <View
              style={{
                backgroundColor: "#777",
                width: 36,
                height: 4,
                borderRadius: 2,
                zIndex: 9999,
                marginBottom: 4,
              }}
            />
            <Text style={styles.headerText}>Leagues</Text>
          </View>
        )}
      >
        <BlurView
          intensity={80}
          tint={"systemThinMaterial"}
          style={{ flex: 1 }}
        >
          <BottomSheetScrollView
            contentContainerStyle={{ padding: 16, paddingTop: 60 }}
          >
            {conferences.map((conf) => {
              const isSelected =
                selected === conf || (conf === "All Conferences" && !selected);

              return (
                <TouchableOpacity
                  key={conf}
                  onPress={() => {
                    const selectedValue =
                      conf === "All Conferences" ? null : conf;
                    setSelected(selectedValue);
                    onSelect(selectedValue);
                    modalRef.current?.close();
                  }}
                  activeOpacity={0.7}
                  style={styles.leagueButton}
                >
                  <Text style={styles.leagueText}>{conf}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? "#fff" : "#1d1d1d"}
                  />
                </TouchableOpacity>
              );
            })}
          </BottomSheetScrollView>
        </BlurView>
      </BottomSheetModal>
    );
  }
);

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    handleStyle: {
      backgroundColor: "transparent",
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: 8,
      right: 8,
      top: 0,
    },
    handleIndicatorStyle: {
      backgroundColor: "#888",
      width: 36,
      height: 4,
      borderRadius: 2,
    },
    header: {
      position: "absolute",
      width: "100%",
      top: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#444" : "#aaa",
      paddingVertical: 12,
    },
    headerText: {
      textAlign: "center",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: Fonts.OSBOLD,
      color: isDark ? "#fff" : "#1d1d1d",
      fontSize: 18,
    },
    leagueButton: {
      paddingVertical: 12,
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#444" : "#777",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leagueText: {
      color: isDark ? "#fff" : "#1d1d1d",
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
    },
  });

export default ConferenceListModal;
