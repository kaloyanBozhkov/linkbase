import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Keyboard,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors as baseColors, typography } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";
import Button from "@/components/atoms/Button";
import SearchBar from "./SearchBar";

interface ActionsHeaderProps {
  isSearching: boolean;
  hasSearched: boolean;
  searchQuery: string;
  onSearch: () => void;
  onClearSearch: () => void;
  onSearchQueryChange: (text: string) => void;
  onAddConnection: () => void;
  onVoiceAddConnection: () => void;
  onOpenSettings: () => void;
}

const actions = ({
  onAddDrag,
  onSearchDrag,
  onAddAction,
  onSearchAction,
  onVoiceAddDrag,
  onVoiceAddAction,
  onSettingsDrag,
  onSettingsAction,
}: {
  onAddDrag: () => void;
  onSearchDrag: () => void;
  onAddAction: () => void;
  onSearchAction: () => void;
  onVoiceAddDrag: () => void;
  onVoiceAddAction: () => void;
  onSettingsDrag: () => void;
  onSettingsAction: () => void;
}) => [
  {
    min: 150,
    max: 210,
    dragCallback: onSearchDrag,
    actionCallback: onSearchAction,
  },
  {
    min: 210,
    max: 270,
    dragCallback: onAddDrag,
    actionCallback: onAddAction,
  },
  {
    min: 270,
    max: 360,
    dragCallback: onVoiceAddDrag,
    actionCallback: onVoiceAddAction,
  },
  {
    min: 0,
    max: 90,
    dragCallback: onSettingsDrag,
    actionCallback: onSettingsAction,
  },
];

const SHOW_CONTROLS_FOR = 2000;
const MIN_ACTION_DISTANCE = 40;
const MAX_DRAG_DISTANCE = 50;
const CONTROLS_HIDDEN_FOR_ACTIONS = ["search", "settings"];

const getNormalizedDegrees = (dx: number, dy: number) => {
  const angle = Math.atan2(dy, dx);
  const degrees = (angle * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
};

type Mode = "default" | "search" | "add" | "settings";

const ActionsHeader: React.FC<ActionsHeaderProps> = ({
  isSearching: _isSearching,
  hasSearched: _hasSearched,
  searchQuery,
  onSearch,
  onClearSearch,
  onSearchQueryChange,
  onAddConnection,
  onVoiceAddConnection,
  onOpenSettings,
}) => {
  const [mode, setMode] = useState<Mode>("default");
  const { colors } = useThemeStore();
  const [dragState, setDragState] = useState<
    "none" | "search" | "add" | "voiceAdd" | "dragging" | "settings"
  >("none");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const lastHapticStateRef = useRef<string | null>(null);

  // Hover state for controls visibility
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animated values for just the main circle movement
  const mainCirclePan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const actionsScaleValues = useRef({
    search: new Animated.Value(1),
    add: new Animated.Value(1),
    main: new Animated.Value(1),
    voiceAdd: new Animated.Value(1),
    settings: new Animated.Value(1),
    controlIcons: new Animated.Value(0),
  }).current;

  const resetMainCirclePosition = useCallback(() => {
    // Snap main circle back to center if no mode was activated
    Animated.spring(mainCirclePan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();

    Animated.spring(actionsScaleValues.main, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  }, [mainCirclePan, actionsScaleValues]);

  // Hover handlers for showing/hiding controls
  const handleHoverStart = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Show controls immediately
    Animated.timing(actionsScaleValues.controlIcons, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [actionsScaleValues.controlIcons]);

  const handleHoverEnd = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Hide controls after specified duration
    hoverTimeoutRef.current = setTimeout(() => {
      Animated.timing(actionsScaleValues.controlIcons, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, SHOW_CONTROLS_FOR);
  }, [actionsScaleValues.controlIcons]);

  // Helper function to show controls with auto-hide
  const showControlsWithAutoHide = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Show controls immediately
    Animated.timing(actionsScaleValues.controlIcons, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Hide after specified duration
    hoverTimeoutRef.current = setTimeout(() => {
      Animated.timing(actionsScaleValues.controlIcons, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, SHOW_CONTROLS_FOR);
  }, [actionsScaleValues.controlIcons]);

  // Auto-hide controls after initial animation sequence
  useEffect(() => {
    // animate in on mount after 500ms delay
    Animated.timing(actionsScaleValues.controlIcons, {
      toValue: 1,
      duration: 200,
      delay: 500,
      useNativeDriver: false,
    }).start();

    // Start the 3-second timer after the animation completes (500ms delay + 200ms animation + 3000ms visible)
    hoverTimeoutRef.current = setTimeout(() => {
      Animated.timing(actionsScaleValues.controlIcons, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, 500 + 200 + SHOW_CONTROLS_FOR); // delay + animation duration + x seconds visible
  }, [actionsScaleValues.controlIcons]);

  useFocusEffect(
    useCallback(() => {
      if (mode === "default") {
        showControlsWithAutoHide();
      }
    }, [mode, showControlsWithAutoHide])
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const actionsRef = useRef(
    actions({
      onAddDrag: () => {
        setDragState("add");
      },
      onSearchDrag: () => {
        setDragState("search");
      },
      onAddAction: () => {
        resetMainCirclePosition(); // page changes this rest is needed
        setDragState("none");
        onAddConnection();
      },
      onSearchAction: () => {
        setMode("search");
      },
      onVoiceAddDrag: () => {
        setDragState("voiceAdd");
      },
      onVoiceAddAction: () => {
        resetMainCirclePosition(); // page changes this rest is needed
        setDragState("none");
        onVoiceAddConnection();
      },
      onSettingsDrag: () => {
        setDragState("settings");
      },
      onSettingsAction: () => {
        // Reset UI before navigating, matching add/voice add behavior
        resetMainCirclePosition();
        setDragState("none");
        onOpenSettings();
      },
    })
  );

  // Reset position when mode changes
  useEffect(() => {
    resetMainCirclePosition();
    setDragState("none");
  }, [mode, resetMainCirclePosition]);

  useEffect(() => {
    Object.values(actionsScaleValues).forEach((value) => {
      Animated.spring(value, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    });

    if (dragState in actionsScaleValues) {
      Animated.spring(
        actionsScaleValues[dragState as keyof typeof actionsScaleValues],
        {
          toValue: 0.6,
          useNativeDriver: false,
        }
      ).start();
    }
  }, [dragState, actionsScaleValues]);

  // Provide light haptic feedback when hovering over a distinct action
  useEffect(() => {
    if (lastHapticStateRef.current !== dragState) {
      Haptics.selectionAsync();
      lastHapticStateRef.current = dragState;
    }
  }, [dragState]);

  // Handle keyboard events to position search bar above keyboard
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      if (mode === "search") {
        setKeyboardHeight(event.endCoordinates.height);
      }
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const keyboardDidShow = (event: any) => {
      if (mode === "search") {
        setKeyboardHeight(event.endCoordinates.height);
      }
    };

    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };

    let subscriptions: any[] = [];

    if (Platform.OS === "ios") {
      subscriptions = [
        Keyboard.addListener("keyboardWillShow", keyboardWillShow),
        Keyboard.addListener("keyboardWillHide", keyboardWillHide),
      ];
    } else {
      subscriptions = [
        Keyboard.addListener("keyboardDidShow", keyboardDidShow),
        Keyboard.addListener("keyboardDidHide", keyboardDidHide),
      ];
    }

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [mode]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          handleHoverStart(); // Show controls on touch start
          mainCirclePan.setOffset({
            x: (mainCirclePan.x as any)._value,
            y: (mainCirclePan.y as any)._value,
          });
        },
        onPanResponderMove: (_evt, gestureState) => {
          const { dx, dy } = gestureState;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = MAX_DRAG_DISTANCE;

          // Limit the drag distance
          let limitedDx = dx;
          let limitedDy = dy;

          if (distance > maxDistance) {
            const ratio = maxDistance / distance;
            limitedDx = dx * ratio;
            limitedDy = dy * ratio;
          }

          // Calculate scale based on distance (smaller as it gets further)
          const scale = Math.max(0.6, 1 - (distance / maxDistance) * 0.4);

          // Update positions
          mainCirclePan.setValue({ x: limitedDx, y: limitedDy });
          actionsScaleValues.main.setValue(scale);

          const normalizedDegrees = getNormalizedDegrees(limitedDx, limitedDy);

          if (distance > MIN_ACTION_DISTANCE) {
            const hoverAction = actionsRef.current.find(
              (action) =>
                normalizedDegrees >= action.min &&
                normalizedDegrees <= action.max
            );
            if (hoverAction) {
              hoverAction.dragCallback();
              return;
            }
          }
          setDragState("dragging");
        },
        onPanResponderRelease: (_evt, gestureState) => {
          handleHoverEnd(); // Start 3-second timer to hide controls
          const { dx, dy } = gestureState;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < MIN_ACTION_DISTANCE) {
            resetMainCirclePosition();
            return;
          }
          mainCirclePan.flattenOffset();
          const normalizedDegrees = getNormalizedDegrees(
            gestureState.dx,
            gestureState.dy
          );

          const action = actionsRef.current.find(
            (action) =>
              normalizedDegrees >= action.min && normalizedDegrees <= action.max
          );
          if (action) {
            // Stronger haptic when an action is executed
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            action.actionCallback();
            return;
          }

          resetMainCirclePosition();
        },
      }),
    [
      handleHoverStart,
      handleHoverEnd,
      mainCirclePan,
      actionsScaleValues,
      resetMainCirclePosition,
    ]
  );

  const handleCloseMode = () => {
    if (mode === "search") {
      onClearSearch();
    }
    setMode("default");
  };

  const getCircleIcon = () => {
    if (dragState === "search")
      return (
        <MaterialIcons name="search" size={20} color={colors.text.primary} />
      );
    if (dragState === "add")
      return <MaterialIcons name="add" size={20} color={colors.text.primary} />;
    if (dragState === "voiceAdd")
      return <Ionicons name="mic" size={20} color={colors.text.primary} />;
    if (dragState === "settings")
      return <Ionicons name="settings" size={20} color={colors.text.primary} />;
    return <Ionicons name="flash" size={20} color={colors.text.primary} />;
  };

  const closeButton = (
    <Button
      variant="secondary"
      size="xsmall"
      onPress={handleCloseMode}
      icon={
        <MaterialIcons name="close" size={12} color={colors.text.secondary} />
      }
      iconOnly
      style={styles.closeButton}
    />
  );

  const renderFloatingControl = () => {
    if (CONTROLS_HIDDEN_FOR_ACTIONS.includes(mode)) return null;
    return (
      <View
        style={[
          styles.floatingControl,
          {
            right: 50,
            bottom: 50,
          },
        ]}
      >
        {mode === "default" ? (
          <>
            {/* Main circle - draggable */}
            <Animated.View
              onTouchStart={() => {
                handleHoverStart();
              }}
              onTouchEnd={() => {
                handleHoverEnd();
              }}
              style={[
                styles.mainCircle,
                {
                  transform: [
                    { translateX: mainCirclePan.x },
                    { translateY: mainCirclePan.y },
                    { scale: actionsScaleValues.main },
                  ],
          backgroundColor:
            dragState !== "none" && dragState !== "dragging"
              ? baseColors.secondary[500]
              : baseColors.primary[600],
                },
              ]}
              {...panResponder.panHandlers}
            >
              {getCircleIcon()}
            </Animated.View>

            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: -1,
                  opacity: actionsScaleValues.controlIcons,
                },
              ]}
            >
              {/* Search icon on the left - static */}
              <Animated.View
                style={[
                  styles.searchIcon,
                  {
                    transform: [{ scale: actionsScaleValues.search }],
                    opacity: actionsScaleValues.search,
                  },
                ]}
              >
                 <MaterialIcons
                  name="search"
                  size={16}
                  color={colors.text.primary}
                />
              </Animated.View>

              {/* Plus icon on top - static */}
              <Animated.View
                style={[
                  styles.plusIcon,
                  {
                    transform: [{ scale: actionsScaleValues.add }],
                    opacity: actionsScaleValues.add,
                  },
                ]}
              >
                 <MaterialIcons
                  name="add"
                  size={16}
                  color={colors.text.primary}
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.voiceAddIcon,
                  {
                    transform: [{ scale: actionsScaleValues.voiceAdd }],
                    opacity: actionsScaleValues.voiceAdd,
                  },
                ]}
              >
                 <Ionicons name="mic" size={16} color={colors.text.primary} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.settingsIcon,
                  {
                    transform: [{ scale: actionsScaleValues.settings }],
                    opacity: actionsScaleValues.settings,
                  },
                ]}
              >
                 <Ionicons
                  name="settings"
                  size={16}
                  color={colors.text.primary}
                />
              </Animated.View>
            </Animated.View>
          </>
        ) : null}
      </View>
    );
  };

  const renderSearchBar = () => {
    if (mode !== "search") return null;

    // Calculate bottom position based on keyboard height
    const bottomPosition = keyboardHeight > 0 ? keyboardHeight + 20 : 40;

    return (
      <View
        style={[
          styles.searchBarContainer,
          { bottom: bottomPosition, pointerEvents: "box-none" },
        ]}
      >
        <View style={styles.searchClose}>{closeButton}</View>
        <SearchBar
          containerStyle={{
            shadowColor: colors.background.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          searchQuery={searchQuery}
          onSearchQueryChange={(text) => {
            if (_hasSearched) {
              onClearSearch();
            }
            onSearchQueryChange(text);
          }}
          onSearch={onSearch}
          isSearching={_isSearching}
          hasSearched={_hasSearched}
          onClearSearch={onClearSearch}
        />
      </View>
    );
  };
  // Open Settings via navigation; no inline overlay rendering

  const renderInstructions = () => {
    if (mode !== "default" || dragState === "dragging") return null;

    return (
      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructionsText, { color: colors.text.muted, backgroundColor: colors.background.surface }]}>
          {dragState === "search" && "Search connections"}
          {dragState === "add" && "Add a connection"}
          {dragState === "voiceAdd" && "Add connections by voice"}
          {dragState === "settings" && "Open settings"}
          {dragState === "none" && "Drag to search or add a connection"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {renderFloatingControl()}
      {renderSearchBar()}
      {renderInstructions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  floatingControl: {
    position: "absolute",
    zIndex: 1000,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  mainCircle: {
    width: 60,
    height: 60,
    zIndex: 1000,
    borderRadius: 30,
    backgroundColor: baseColors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIcon: {
    position: "absolute",
    left: -35,
    top: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: baseColors.slate[100] + "50",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsIcon: {
    position: "absolute",
    left: 50,
    top: 50,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: baseColors.slate[100] + "50",
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    position: "absolute",
    top: -27.5,
    left: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: baseColors.slate[100] + "50",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceAddIcon: {
    position: "absolute",
    top: -30,
    left: 40,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: baseColors.slate[100] + "50",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 999,
  },
  searchClose: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  closeButton: {
    borderRadius: 30,
    backgroundColor: baseColors.slate[100] + "50",
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 15,
    left: 20,
    right: 20,
    zIndex: 998,
    alignItems: "center",
  },
  instructionsText: {
    fontSize: typography.size.sm,
    color: baseColors.text.muted,
    textAlign: "center",
    backgroundColor: baseColors.background.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  // settings overlay styles removed; handled via navigation screen
});

export default ActionsHeader;
