import React, { createContext, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerContent from "./components/DrawerContent";
import Dashboard from "./screens/Dashboard";
import AccountDetails from "./screens/AccountDetails";

// Create a Context for sharing accounts and updates
export const AccountsContext = createContext();

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Dashboard and related screens
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="AccountDetails" component={AccountDetails} />
  </Stack.Navigator>
);

export default function App() {
  const [accounts, setAccounts] = useState([]);

  // Load accounts from AsyncStorage on mount
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

  // Function to update accounts and save to AsyncStorage
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
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Drawer.Screen name="Home" component={DashboardStack} />
        </Drawer.Navigator>
      </NavigationContainer>
    </AccountsContext.Provider>
  );
}