import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { AccountsContext } from "../App";

export default function DrawerContent(props) {
  const { accounts } = useContext(AccountsContext);
  const [totals, setTotals] = useState({ credit: 0, debit: 0, balance: 0 });

  // Calculate total credit, debit, and balance whenever accounts change
  useEffect(() => {
    const calculateTotals = () => {
      const totalCredit = accounts.reduce((sum, acc) => {
        return sum + acc.transactions.reduce((tSum, t) => tSum + (t.credit || 0), 0);
      }, 0);
      const totalDebit = accounts.reduce((sum, acc) => {
        return sum + acc.transactions.reduce((tSum, t) => tSum + (t.debit || 0), 0);
      }, 0);
      const totalBalance = totalCredit - totalDebit;
      setTotals({ credit: totalCredit, debit: totalDebit, balance: totalBalance });
    };
    calculateTotals();
  }, [accounts]);

  return (
    <DrawerContentScrollView {...props}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Ionicons name="book" size={36} color="white" />
        <Text style={styles.headerText}>Account Manager</Text>

        {/* Balance Box */}
        <View style={styles.balanceBox}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Credit (+)</Text>
            <Text style={styles.balanceValue}> ৳ {totals.credit}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Debit (-)</Text>
            <Text style={styles.balanceValue}> ৳ {totals.debit}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={[styles.balanceValue, styles.highlightValue]}>
               ৳ {totals.balance}
            </Text>
          </View>
        </View>
      </View>

      {/* ===== DRAWER ITEMS ===== */}
      <DrawerItem
        icon={() => <Ionicons name="home" size={24} color="#007C00" />}
        label="Home"
        onPress={() => props.navigation.navigate("Dashboard")}
      />
      <DrawerItem
        icon={() => <Ionicons name="cloud-upload" size={24} color="gray" />}
        label="Backup"
        onPress={() =>
          Alert.alert("Placeholder", "Backup functionality not implemented.")
        }
      />
      <DrawerItem
        icon={() => <Ionicons name="refresh" size={24} color="gray" />}
        label="Restore"
        onPress={() =>
          Alert.alert("Placeholder", "Restore functionality not implemented.")
        }
      />
      <DrawerItem
        icon={() => <Ionicons name="cog" size={24} color="gray" />}
        label="Change currency"
        onPress={() =>
          Alert.alert("Placeholder", "Change currency not implemented.")
        }
      />
      <DrawerItem
        icon={() => <Ionicons name="key" size={24} color="gray" />}
        label="Change password"
        onPress={() =>
          Alert.alert("Placeholder", "Enter new password (not saved).")
        }
      />
      <DrawerItem
        icon={() => <Ionicons name="shield" size={24} color="gray" />}
        label="Change security question"
        onPress={() =>
          Alert.alert("Placeholder", "Change security question not implemented.")
        }
      />
      <DrawerItem
        icon={() => <Ionicons name="settings" size={24} color="gray" />}
        label="Settings"
        onPress={() =>
          Alert.alert("Placeholder", "Settings not implemented.")
        }
      />
      <DrawerItem
        icon={() => <Ionicons name="help-circle" size={24} color="gray" />}
        label="FAQs"
        onPress={() => Alert.alert("Placeholder", "FAQs not implemented.")}
      />
      <DrawerItem
        icon={() => <Ionicons name="share-social" size={24} color="gray" />}
        label="Share the app"
        onPress={() => Alert.alert("Placeholder", "Share not implemented.")}
      />
      <DrawerItem
        icon={() => <Ionicons name="star" size={24} color="gray" />}
        label="Rate the app"
        onPress={() => Alert.alert("Placeholder", "Rate not implemented.")}
      />
      <DrawerItem
        icon={() => <Ionicons name="lock-closed" size={24} color="gray" />}
        label="Privacy policy"
        onPress={() =>
          Alert.alert("Placeholder", "Privacy policy not implemented.")
        }
      />
      <DrawerItem
        icon={() => <Ionicons name="apps" size={24} color="gray" />}
        label="More apps"
        onPress={() => Alert.alert("Placeholder", "More apps not implemented.")}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#007C00",
    paddingVertical: 30,
    alignItems: "center",
    borderRadius:10
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    letterSpacing: 1,
  },
  balanceBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  balanceItem: {
    alignItems: "center",
  },
  balanceLabel: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
  },
  balanceValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  highlightValue: {
    color: "#FFD700", // Gold for balance
  },
});