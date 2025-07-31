import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors, typography } from "@/theme/colors";

interface ActionsHeaderProps {
  isSearching: boolean;
  hasSearched: boolean;
  searchQuery: string;
  onSearch: () => void;
  onClearSearch: () => void;
  onSearchQueryChange: (text: string) => void;
  onAddConnection: () => void;
}

const actions = ({
  onAddDrag,
  onSearchDrag,
  onAddAction,
  onSearchAction,
}: {
  onAddDrag: () => void;
  onSearchDrag: () => void;
  onAddAction: () => void;
  onSearchAction: () => void;
}) => [
  {
    min: 150,
    max: 240,
    dragCallback: onSearchDrag,
    actionCallback: onSearchAction,
  },
  {
    min: 240,
    max: 360,
    dragCallback: onAddDrag,
    actionCallback: onAddAction,
  },
];

const MIN_ACTION_DISTANCE = 40;
const MAX_DRAG_DISTANCE = 50;

const getNormalizedDegrees = (dx: number, dy: number) => {
  const angle = Math.atan2(dy, dx);
  const degrees = (angle * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
};

type Mode = "default" | "search" | "add";

const ActionsHeader: React.FC<ActionsHeaderProps> = ({
  isSearching: _isSearching,
  hasSearched: _hasSearched,
  searchQuery,
  onSearch,
  onClearSearch,
  onSearchQueryChange,
  onAddConnection,
}) => {
  const [mode, setMode] = useState<Mode>("default");
  const [dragState, setDragState] = useState<
    "none" | "search" | "add" | "dragging"
  >("none");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animated values for just the main circle movement
  const mainCirclePan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const actionsScaleValues = useRef({
    search: new Animated.Value(1),
    add: new Animated.Value(1),
    main: new Animated.Value(1),
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        mainCirclePan.setOffset({
          x: (mainCirclePan.x as any)._value,
          y: (mainCirclePan.y as any)._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
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
              normalizedDegrees >= action.min && normalizedDegrees <= action.max
          );
          if (hoverAction) {
            hoverAction.dragCallback();
            return;
          }
        }
        setDragState("dragging");
      },
      onPanResponderRelease: (_evt, gestureState) => {
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
          action.actionCallback();
          return;
        }

        resetMainCirclePosition();
      },
    })
  ).current;

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
    return <Ionicons name="flash" size={20} color={colors.text.primary} />;
  };

  const renderFloatingControl = () => (
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

          {/* Main circle - draggable */}
          <Animated.View
            style={[
              styles.mainCircle,
              {
                transform: [
                  { translateX: mainCirclePan.x },
                  { translateY: mainCirclePan.y },
                  { scale: actionsScaleValues.main },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {getCircleIcon()}
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
            <MaterialIcons name="add" size={16} color={colors.text.primary} />
          </Animated.View>
        </>
      ) : (
        /* Close button when in any mode - static position */
        <TouchableOpacity style={styles.closeButton} onPress={handleCloseMode}>
          <MaterialIcons name="close" size={16} color={colors.text.onAccent} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSearchBar = () => {
    if (mode !== "search") return null;

    // Calculate bottom position based on keyboard height
    const bottomPosition = keyboardHeight > 0 ? keyboardHeight + 20 : 40;

    return (
      <View style={[styles.searchBarContainer, { bottom: bottomPosition }]}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by facts or questions..."
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            placeholderTextColor={colors.text.muted}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderInstructions = () => {
    if (mode !== "default" || dragState === "dragging") return null;

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {dragState === "search" && "Search connections"}
          {dragState === "add" && "Add a connection"}
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
    backgroundColor: colors.primary[600],
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
    top: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.slate[100] + "50",
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
  plusIcon: {
    position: "absolute",
    top: -35,
    left: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.slate[100] + "50",
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
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.red[500],
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
  searchBarContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 999,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: colors.background.surface,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    paddingRight: 12,
  },
  searchButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  searchButtonText: {
    color: colors.text.onAccent,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
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
    color: colors.text.muted,
    textAlign: "center",
    backgroundColor: colors.background.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default ActionsHeader;
