import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from "expo-audio";
import { colors as baseColors, typography, borderRadius } from "@/theme/colors";
import { S3Service } from "@/utils/s3";
import { S3_FEATURE_FOLDERS } from "@linkbase/shared/src";
import { uriToFile } from "@/helpers/utils";

type RecordingState = "idle" | "recording" | "recorded";

interface VoiceRecorderProps {
  onRecordingUploaded: (uploadedUrl: string) => void;
  userId: string;
  featureFolder: (typeof S3_FEATURE_FOLDERS)[number];
  size?: 'small' | 'medium' | 'large';
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingUploaded,
  userId,
  featureFolder,
  size = 'medium',
}) => {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(
    null
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup permissions and audio mode
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission Required", "Please grant microphone permission to record audio.");
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Timer effect for recording duration
  useEffect(() => {
    if (recorderState.isRecording && recordingStartTime) {
      console.log("Setting up timer effect...");

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);

      return () => {
        console.log("Cleaning up timer effect...");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [recorderState.isRecording, recordingStartTime]);

  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      
      setRecordingDuration(0);
      const startTime = Date.now();
      setRecordingStartTime(startTime);
      setRecordingState("recording"); // This triggers the useEffect timer

      console.log("Recording started at:", startTime);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping recording..."); // Debug log

      // The recording will be available on `audioRecorder.uri`.
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      console.log("Recording stopped, final duration:", recordingDuration); // Debug log

      setRecordingUri(uri);
      setRecordingState("recorded"); // This will trigger useEffect cleanup
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const acceptRecording = async () => {
    if (!recordingUri) return;

    setIsUploading(true);

    // TODO move to a shared fn

    try {
      // upload to s3 & get transcription
      const fileName = new Date().getTime().toString();
      const fileType = getFileType(recordingUri);
      const { presignedUrl, destinationUrl } = await S3Service.getPresignedUrl(
        fileName,
        fileType,
        featureFolder,
        userId
      );

      // Convert recordingUri to File object using helper
      const file = await uriToFile(recordingUri, fileName, fileType);
      await S3Service.uploadFileToS3({
        uploadUrl: presignedUrl,
        file,
        fileType,
        onUploadProgress: () => console.log("uploading"),
      });
      resetRecorder();
      console.log("voicerecorder recorder & fullUrl:", destinationUrl);
      onRecordingUploaded(destinationUrl);
    } catch (error) {
      console.error("Failed to upload recording:", error);
      Alert.alert("Error", "Failed to upload recording");
    } finally {
      setIsUploading(false);
    }
  };

  const discardRecording = () => {
    resetRecorder();
  };

  const resetRecorder = () => {
    // Clear timer first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset state
    setRecordingState("idle");
    setRecordingUri(null);
    setRecordingDuration(0);
    setRecordingStartTime(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Size configurations
  const sizeConfig = {
    small: {
      buttonSize: 40,
      iconSize: 20,
      stopButtonSize: 26,
      actionButtonSize: 22,
      fontSize: typography.size.xs,
    },
    medium: {
      buttonSize: 48,
      iconSize: 24,
      stopButtonSize: 30,
      actionButtonSize: 26,
      fontSize: typography.size.xs,
    },
    large: {
      buttonSize: 64,
      iconSize: 32,
      stopButtonSize: 40,
      actionButtonSize: 34,
      fontSize: typography.size.sm,
    },
  };

  const config = sizeConfig[size];

  const renderIdleState = () => (
    <Pressable
      style={[
        styles.button, 
        styles.recordButton,
        {
          width: config.buttonSize,
          height: config.buttonSize,
          borderRadius: config.buttonSize / 2,
        }
      ]}
      onPress={startRecording}
    >
      <Ionicons name="mic" size={config.iconSize} color="#ffffff" />
    </Pressable>
  );

  const renderRecordingState = () => (
    <View style={styles.recordingContainer}>
      <Pressable
        style={[
          styles.button, 
          styles.stopButton,
          {
            width: config.stopButtonSize,
            height: config.stopButtonSize,
            borderRadius: config.stopButtonSize / 2,
          }
        ]}
        onPress={stopRecording}
      >
        <Ionicons name="stop" size={config.iconSize * 0.7} color="#ffffff" />
      </Pressable>
      <View style={styles.recordingInfo}>
        <View style={styles.recordingIndicator} />
        <Text style={[styles.durationText, { fontSize: config.fontSize }]}>
          {formatDuration(recordingDuration)}
        </Text>
      </View>
    </View>
  );

  const renderRecordedState = () => (
    <View style={styles.recordedContainer}>
      <View style={styles.actionsContainer}>
        <Pressable
          style={[
            styles.button, 
            styles.discardButton,
            {
              width: config.actionButtonSize,
              height: config.actionButtonSize,
              borderRadius: config.actionButtonSize / 2,
            }
          ]}
          onPress={discardRecording}
          disabled={isUploading}
        >
          <Ionicons name="close" size={config.iconSize * 0.6} color="#ffffff" />
        </Pressable>
        <Pressable
          style={[
            styles.button, 
            styles.acceptButton,
            {
              width: config.actionButtonSize,
              height: config.actionButtonSize,
              borderRadius: config.actionButtonSize / 2,
            }
          ]}
          onPress={acceptRecording}
          disabled={isUploading}
        >
          {isUploading ? (
            <Text style={[styles.uploadingText, { fontSize: config.fontSize }]}>...</Text>
          ) : (
            <Ionicons name="checkmark" size={config.iconSize * 0.6} color="#ffffff" />
          )}
        </Pressable>
      </View>
      <View style={styles.recordedTextContainer}>
        <Text style={[styles.recordedText, { fontSize: config.fontSize }]}>
          Recording: {formatDuration(recordingDuration)}
        </Text>
        <Text style={[styles.recordedText, { fontSize: config.fontSize }]}>All good?</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {recordingState === "idle" && renderIdleState()}
      {recordingState === "recording" && renderRecordingState()}
      {recordingState === "recorded" && renderRecordedState()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
   recordButton: {
    backgroundColor: baseColors.primary[600],
  },
  stopButton: {
    width: 30,
    height: 30,
    backgroundColor: baseColors.red[600],
  },
  acceptButton: {
    backgroundColor: baseColors.success,
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  discardButton: {
    backgroundColor: baseColors.red[600],
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  recordingContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    marginBottom: -10,
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: baseColors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: baseColors.border.default,
  },
  recordingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: baseColors.red[600],
  },
  durationText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: baseColors.text.primary,
    fontFamily: "monospace",
  },
  recordedContainer: {
    alignItems: "center",
    gap: 2,
  },
  recordedTextContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  recordedText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: baseColors.text.muted,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  uploadingText: {
    fontSize: typography.size.sm,
    color: "#ffffff",
    fontWeight: typography.weight.bold,
  },
});

export default VoiceRecorder;

const getFileType = (uri: string) => {
  const fileExtension = uri.split(".").pop();
  return fileExtension === "m4a" ? "audio/m4a" : "audio/mpeg";
};
