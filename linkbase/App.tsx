import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./src/pages/HomeScreen";
import AddConnectionScreen from "./src/pages/AddConnectionScreen";
import ConnectionDetailScreen from "./src/pages/ConnectionDetailScreen";
import EditConnectionScreen from "./src/pages/EditConnectionScreen";
import { useSessionUserStore } from "./src/hooks/useGetSessionUser";
import LoadingScreen from "./src/pages/LoadingScreen";
import { userApi } from "./src/services/api";

export type RootStackParamList = {
  Home: undefined;
  AddConnection: undefined;
  ConnectionDetail: { connectionId: string };
  EditConnection: { connectionId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const { initializeUserId, userId, isInitializing, isInitialLoading } =
    useSessionUserStore();

  useEffect(() => {
    if (userId || isInitializing === true) return;
    initializeUserId(userApi.createUser);
  }, [initializeUserId, userId, isInitializing]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: "#3b82f6",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
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
                  name="ConnectionDetail"
                  component={ConnectionDetailScreen}
                  options={{ title: "Connection Details" }}
                />
                <Stack.Screen
                  name="EditConnection"
                  component={EditConnectionScreen}
                  options={{ title: "Edit Connection" }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
