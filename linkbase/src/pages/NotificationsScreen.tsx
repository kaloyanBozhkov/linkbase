import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Switch, Platform, TouchableOpacity, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useNotificationSettingsStore } from "@/hooks/useNotificationSettings";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";

const requestPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }
};

const scheduleNotification = async (time: string) => {
  const [hours, minutes] = time.split(":").map((n) => parseInt(n, 10));

  // Cancel existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Calculate if this is a one-time notification (within next 2 hours) or daily reminder
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  // If target time is in the past today, assume it's for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeDifference = targetTime.getTime() - now.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60);

  if (hoursDifference <= 2) {
    // One-time notification within 2 hours
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Log your connections",
        body: "Don't forget to add today's connections!",
      },
      trigger: {
        date: targetTime,
        channelId: Platform.OS === "android" ? "one-time-reminders" : undefined,
      } as any,
    });
  } else {
    // Daily repeating notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Log your connections",
        body: "Don't forget to add today's connections!",
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
        channelId: Platform.OS === "android" ? "daily-reminders" : undefined,
      } as any,
    });
  }
};

const NotificationsScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { enabled, time, isInitializing, setEnabled, setTime, loadSettings } = useNotificationSettingsStore();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const getNotificationScheduleInfo = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map((n) => parseInt(n, 10));
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const hoursDifference = (targetTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference <= 2) {
      const minutesDiff = Math.round(hoursDifference * 60);
      if (minutesDiff < 1) {
        return "in less than a minute";
      } else if (minutesDiff === 1) {
        return "in 1 minute";
      } else {
        return `in ${minutesDiff} minutes`;
      }
    } else {
      return "daily at this time";
    }
  };

  useEffect(() => {
    (async () => {
      await requestPermissions();
      await loadSettings();
    })();
  }, [loadSettings]);

  useEffect(() => {
    if (!isInitializing) {
      (async () => {
        if (enabled) {
          await scheduleNotification(time);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      })();
    }
  }, [enabled, time, isInitializing]);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setTempTime(selectedTime);
      if (Platform.OS === "ios") {
        // On iOS, we'll confirm when user taps "Done"
        return;
      }
      // On Android, immediately save the time
      const timeString = selectedTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(timeString);
    }
  };

  const handleTimeConfirm = () => {
    const timeString = tempTime.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    setTime(timeString);
    setShowTimePicker(false);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  const openTimePicker = () => {
    const [hours, minutes] = time.split(":").map((n) => parseInt(n, 10));
    const currentTime = new Date();
    currentTime.setHours(hours, minutes, 0, 0);
    setTempTime(currentTime);
    setShowTimePicker(true);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isInitializing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <LinearGradient colors={colors.gradients.background} style={styles.gradient}>
          <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <LinearGradient colors={colors.gradients.background} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: colors.background.surface, borderColor: colors.border.light }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Enable Notifications</Text>
              <Switch value={enabled} onValueChange={setEnabled} />
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Time</Text>
              <TouchableOpacity
                onPress={openTimePicker}
                style={[
                  styles.timeButton,
                  {
                    borderColor: colors.border.light,
                    backgroundColor: colors.background.secondary,
                  },
                ]}
              >
                <Text style={[styles.timeText, { color: colors.text.primary }]}>
                  {formatTime(time)}
                </Text>
              </TouchableOpacity>
            </View>
            {enabled && (
              <View style={styles.notificationTypeRow}>
                <Text style={[styles.notificationTypeText, { color: colors.text.secondary }]}>
                  {getNotificationScheduleInfo(time)}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {showTimePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showTimePicker}
          onRequestClose={handleTimeCancel}
        >
          <View style={styles.modalOverlay}>
                         <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
                             <View style={[styles.modalHeader, { borderBottomColor: colors.border.light }]}>
                <TouchableOpacity onPress={handleTimeCancel}>
                  <Text style={[styles.modalButton, { color: colors.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Set Time</Text>
                <TouchableOpacity onPress={handleTimeConfirm}>
                  <Text style={[styles.modalButton, { color: colors.text.accent }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.timePicker}
                textColor={colors.text.primary}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  card: { borderRadius: 12, padding: 16, borderWidth: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  notificationTypeRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  label: { fontSize: 16 },
  notificationTypeText: { fontSize: 12, fontStyle: "italic" },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  timeText: { fontSize: 16, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  timePicker: {
    height: 200,
  },
});

export default NotificationsScreen;

