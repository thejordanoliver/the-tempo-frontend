//./CFB/GamePreview/CFBGamePreviewModal.tsx
import { useVenue } from "@/hooks/useVenue";
import { useWeather } from "@/hooks/useWeather";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { MMAFight } from "types/mma";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "utils/games";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "./CenterInfo";
import FighterInfo from "./FighterInfo";
import GamePreviewContent from "./GamePreviewContent";

const leftStancePlaceholder =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781892206/leftStancePlaceholder_bplhud.png";
const rightStancePlaceholder =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781892222/rightStancePlaceholder_igoaxo.png";
const headshotPlaceholder =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781892365/playerPlaceholder_vi9zk3.png";

type Props = {
  game: MMAFight;
  visible: boolean;
  onClose: () => void;
};

export default function MMAGamePreviewModal({ game, visible, onClose }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);

  function isValidDate(date: Date) {
    return !Number.isNaN(date.getTime());
  }

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game?.date]);

  const formattedDate =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })
      : "TBD";

  const formattedTime =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "TBD";

  const firstFighter = game?.competitors[0];
  const secondFighter = game?.competitors[1];
  const firstFighterId = Number(firstFighter?.id);
  const secondFighterId = Number(secondFighter?.id);
  const firstFighterLastName = firstFighter?.lastName ?? "TBD";
  const secondFighterLastName = secondFighter?.lastName ?? "TBD";
  const firstFighterName = firstFighter?.shortName ?? "TBD";
  const secondFighterName = secondFighter?.shortName ?? "TBD";
  const firstFighterColor = firstFighter?.color;
  const secondFighterColor = secondFighter?.color;
  const firstFighterPhoto = firstFighter?.headshot ?? headshotPlaceholder;
  const secondFighterPhoto = secondFighter?.headshot ?? headshotPlaceholder;
  const firstFighterStance =
    firstFighter?.rightStance ?? rightStancePlaceholder;
  const secondFighterStance =
    secondFighter?.leftStance ?? leftStancePlaceholder;
  const firstFighterAge = firstFighter?.age ?? "N/A";
  const secondFighterAge = secondFighter?.age ?? "N/A";
  const firstFighterCountry = firstFighter?.associationCountry ?? "N/A";
  const secondFighterCountry = secondFighter?.associationCountry ?? "N/A";
  const firstFighterWeight = firstFighter?.weight ?? "N/A";
  const secondFighterWeight = secondFighter?.weight ?? "N/A";
  const firstFighterHeight = firstFighter?.height ?? "N/A";
  const secondFighterHeight = secondFighter?.height ?? "N/A";
  const firstFighterReach = firstFighter?.reach ?? "N/A";
  const secondFighterReach = secondFighter?.reach ?? "N/A";
  const firstFighterFlag = firstFighter?.flag ?? "N/A";
  const secondFighterFlag = secondFighter?.flag ?? "N/A";
  const firstFighterRecord = firstFighter?.record ?? "0-0";
  const secondFighterRecord = secondFighter?.record ?? "0-0";
  const firstFighterClass = firstFighter?.weightClassShortName ?? "0-0";
  const secondFighterClass = secondFighter?.weightClassShortName ?? "0-0";
  const firstFighterWinner = firstFighter?.winner === true;
  const secondFighterWinner = secondFighter?.winner === true;

  const firstFighterIsChampion = firstFighter?.isChampion ?? false;
  const secondFighterIsChampion = secondFighter?.isChampion ?? false;

  const gameStatusDescription = game?.status.description;
  const state = game?.status.state;

  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isDelayed || isCanceled || isPostponed || isSuspended || isForfeited;
  const headline = game?.headline;
  const resultText = game.method;
  const results =
    resultText?.toLowerCase() === "submission"
      ? "SUB"
      : resultText?.toLowerCase() === "decision"
        ? "DEC"
        : resultText;
  const broadcasts = game?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const period = formatPeriod({ period: game?.status.period, isMMA: true });
  const clock = game?.status.displayClock;

  const styles = gamePreviewModalStyle();

  const venueId = Number(game?.venue?.id);
  const { venue } = useVenue({ sport: "mma", id: venueId });
  const { weather } = useWeather({
    lat: Number(venue?.latitude),
    lon: Number(venue?.longitude),
    location: venue?.city,
    date: formattedDate,
  });
  const baseVenue = game?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName ?? baseVenue?.name;
  const venueAddress = venue?.address ?? baseVenueAddress;
  const venueCapacity = venue?.capacity;
  const venueAttendance = baseVenue?.attendance;
  const venueImage = venue?.image ?? "";
  const venueLocation = `${venue?.city}, ${venue?.state}`;

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableDynamicSizing={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      backgroundStyle={styles.backgroundStyle}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[secondFighterColor, firstFighterColor]}
          locations={[0, 0.4, 0.6, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <BlurView
          intensity={100}
          tint={"systemUltraThinMaterialDark"}
          style={styles.blurViewContainer}
        >
          {headline && (
            <>
              {headline && <Text style={styles.headlineText}>{headline}</Text>}
            </>
          )}
          <View style={styles.gameHeaderContainer}>
            <FighterInfo
              side="away"
              headshot={secondFighterPhoto}
              flag={secondFighterFlag}
              name={secondFighterName}
              record={secondFighterRecord}
              gameStatusDescription={gameStatusDescription}
              isWinner={secondFighterWinner}
            />

            <CenterInfo
              time={formattedTime}
              date={formattedDate}
              period={period}
              clock={clock}
              broadcast={broadcast}
              results={results}
              gameStatusDescription={gameStatusDescription}
            />

            <FighterInfo
              side="home"
              headshot={firstFighterPhoto}
              flag={firstFighterFlag}
              name={firstFighterName}
              record={firstFighterRecord}
              gameStatusDescription={gameStatusDescription}
              isWinner={firstFighterWinner}
            />
          </View>

          {/* --- Scrollable Content --- */}
          {!dontShowDetails && (
            <GamePreviewContent
              state={state}
              firstFighterId={firstFighterId}
              secondFighterId={secondFighterId}
              firstFighterStance={firstFighterStance}
              secondFighterStance={secondFighterStance}
              firstFighterHeight={firstFighterHeight}
              firstFighterAge={firstFighterAge}
              secondFighterAge={secondFighterAge}
              secondFighterHeight={secondFighterHeight}
              firstFighterWeight={firstFighterWeight}
              secondFighterWeight={secondFighterWeight}
              firstFighterName={firstFighterLastName}
              secondFighterName={secondFighterLastName}
              firstFighterFlag={firstFighterFlag}
              secondFighterFlag={secondFighterFlag}
              firstFighterCountry={firstFighterCountry}
              secondFighterCountry={secondFighterCountry}
              firstFighterRecord={firstFighterRecord}
              secondFighterRecord={secondFighterRecord}
              firstFighterClass={firstFighterClass}
              secondFighterClass={secondFighterClass}
              firstFighterReach={firstFighterReach}
              secondFighterReach={secondFighterReach}
              firstFighterIsWinner={firstFighterWinner}
              secondFighterIsWinner={secondFighterWinner}
              secondFighterIsChampion={secondFighterIsChampion}
              firstFighterIsChampion={firstFighterIsChampion}
              gameStatusDescription={gameStatusDescription}
              venueImage={venueImage}
              venueLocation={venueLocation}
              venueName={venueName}
              venueAddress={venueAddress}
              venueCapacity={venueCapacity}
              venueAttendance={venueAttendance}
              weather={weather}
            />
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
