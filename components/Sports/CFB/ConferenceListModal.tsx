import {
  cfbConferences,
  getCFBConferenceLogo,
} from "@/constants/cfbConferences";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
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

type ConferenceOption = {
  label: string;
  value: number | string | null;
  logo?: any;
};

type Props = {
  onSelect: (conference: number | string | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
  league?: string;
};

const ConferenceListModal = forwardRef<ConferenceListModalRef, Props>(
  function ConferenceListModal({ onSelect, onOpen, onClose }, ref) {
    const [selected, setSelected] = useState<number | string | null>(null);
    const { resolvedColorScheme } = usePreferences();
    const isDark = resolvedColorScheme === "dark";
    const styles = conferenceListModalStyles(isDark);

    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      close: () => modalRef.current?.close(),
    }));

    const conferences = useMemo<ConferenceOption[]>(() => {
      return [
        {
          label: "All Conferences",
          value: null,
          logo: null,
        },
        {
          label: "Top 25",
          value: "top25",
          logo: null,
        },
        ...cfbConferences
          .filter((conference) => conference.parentGroupId !== null)
          .map((conference) => ({
            label: conference.shortName || conference.name,
            value: conference.groupId,
            logo: getCFBConferenceLogo(conference.groupId, isDark),
          })),
      ];
    }, [isDark]);

    return (
      <BottomSheetModal
        ref={modalRef}
        index={2}
        enableDynamicSizing={false}
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
            intensity={100}
            tint="systemThinMaterial"
            style={StyleSheet.absoluteFill}
          />

          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainerStyle}
          >
            {conferences.map((conf) => {
              const isSelected = selected === conf.value;

              return (
                <TouchableOpacity
                  key={`${conf.label}-${conf.value}`}
                  onPress={() => {
                    setSelected(conf.value);
                    onSelect(conf.value);
                    modalRef.current?.close();
                  }}
                  activeOpacity={0.7}
                  style={styles.leagueButton}
                >
                  <View style={styles.leftContent}>
                    {conf.logo ? (
                      <Image
                        source={conf.logo}
                        style={styles.logo}
                        contentFit="contain"
                      />
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Ionicons
                          name={
                            conf.value === "top25"
                              ? "star"
                              : "american-football-outline"
                          }
                          size={18}
                          color={isDark ? Colors.white : Colors.black}
                        />
                      </View>
                    )}

                    <Text style={styles.leagueText}>{conf.label}</Text>
                  </View>

                  <Ionicons
                    name={isSelected ? "checkmark" : "chevron-forward"}
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
