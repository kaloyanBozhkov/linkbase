import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
import { useSessionUserStore } from "./src/hooks/useGetSessionUser";
import LoadingScreen from "./src/pages/LoadingScreen";
import { TRPCProvider } from "./src/providers/TRPCProvider";
import { trpc } from "./src/utils/trpc";
import { Alert } from "react-native";
import { useThemeStore } from "./src/hooks/useThemeStore";

export type RootStackParamList = {
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
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const { initializeUserId, userId, isInitializing, isInitialLoading } =
    useSessionUserStore();
  const { mutateAsync: createUser } = trpc.linkbase.users.create.useMutation();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    if (userId || isInitializing === true) return;
    initializeUserId(async () => {
      try {
        const { id } = await createUser();
        return id;
      } catch (error) {
        console.error("Error creating user:", error);
        Alert.alert("Error creating user", "Please try again later");
        return "";
      }
    });
  }, [initializeUserId, userId, isInitializing, createUser]);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={() => ({
              headerStyle: {
                backgroundColor: useThemeStore.getState().colors.background.surface,
              },
              headerTintColor: useThemeStore.getState().colors.text.primary,
              headerTitleStyle: {
                fontWeight: "bold",
              },
            })}
          >
            {isInitializing || isInitialLoading ? (
              <Stack.Screen
                name="Home"
                component={LoadingScreen}
                options={{ title: "Linkbase" }}
              />
            ) : (
              <>
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
              </>
            )}
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
