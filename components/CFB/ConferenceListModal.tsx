import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
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
import { conferenceListModalStyles } from "styles/ModalsStyles/ConferenceListModal.styles";

export type ConferenceListModalRef = {
  present: () => void;
  close: () => void;
};

type Props = {
  onSelect: (conference: string | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
  league?: string; // ✅ Added
};

const baseConferences = [
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
  ({ onSelect, onOpen, onClose, league }, ref) => {
    const [selected, setSelected] = useState<string | null>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const styles = conferenceListModalStyles(isDark);

    // ✅ Conditionally add A10 for CBB
    const conferences = useMemo(() => {
      return league === "cbb"
        ? [...baseConferences.slice(0, 12), "Atlantic 10", ...baseConferences.slice(12)]
        : baseConferences;
    }, [league]);

    const snapPoints = useMemo(() => ["80%", "90%"], []);
    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      close: () => modalRef.current?.close(),
    }));

    return (
      <BottomSheetModal
        ref={modalRef}
        index={2}
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
        backgroundStyle={{
          backgroundColor: "transparent",
          overflow: "hidden",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleComponent={() => (
          <View style={styles.header}>
            <View style={styles.handleIndicatorStyle} />
            <Text style={styles.headerText}>Conferences</Text>
          </View>
        )}
      >
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: "hidden",
          }}
        >
          <BlurView
            intensity={80}
            tint="systemThinMaterial"
            style={StyleSheet.absoluteFill}
          />
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
        </View>
      </BottomSheetModal>
    );
  }
);

export default ConferenceListModal;
