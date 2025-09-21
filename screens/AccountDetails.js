import React, { useState, useEffect, useContext } from "react";
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
import moment from "moment";
import { AccountsContext } from "../App"; // Ensure this path matches your project structure

export default function AccountDetails({ route, navigation }) {
  const { accountId } = route.params;
  const { accounts, updateAccounts } = useContext(AccountsContext) || {};
  const [account, setAccount] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [particular, setParticular] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (!accounts) {
      Alert.alert("Error", "Accounts context not available");
      return;
    }
    const foundAccount = accounts.find((acc) => acc.id === accountId);
    setAccount(
      foundAccount || { id: accountId, name: "New Account", transactions: [] }
    );
  }, [accounts, accountId]);

  const addTransaction = () => {
    if (!particular || !amount || isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid particular and amount.");
      return;
    }

    const newTransaction = {
      date: new Date(),
      particular,
      credit: type === "credit" ? parseFloat(amount) : 0,
      debit: type === "debit" ? parseFloat(amount) : 0,
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId
        ? { ...acc, transactions: [...acc.transactions, newTransaction] }
        : acc
    );

    updateAccounts(updatedAccounts);
    setAccount((prev) => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
    }));

    resetModal();
  };

  const editTransaction = () => {
    if (!particular || !amount || isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid particular and amount.");
      return;
    }

    const updatedTransaction = {
      date:
        editingIndex !== null
          ? account.transactions[editingIndex].date
          : new Date(), // Preserve original date
      particular,
      credit: type === "credit" ? parseFloat(amount) : 0,
      debit: type === "debit" ? parseFloat(amount) : 0,
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId
        ? {
            ...acc,
            transactions: acc.transactions.map((t, i) =>
              i === editingIndex ? updatedTransaction : t
            ),
          }
        : acc
    );

    updateAccounts(updatedAccounts);
    setAccount((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t, i) =>
        i === editingIndex ? updatedTransaction : t
      ),
    }));

    resetModal();
  };

  const deleteTransaction = (index) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedAccounts = accounts.map((acc) =>
            acc.id === accountId
              ? {
                  ...acc,
                  transactions: acc.transactions.filter((_, i) => i !== index),
                }
              : acc
          );

          updateAccounts(updatedAccounts);
          setAccount((prev) => ({
            ...prev,
            transactions: prev.transactions.filter((_, i) => i !== index),
          }));
        },
      },
    ]);
  };

  const resetModal = () => {
    setModalVisible(false);
    setParticular("");
    setAmount("");
    setType("credit");
    setEditingIndex(null);
  };

  if (!account) return <Text>Loading...</Text>;

  const credit = account.transactions.reduce(
    (sum, t) => sum + (t.credit || 0),
    0
  );
  const debit = account.transactions.reduce(
    (sum, t) => sum + (t.debit || 0),
    0
  );
  const balance = credit - debit;

  const renderTransaction = ({ item, index }) => (
    <View style={styles.transactionCard}>
      <TouchableOpacity
        onPress={() => {
          setEditingIndex(index);
          setParticular(item.particular);
          setAmount((item.credit || item.debit).toString());
          setType(item.credit ? "credit" : "debit");
          setModalVisible(true);
        }}
      >
        <View style={styles.transactionHeader}>
          <Text style={styles.dateText}>
            {moment(item.date).format("DD MMM YYYY")}
          </Text>
          <Text style={styles.particularText}>{item.particular}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.creditText}>
            {item.credit ? `+ ৳ ${item.credit.toFixed(2)}` : ""}
          </Text>
          <Text style={styles.debitText}>
            {item.debit ? `- ৳ ${item.debit.toFixed(2)}` : ""}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.transactionActions}>
        <Ionicons
          name="pencil"
          size={20}
          color="#007C00"
          onPress={() => {
            setEditingIndex(index);
            setParticular(item.particular);
            setAmount((item.credit || item.debit).toString());
            setType(item.credit ? "credit" : "debit");
            setModalVisible(true);
          }}
          style={styles.iconButton}
        />
        <Ionicons
          name="trash"
          size={20}
          color="red"
          onPress={() => deleteTransaction(index)}
          style={styles.iconButton}
        />
      </View>
    </View>
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
          onPress={() => {
            setEditingIndex(null);
            setParticular("");
            setAmount("");
            setType("credit");
            setModalVisible(true);
          }}
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
        <Text style={styles.creditTotal}>Credit ↑ ৳ {credit.toFixed(2)}</Text>
        <Text style={styles.debitTotal}>Debit ↓ ৳ {debit.toFixed(2)}</Text>
        <Text style={styles.balanceTotal}>Balance ৳ {balance.toFixed(2)}</Text>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIndex !== null ? "Edit Transaction" : "Add Transaction"}
            </Text>
            <Text style={{ marginBottom: 6 }}>
              Date:{" "}
              {moment(
                editingIndex !== null
                  ? account.transactions[editingIndex]?.date
                  : new Date()
              ).format("DD MMM YYYY")}
            </Text>

            <View style={styles.radioRow}>
              <TouchableOpacity onPress={() => setType("credit")}>
                <Text style={styles.radioText}>
                  {type === "credit" ? "●" : "○"} Credit (+)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setType("debit")}>
                <Text style={styles.radioText}>
                  {type === "debit" ? "●" : "○"} Debit (-)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))} // Allow only numbers and decimal
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
                onPress={resetModal}
              >
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={
                  editingIndex !== null ? editTransaction : addTransaction
                }
              >
                <Text style={[styles.buttonText, { color: "white" }]}>
                  {editingIndex !== null ? "SAVE" : "ADD"}
                </Text>
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
    backgroundColor: "#007C00",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionHeader: {
    flex: 1,
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
  transactionActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: { marginLeft: 10 },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16, // space between children
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  creditTotal: { color: "green", fontWeight: "bold",textAlign:"center" },
  debitTotal: { color: "red", fontWeight: "bold",textAlign:"center" },
  balanceTotal: {
    backgroundColor: "#007C00",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "bold",
    textAlign:"center"
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
    color: "#007C00",
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioText: {
    fontSize: 16,
    color: "#333",
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
    backgroundColor: "#007C00",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#333",
  },
});
