import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

export default function AccountDetails({ route, navigation }) {
  const { accountId } = route.params;
  const [account, setAccount] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [particular, setParticular] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const storedAccounts = await AsyncStorage.getItem("accounts");
      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        const foundAccount = accounts.find((acc) => acc.id === accountId);
        setAccount(
          foundAccount || { id: accountId, name: "New Account", transactions: [] }
        );
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load account");
    }
  };

  const saveAccounts = async (updatedAccounts) => {
    try {
      await AsyncStorage.setItem("accounts", JSON.stringify(updatedAccounts));
    } catch (err) {
      Alert.alert("Error", "Failed to save accounts");
    }
  };

  const addTransaction = async () => {
    if (!particular || !amount) return;
    const updatedTransaction = {
      date: new Date(),
      particular,
      credit: type === "credit" ? parseFloat(amount) : 0,
      debit: type === "debit" ? parseFloat(amount) : 0,
    };

    const stored = await AsyncStorage.getItem("accounts");
    const accounts = stored ? JSON.parse(stored) : [];

    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId
        ? { ...acc, transactions: [...acc.transactions, updatedTransaction] }
        : acc
    );

    saveAccounts(updatedAccounts);

    setAccount((prev) => ({
      ...prev,
      transactions: [...prev.transactions, updatedTransaction],
    }));

    setModalVisible(false);
    setParticular("");
    setAmount("");
  };

  const deleteTransaction = async (index) => {
    Alert.alert("Delete", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const stored = await AsyncStorage.getItem("accounts");
          const accounts = stored ? JSON.parse(stored) : [];

          const updatedAccounts = accounts.map((acc) =>
            acc.id === accountId
              ? {
                  ...acc,
                  transactions: acc.transactions.filter((_, i) => i !== index),
                }
              : acc
          );

          saveAccounts(updatedAccounts);

          setAccount((prev) => ({
            ...prev,
            transactions: prev.transactions.filter((_, i) => i !== index),
          }));
        },
      },
    ]);
  };

  if (!account) return <Text>Loading...</Text>;

  const credit = account.transactions.reduce(
    (sum, t) => sum + (t.credit || 0),
    0
  );
  const debit = account.transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const balance = credit - debit;

  const renderTransaction = ({ item, index }) => (
    <TouchableOpacity
      onLongPress={() => deleteTransaction(index)}
      style={styles.transactionCard}
    >
      <View style={styles.transactionHeader}>
        <Text style={styles.dateText}>
          {moment(item.date).format("DD MMM YYYY")}
        </Text>
        <Text style={styles.particularText}>{item.particular}</Text>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.creditText}>
          {item.credit ? `+ BDT ${item.credit}` : ""}
        </Text>
        <Text style={styles.debitText}>
          {item.debit ? `- BDT ${item.debit}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>{account.name}</Text>
        <Ionicons
          name="add-circle"
          size={26}
          color="white"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Transactions */}
      <FlatList
        data={account.transactions}
        renderItem={renderTransaction}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* Totals */}
      <View style={styles.balanceRow}>
        <Text style={styles.creditTotal}>Credit ↑ BDT {credit}</Text>
        <Text style={styles.debitTotal}>Debit ↓ BDT {debit}</Text>
        <Text style={styles.balanceTotal}>Balance BDT {balance}</Text>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <Text style={{ marginBottom: 6 }}>
              Date: {moment().format("DD MMM YYYY")}
            </Text>

            <View style={styles.radioRow}>
              <TouchableOpacity onPress={() => setType("credit")}>
                <Text>
                  {type === "credit" ? "●" : "○"} Credit (+)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setType("debit")}>
                <Text>
                  {type === "debit" ? "●" : "○"} Debit (-)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Particular"
              value={particular}
              onChangeText={setParticular}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#333" }}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={addTransaction}
              >
                <Text style={{ color: "white" }}>ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6A1B9A",
    padding: 15,
    elevation: 4,
  },
  headerText: { color: "white", fontSize: 20, fontWeight: "bold" },

  transactionCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dateText: { fontSize: 14, color: "#666" },
  particularText: { fontSize: 16, fontWeight: "600", color: "#333" },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  creditText: { color: "green", fontWeight: "bold" },
  debitText: { color: "red", fontWeight: "bold" },

  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  creditTotal: { color: "green", fontWeight: "bold" },
  debitTotal: { color: "red", fontWeight: "bold" },
  balanceTotal: {
    backgroundColor: "#6A1B9A",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "bold",
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#6A1B9A",
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 6,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  saveButton: {
    backgroundColor: "#6A1B9A",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
});
