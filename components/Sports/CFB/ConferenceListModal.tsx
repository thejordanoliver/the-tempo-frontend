import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { conferenceListModalStyles } from "styles/ModalsStyles/ConferenceListModalStyles";
import { snapPoints } from "utils/modalUtils";

export type ConferenceListModalRef = {
  present: () => void;
  close: () => void;
};

type Props = {
  onSelect: (conference: string | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
  league?: string;
};

// 🔥 Base conference sets
const CBB_CONFERENCES = [
  "All Conferences",
  "NCAA Tournament",
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
  "Atlantic 10",
  "FBS Independents",
];
const CFB_CONFERENCES = [
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
    const { resolvedColorScheme } = usePreferences();
    const isDark = resolvedColorScheme === "dark";
    const styles = conferenceListModalStyles(isDark);

    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      close: () => modalRef.current?.close(),
    }));

    // 🔥 Pick conferences based on league
    const conferences = useMemo(() => {
      if (league?.toLowerCase() === "cbb") {
        return CBB_CONFERENCES;
      }
      return CFB_CONFERENCES;
    }, [league]);

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
        backgroundStyle={styles.backgroundStyle}
        handleComponent={() => (
          <View style={styles.header}>
            <View style={styles.handleIndicatorStyle} />
            <Text style={styles.headerText}>Conferences</Text>
          </View>
        )}
      >
        <View style={styles.container}>
          <BlurView
            intensity={80}
            tint="systemThinMaterial"
            style={StyleSheet.absoluteFill}
          />

          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainerStyle}
          >
            {conferences.map((conf) => {
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
                    color={isDark ? Colors.white : Colors.black}
                  />
                </TouchableOpacity>
              );
            })}
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>
    );
  },
);

export default ConferenceListModal;
