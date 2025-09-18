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
import { AccountsContext } from "../App";

export default function Dashboard({ navigation }) {
  const { accounts, updateAccounts } = useContext(AccountsContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [editingAccount, setEditingAccount] = useState(null);
  const [editAccountName, setEditAccountName] = useState("");

  const addAccount = () => {
    if (!newAccountName) return;
    const newAccount = {
      id: Date.now().toString(),
      name: newAccountName,
      transactions: [],
    };
    const updatedAccounts = [...accounts, newAccount];
    updateAccounts(updatedAccounts);
    setModalVisible(false);
    setNewAccountName("");
  };

  const deleteAccount = (id) => {
    const updatedAccounts = accounts.filter((acc) => acc.id !== id);
    updateAccounts(updatedAccounts);
  };

  const renderAccount = ({ item }) => {
    const credit = item.transactions.reduce(
      (sum, t) => sum + (t.credit || 0),
      0
    );
    const debit = item.transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const balance = credit - debit;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("AccountDetails", { accountId: item.id })
        }
      >
        <View style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.accountName}>{item.name}</Text>
            <View style={styles.cardActions}>
              <Ionicons
                name="pencil"
                size={20}
                color="#6A1B9A"
                onPress={() => {
                  setEditingAccount(item);
                  setEditAccountName(item.name);
                  setModalVisible(true);
                }}
                style={styles.iconButton}
              />
              <Ionicons
                name="trash"
                size={20}
                color="red"
                onPress={() => deleteAccount(item.id)}
                style={styles.iconButton}
              />
            </View>
          </View>

          <View style={styles.balanceRow}>
            <View style={[styles.balanceBox, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="arrow-up-circle" size={20} color="#2196F3" />
              <Text style={styles.balanceLabel}>Credit</Text>
              <Text style={styles.balanceValue}>BDT {credit}</Text>
            </View>
            <View style={[styles.balanceBox, { backgroundColor: "#FFEBEE" }]}>
              <Ionicons name="arrow-down-circle" size={20} color="#F44336" />
              <Text style={styles.balanceLabel}>Debit</Text>
              <Text style={styles.balanceValue}>BDT {debit}</Text>
            </View>
            <View style={[styles.balanceBox, { backgroundColor: "#6A1B9A" }]}>
              <Ionicons name="wallet" size={20} color="white" />
              <Text style={[styles.balanceLabel, { color: "white" }]}>
                Balance
              </Text>
              <Text style={[styles.balanceValue, { color: "#FFD700" }]}>
                BDT {balance}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="menu"
          size={24}
          color="white"
          onPress={() => navigation.openDrawer()}
        />
        <Text style={styles.headerText}>Dashboard</Text>
        <Ionicons name="search" size={24} color="white" />
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAccount ? "Edit Account" : "Add New Account"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter account name"
              value={editingAccount ? editAccountName : newAccountName}
              onChangeText={(text) =>
                editingAccount
                  ? setEditAccountName(text)
                  : setNewAccountName(text)
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setEditingAccount(null);
                  setNewAccountName("");
                }}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (editingAccount) {
                    const updatedAccounts = accounts.map((acc) =>
                      acc.id === editingAccount.id
                        ? { ...acc, name: editAccountName }
                        : acc
                    );
                    updateAccounts(updatedAccounts);
                    setEditingAccount(null);
                  } else {
                    addAccount();
                  }
                  setModalVisible(false);
                }}
              >
                <Text style={styles.saveText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6A1B9A",
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  accountCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  accountName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardActions: { flexDirection: "row" },
  iconButton: { marginLeft: 10 },
  balanceRow: { flexDirection: "row", justifyContent: "space-between" },
  balanceBox: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
    color: "#333",
  },
  balanceValue: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#FF9800",
    borderRadius: 50,
    padding: 16,
    elevation: 6,
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
    borderRadius: 15,
    width: "85%",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#6A1B9A",
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 6,
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
  cancelText: { fontWeight: "bold", color: "#333" },
  saveButton: {
    backgroundColor: "#6A1B9A",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  saveText: { fontWeight: "bold", color: "white" },
});