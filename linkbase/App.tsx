import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./src/i18n"; // Initialize i18n
import HomeScreen from "./src/pages/HomeScreen";
import AddConnectionScreen from "./src/pages/AddConnectionScreen";
import AddVoiceConnectionsScreen from "./src/pages/AddVoiceConnectionsScreen";
import ConnectionDetailScreen from "./src/pages/ConnectionDetailScreen";
import EditConnectionScreen from "./src/pages/EditConnectionScreen";
import SettingsScreen from "./src/pages/SettingsScreen";
import HelpSupportScreen from "./src/pages/HelpSupportScreen";
import AppearanceScreen from "./src/pages/AppearanceScreen";
import NotificationsScreen from "./src/pages/NotificationsScreen";
import SyncScreen from "./src/pages/SyncScreen";
import ImportExportScreen from "./src/pages/ImportExportScreen";
import OnboardingLanguageScreen from "./src/pages/OnboardingLanguageScreen";
import OnboardingThemeScreen from "./src/pages/OnboardingThemeScreen";
import OnboardingImportScreen from "./src/pages/OnboardingImportScreen";
import { useSessionUserStore } from "./src/hooks/useGetSessionUser";
import LoadingScreen from "./src/pages/LoadingScreen";
import { TRPCProvider } from "./src/providers/TRPCProvider";
import { trpc } from "./src/utils/trpc";
import { Alert } from "react-native";
import { useThemeStore } from "./src/hooks/useThemeStore";
import { useOnboardingStore } from "./src/hooks/useOnboardingStore";
import { useTranslation } from "./src/hooks/useTranslation";

export type RootStackParamList = {
  Loading: undefined;
  Home: undefined;
  AddConnection: undefined;
  AddVoiceConnections: undefined;
  ConnectionDetail: { connectionId: string };
  EditConnection: { connectionId: string };
  Settings: undefined;
  HelpSupport: undefined;
  Appearance: undefined;
  Notifications: undefined;
  Sync: undefined;
  ImportExport: undefined;
  OnboardingLanguage: undefined;
  OnboardingTheme: undefined;
  OnboardingImport: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const { initializeUserId, userId, isInitializing, isInitialLoading } =
    useSessionUserStore();
  const { mutateAsync: createUser } = trpc.linkbase.users.create.useMutation();
  const {
    initializeTheme,
    colors,
    isInitializing: isThemeInitializing,
  } = useThemeStore();
  const {
    initializeOnboarding,
    isCompleted: isOnboardingCompleted,
    isInitializing: isOnboardingInitializing,
    selectedTheme,
  } = useOnboardingStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (userId || isInitializing === true) return;
    initializeUserId(async () => {
      try {
        const { id } = await createUser();
        return id;
      } catch (error) {
        console.error("Error creating user:", error);
        Alert.alert(t("sync.errorCreatingUser"), t("sync.pleaseTryAgainLater"));
        return "";
      }
    });
  }, [initializeUserId, userId, isInitializing, createUser, t]);

  useEffect(() => {
    initializeOnboarding();
  }, [initializeOnboarding]);

  useEffect(() => {
    console.log("App: useEffect triggered", {
      isOnboardingInitializing,
      selectedTheme,
      isOnboardingCompleted,
    });

    if (!isOnboardingInitializing) {
      console.log("App: Initializing theme store");
      // Always initialize theme store, with or without selected theme
      initializeTheme(selectedTheme);
    }
  }, [
    initializeTheme,
    isOnboardingInitializing,
    selectedTheme,
    isOnboardingCompleted,
  ]);

  const shouldShowLoading =
    isInitializing ||
    isInitialLoading ||
    isOnboardingInitializing ||
    isThemeInitializing;

  console.log("App: Render state:", {
    isInitializing,
    isInitialLoading,
    isOnboardingInitializing,
    isThemeInitializing,
    isOnboardingCompleted,
    shouldShowLoading,
    selectedTheme,
  });

  // Show loading screen while initializing
  if (shouldShowLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <LoadingScreen />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={
              !isOnboardingCompleted
                ? "OnboardingLanguage"
                : "Home"
            }
            screenOptions={() => ({
              headerStyle: {
                backgroundColor: colors?.background?.surface || "#0f172a",
              },
              headerTintColor: colors?.text?.primary || "#e2e8f0",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            })}
          >

            <Stack.Screen
              name="OnboardingLanguage"
              component={OnboardingLanguageScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="OnboardingTheme"
              component={OnboardingThemeScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="OnboardingImport"
              component={OnboardingImportScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Linkbase" }}
            />
            <Stack.Screen
              name="AddConnection"
              component={AddConnectionScreen}
              options={{ title: "Add Connection" }}
            />
            <Stack.Screen
              name="AddVoiceConnections"
              component={AddVoiceConnectionsScreen}
              options={{ title: "Voice Connections" }}
            />
            <Stack.Screen
              name="ConnectionDetail"
              component={ConnectionDetailScreen}
              options={{ title: "Connection Details" }}
            />
            <Stack.Screen
              name="EditConnection"
              component={EditConnectionScreen}
              options={{ title: "Edit Connection" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
            <Stack.Screen
              name="HelpSupport"
              component={HelpSupportScreen}
              options={{ title: "Help & Support" }}
            />
            <Stack.Screen
              name="Appearance"
              component={AppearanceScreen}
              options={{ title: "Appearance" }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: "Notifications" }}
            />
            <Stack.Screen
              name="Sync"
              component={SyncScreen}
              options={{ title: "Sync" }}
            />
            <Stack.Screen
              name="ImportExport"
              component={ImportExportScreen}
              options={{ title: "Import & Export" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const MainApp = () => {
  return (
    <TRPCProvider>
      <App />
    </TRPCProvider>
  );
};

export default MainApp;
