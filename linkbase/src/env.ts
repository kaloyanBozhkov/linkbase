import { z } from "zod";

// Environment variable schema for React Native/Expo
const envSchema = z.object({
  EXPO_PUBLIC_S3_APP_FOLDER_NAME: z.string(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      EXPO_PUBLIC_S3_APP_FOLDER_NAME: process.env.EXPO_PUBLIC_S3_APP_FOLDER_NAME,
    });
  } catch (error) {
    console.warn("Environment validation failed:", error);
    return {
      EXPO_PUBLIC_S3_APP_FOLDER_NAME: "key-moments-extract",
    };
  }
};

export const env = parseEnv();
