import React, { createContext, useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import DrawerContent from "./components/DrawerContent";
import Dashboard from "./screens/Dashboard";
import AccountDetails from "./screens/AccountDetails";

export const AccountsContext = createContext();

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="AccountDetails" component={AccountDetails} />
  </Stack.Navigator>
);

export default function App() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const storedAccounts = await AsyncStorage.getItem("accounts");
        if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    };
    loadAccounts();
  }, []);

  const updateAccounts = async (updatedAccounts) => {
    try {
      await AsyncStorage.setItem("accounts", JSON.stringify(updatedAccounts));
      setAccounts(updatedAccounts);
    } catch (err) {
      console.error("Failed to save accounts:", err);
    }
  };

  return (
    <AccountsContext.Provider value={{ accounts, updateAccounts }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <NavigationContainer>
            <Drawer.Navigator
              drawerContent={(props) => <DrawerContent {...props} />}
              screenOptions={{ headerShown: false }}
            >
              <Drawer.Screen name="Home" component={DashboardStack} />
            </Drawer.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AccountsContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // adjust if your app uses dark theme
  },
});
