import {
  cfbConferences,
  getCFBConferenceLogo,
  getCFBConferenceSelectionName,
} from "@/constants/cfbConferences";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import CFBLogo from "assets/College_Logos/Conference_Logos/CFB.png";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import type { ImageSourcePropType } from "react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { conferenceListModalStyles } from "styles/ModalsStyles/ConferenceListModalStyles";
import { snapPoints } from "utils/modalUtils";

export type ConferenceListModalRef = {
  present: () => void;
  close: () => void;
};

type ConferenceOption = {
  label: string;
  value: number | string;
  logo?: ImageSourcePropType | string | null;
};

type FBSConference = (typeof cfbConferences)[number] & { groupId: number };

function isFBSConferenceOption(
  conference: (typeof cfbConferences)[number],
): conference is FBSConference {
  return (
    conference.groupId !== null &&
    (conference.groupId === 80 || conference.parentGroupId === 80)
  );
}

type Props = {
  selectedConference: number | string | null;
  onSelect: (conference: number | string | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
  league?: string;
};

const ConferenceListModal = forwardRef<ConferenceListModalRef, Props>(
  function ConferenceListModal(
    { selectedConference, onSelect, onOpen, onClose },
    ref,
  ) {
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
          label: "Top 25",
          value: "top25",
          logo: CFBLogo,
        },
        ...cfbConferences
          .filter(isFBSConferenceOption)
          .map((conference) => ({
            label:
              getCFBConferenceSelectionName(conference.groupId) ||
              conference.shortName ||
              conference.name,
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
              const isSelected = selectedConference === conf.value;

              return (
                <TouchableOpacity
                  key={`${conf.label}-${conf.value}`}
                  onPress={() => {
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
