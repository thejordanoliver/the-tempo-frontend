import { Ionicons } from "@expo/vector-icons";
import {
  EXPLORE_WIDGET_OPTIONS,
  getDefaultWidgetSize,
} from "constants/exploreWidgets";
import type { ExploreWidgetOption } from "constants/exploreWidgets";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { BlurView } from "expo-blur";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ExploreWidgetConfig,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";

type AddWidgetModalProps = {
  visible: boolean;
  isDark: boolean;
  selectedWidgets: ExploreWidgetConfig[];
  onClose: () => void;
  onAddWidget: (
    type: ExploreWidgetType,
    title: string,
    size: ExploreWidgetSize,
  ) => void;
};

type DropZoneBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WidgetCatalogCardProps = {
  option: ExploreWidgetOption;
  isDark: boolean;
  isSelected: boolean;
  styles: ReturnType<typeof addWidgetModalStyles>;
  onAddWidget: (
    type: ExploreWidgetType,
    title: string,
    size: ExploreWidgetSize,
  ) => void;
  onDragStart: (type: ExploreWidgetType) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (
    type: ExploreWidgetType,
    title: string,
    size: ExploreWidgetSize,
    x: number,
    y: number,
  ) => boolean;
  onDragCancel: () => void;
};

function WidgetCatalogCard({
  option,
  isDark,
  isSelected,
  styles,
  onAddWidget,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: WidgetCatalogCardProps) {
  const defaultSize = getDefaultWidgetSize(option.type);
  const dragPosition = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  const resetDrag = useCallback(() => {
    Animated.spring(dragPosition, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      speed: 22,
      bounciness: 4,
    }).start(() => {
      setIsDragging(false);
    });
  }, [dragPosition]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          !isSelected &&
          (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          !isSelected &&
          (Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8),
        onPanResponderGrant: () => {
          setIsDragging(true);
          dragPosition.setValue({ x: 0, y: 0 });
          onDragStart(option.type);
        },
        onPanResponderMove: (_, gestureState) => {
          dragPosition.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });
          onDragMove(gestureState.moveX, gestureState.moveY);
        },
        onPanResponderRelease: (_, gestureState) => {
          onDragEnd(
            option.type,
            option.title,
            defaultSize,
            gestureState.moveX,
            gestureState.moveY,
          );
          resetDrag();
        },
        onPanResponderTerminate: () => {
          onDragCancel();
          resetDrag();
        },
        onShouldBlockNativeResponder: () => false,
      }),
    [
      defaultSize,
      dragPosition,
      isSelected,
      onDragCancel,
      onDragEnd,
      onDragMove,
      onDragStart,
      option.title,
      option.type,
      resetDrag,
    ],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isDragging && styles.cardDragging,
        { transform: dragPosition.getTranslateTransform() },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={option.icon}
          size={22}
          color={isDark ? Colors.white : Colors.black}
        />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>{option.title}</Text>

          {option.badge && <Text style={styles.badge}>{option.badge}</Text>}
        </View>

        <Text style={styles.description}>{option.description}</Text>

        {option.sizes.length > 1 && !isSelected && (
          <View style={styles.sizeRow}>
            {option.sizes.map((size) => (
              <TouchableOpacity
                key={size}
                activeOpacity={activeOpacity}
                onPress={() => onAddWidget(option.type, option.title, size)}
                style={styles.sizeButton}
                accessibilityRole="button"
                accessibilityLabel={`Add ${option.title} ${size} widget`}
              >
                <Text style={styles.sizeButtonText}>
                  {size[0].toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.action}>
        {isSelected ? (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={isDark ? Colors.dark.leafGreen : Colors.light.green}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() => onAddWidget(option.type, option.title, defaultSize)}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel={`Add ${option.title} widget`}
          >
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export default function AddWidgetModal({
  visible,
  isDark,
  selectedWidgets,
  onClose,
  onAddWidget,
}: AddWidgetModalProps) {
  const styles = addWidgetModalStyles(isDark);
  const selectedSet = useMemo(
    () => new Set(selectedWidgets.map((widget) => widget.type)),
    [selectedWidgets],
  );
  const dropZoneRef = useRef<View>(null);
  const dropZoneBoundsRef = useRef<DropZoneBounds | null>(null);
  const [draggingOptionType, setDraggingOptionType] =
    useState<ExploreWidgetType | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);

  const measureDropZone = useCallback(() => {
    dropZoneRef.current?.measureInWindow((x, y, width, height) => {
      dropZoneBoundsRef.current = { x, y, width, height };
    });
  }, []);

  const isPointInDropZone = useCallback((x: number, y: number) => {
    const bounds = dropZoneBoundsRef.current;

    if (!bounds) return false;

    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }, []);

  const handleDragStart = useCallback(
    (type: ExploreWidgetType) => {
      setDraggingOptionType(type);
      setDropZoneActive(false);
      measureDropZone();
    },
    [measureDropZone],
  );

  const handleDragMove = useCallback(
    (x: number, y: number) => {
      const isActive = isPointInDropZone(x, y);
      setDropZoneActive((current) =>
        current === isActive ? current : isActive,
      );
    },
    [isPointInDropZone],
  );

  const clearDragState = useCallback(() => {
    setDraggingOptionType(null);
    setDropZoneActive(false);
  }, []);

  const handleDragEnd = useCallback(
    (
      type: ExploreWidgetType,
      title: string,
      size: ExploreWidgetSize,
      x: number,
      y: number,
    ) => {
      const shouldAdd = isPointInDropZone(x, y);

      if (shouldAdd) {
        onAddWidget(type, title, size);
      }

      clearDragState();
      return shouldAdd;
    },
    [clearDragState, isPointInDropZone, onAddWidget],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView
        intensity={36}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Add Widget</Text>
              <Text style={styles.subtitle}>
                Choose what you want to track on Explore.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close add widget"
            >
              <Ionicons
                name="close"
                size={22}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            contentContainerStyle={styles.options}
          >
            {EXPLORE_WIDGET_OPTIONS.map((option) => {
              const isSelected =
                option.allowDuplicates !== true && selectedSet.has(option.type);

              return (
                <WidgetCatalogCard
                  key={option.type}
                  option={option}
                  isDark={isDark}
                  isSelected={isSelected}
                  styles={styles}
                  onAddWidget={onAddWidget}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onDragCancel={clearDragState}
                />
              );
            })}
          </ScrollView>

          <View
            ref={dropZoneRef}
            onLayout={measureDropZone}
            style={[
              styles.dropZone,
              draggingOptionType && styles.dropZoneVisible,
              dropZoneActive && styles.dropZoneActive,
            ]}
          >
            <Ionicons
              name={dropZoneActive ? "download" : "download-outline"}
              size={18}
              color={
                dropZoneActive
                  ? isDark
                    ? Colors.black
                    : Colors.white
                  : isDark
                    ? Colors.white
                    : Colors.black
              }
            />
            <Text
              style={[
                styles.dropZoneText,
                dropZoneActive && styles.dropZoneTextActive,
              ]}
            >
              {dropZoneActive ? "Release to add" : "Dashboard drop area"}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const addWidgetModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: isDark ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.22)",
    },
    sheet: {
      maxHeight: "86%",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 18,
      backgroundColor: isDark ? Colors.black : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 14,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      marginTop: 2,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    scroll: {
      flexGrow: 0,
      flexShrink: 1,
      minHeight: 0,
    },
    options: {
      gap: 10,
      paddingBottom: 12,
    },
    card: {
      minHeight: 88,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardSelected: {
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
      opacity: 0.72,
    },
    cardDragging: {
      zIndex: 30,
      opacity: 0.92,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
    },
    cardBody: {
      flex: 1,
      gap: 3,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    cardTitle: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 17,
      color: isDark ? Colors.white : Colors.black,
    },
    badge: {
      overflow: "hidden",
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
    },
    description: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    action: {
      minWidth: 46,
      alignItems: "flex-end",
    },
    addButton: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    addText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },
    sizeRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: 8,
    },
    sizeButton: {
      width: 30,
      height: 26,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    sizeButtonText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    dropZone: {
      minHeight: 46,
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      opacity: 0.72,
    },
    dropZoneVisible: {
      opacity: 1,
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    dropZoneActive: {
      borderStyle: "solid",
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    dropZoneText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
    },
    dropZoneTextActive: {
      color: isDark ? Colors.black : Colors.white,
    },
  });
