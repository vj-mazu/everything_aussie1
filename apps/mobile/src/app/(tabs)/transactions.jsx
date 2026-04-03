import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScreenBase from "@/components/ScreenBase";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const TransactionCard = ({
  item,
  index,
  page,
  isDark,
  canManage,
  onDelete,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const isCredit = item.type === "credit";

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: 12,
      }}
    >
      <View
        style={{
          backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: isCredit
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            {isCredit ? (
              <TrendingUp size={24} color="#10B981" />
            ) : (
              <TrendingDown size={24} color="#EF4444" />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  backgroundColor: isCredit ? "#D1FAE5" : "#FEE2E2",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: isCredit ? "#059669" : "#DC2626",
                    textTransform: "uppercase",
                  }}
                >
                  {item.type}
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
                #{index + 1 + (page - 1) * 50}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: isDark ? "#FFFFFF" : "#111827",
                marginBottom: 2,
              }}
            >
              {item.ledger_name}
            </Text>

            <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>
              {item.txn_id}
            </Text>

            {item.remarks && (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  fontStyle: "italic",
                }}
              >
                "{item.remarks}"
              </Text>
            )}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: isCredit ? "#10B981" : "#EF4444",
                marginBottom: 8,
              }}
            >
              {isCredit ? "+" : "-"}₹
              {Number(item.amount).toLocaleString("en-IN")}
            </Text>
            {canManage && (
              <TouchableOpacity
                onPress={onDelete}
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default function Transactions() {
  useRequireAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);

  // Form State
  const [type, setType] = useState("credit");
  const [ledgerId, setLedgerId] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [includeAnamath, setIncludeAnamath] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", date, page],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?date=${date}&page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  const { data: ledgers = [] } = useQuery({
    queryKey: ["ledgers"],
    queryFn: async () => {
      const res = await fetch("/api/ledgers");
      return res.json();
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      return res.json();
    },
  });

  const canManage =
    profile?.profile?.role === "admin" || profile?.profile?.role === "manager";

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["anamath"] });
      setModalVisible(false);
      resetForm();
      Alert.alert("Success ✅", "Transaction saved successfully!");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      Alert.alert("Deleted ✅", "Transaction deleted and balances updated.");
    },
  });

  const resetForm = () => {
    setType("credit");
    setLedgerId("");
    setAmount("");
    setRemarks("");
    setIncludeAnamath(false);
  };

  const handleSave = () => {
    if (!ledgerId || !amount || parseFloat(amount) <= 0) {
      return Alert.alert("Error", "Please fill all required fields correctly");
    }
    mutation.mutate({
      type,
      ledger_id: ledgerId,
      amount: parseFloat(amount),
      remarks,
      date,
      include_anamath: includeAnamath,
    });
  };

  const changeDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
    setPage(1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8FAFC" }}>
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: isDark ? "#FFFFFF" : "#111827",
            }}
          >
            Transactions
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: "#10B981",
              width: 48,
              height: 48,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Plus color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Premium Date Selector */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            padding: 16,
            borderRadius: 16,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <TouchableOpacity
            onPress={() => changeDate(-1)}
            style={{
              backgroundColor: isDark ? "#2A2A2A" : "#F3F4F6",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <ChevronLeft color={isDark ? "#FFFFFF" : "#111827"} size={20} />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>
              Selected Date
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: isDark ? "#FFFFFF" : "#111827",
              }}
            >
              {new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => changeDate(1)}
            style={{
              backgroundColor: isDark ? "#2A2A2A" : "#F3F4F6",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <ChevronRight color={isDark ? "#FFFFFF" : "#111827"} size={20} />
          </TouchableOpacity>
        </View>

        {/* Balance Overview Card */}
        {data?.balance && (
          <LinearGradient
            colors={isDark ? ["#1E3A8A", "#1E40AF"] : ["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              borderRadius: 20,
              marginBottom: 20,
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 8,
                fontWeight: "500",
              }}
            >
              Opening Balance
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: 16,
              }}
            >
              ₹{Number(data.balance.opening_balance).toLocaleString("en-IN")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.2)",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                  }}
                >
                  Credits
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#D1FAE5" }}
                >
                  +₹{Number(data.balance.total_credits).toLocaleString("en-IN")}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                  }}
                >
                  Debits
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#FEE2E2" }}
                >
                  -₹{Number(data.balance.total_debits).toLocaleString("en-IN")}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                  }}
                >
                  Closing
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}
                >
                  ₹
                  {Number(data.balance.closing_balance).toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}
      </View>

      {/* Transaction List */}
      <FlatList
        data={data?.transactions || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <TransactionCard
            item={item}
            index={index}
            page={page}
            isDark={isDark}
            canManage={canManage}
            onDelete={() =>
              Alert.alert(
                "Delete Transaction",
                "This will automatically update all future balances. Continue?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    onPress: () => deleteMutation.mutate(item.id),
                    style: "destructive",
                  },
                ],
              )
            }
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isDark ? "#1A1A1A" : "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <FileText size={36} color="#9CA3AF" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#9CA3AF" }}>
              No transactions yet
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
              Tap + to add your first transaction
            </Text>
          </View>
        }
        onEndReached={() => {
          if (data?.transactions?.length === 50) setPage((p) => p + 1);
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Premium Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingAnimatedView
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#121212" : "#FFFFFF",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingTop: 24,
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 24,
              maxHeight: "90%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: isDark ? "#FFFFFF" : "#111827",
                }}
              >
                New Transaction
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: isDark ? "#2A2A2A" : "#F3F4F6",
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X size={20} color={isDark ? "#FFFFFF" : "#111827"} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selector */}
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 24,
                  backgroundColor: isDark ? "#1A1A1A" : "#F3F4F6",
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <TouchableOpacity
                  onPress={() => setType("credit")}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    backgroundColor:
                      type === "credit" ? "#10B981" : "transparent",
                    borderRadius: 10,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TrendingUp
                    size={18}
                    color={type === "credit" ? "#FFFFFF" : "#6B7280"}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontWeight: "600",
                      color: type === "credit" ? "#FFFFFF" : "#6B7280",
                    }}
                  >
                    CREDIT
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setType("debit");
                    setIncludeAnamath(false);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    backgroundColor:
                      type === "debit" ? "#EF4444" : "transparent",
                    borderRadius: 10,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TrendingDown
                    size={18}
                    color={type === "debit" ? "#FFFFFF" : "#6B7280"}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontWeight: "600",
                      color: type === "debit" ? "#FFFFFF" : "#6B7280",
                    }}
                  >
                    DEBIT
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Ledger Picker */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginBottom: 8,
                  fontWeight: "500",
                }}
              >
                Ledger
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
                  borderRadius: 12,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                }}
              >
                <Picker
                  selectedValue={ledgerId}
                  onValueChange={setLedgerId}
                  style={{ color: isDark ? "#FFFFFF" : "#111827" }}
                >
                  <Picker.Item label="Select Ledger" value="" />
                  {ledgers.map((l) => (
                    <Picker.Item key={l.id} label={l.name} value={l.id} />
                  ))}
                </Picker>
              </View>

              {/* Amount Input */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginBottom: 8,
                  fontWeight: "500",
                }}
              >
                Amount (₹)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                }}
              >
                <DollarSign size={20} color="#6B7280" />
                <TextInput
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    flex: 1,
                    padding: 16,
                    color: isDark ? "#FFFFFF" : "#111827",
                    fontSize: 16,
                  }}
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Remarks Input */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginBottom: 8,
                  fontWeight: "500",
                }}
              >
                Remarks (Optional)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                }}
              >
                <FileText size={20} color="#6B7280" />
                <TextInput
                  placeholder="Add a note..."
                  placeholderTextColor="#9CA3AF"
                  style={{
                    flex: 1,
                    padding: 16,
                    color: isDark ? "#FFFFFF" : "#111827",
                    fontSize: 16,
                  }}
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                />
              </View>

              {/* Anamath Checkbox */}
              {type === "credit" && (
                <TouchableOpacity
                  onPress={() => setIncludeAnamath(!includeAnamath)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    backgroundColor: includeAnamath
                      ? "rgba(16, 185, 129, 0.1)"
                      : isDark
                        ? "#1A1A1A"
                        : "#F9FAFB",
                    borderRadius: 12,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: includeAnamath
                      ? "#10B981"
                      : isDark
                        ? "#2A2A2A"
                        : "#E5E7EB",
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: includeAnamath ? "#10B981" : "#9CA3AF",
                      backgroundColor: includeAnamath
                        ? "#10B981"
                        : "transparent",
                      marginRight: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {includeAnamath && (
                      <Text style={{ color: "#FFFFFF", fontSize: 16 }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isDark ? "#FFFFFF" : "#111827",
                      }}
                    >
                      Save as Credit + Anamath
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                    >
                      Also track this in Anamath for special monitoring
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={mutation.isLoading}
                style={{
                  backgroundColor: type === "credit" ? "#10B981" : "#EF4444",
                  padding: 18,
                  borderRadius: 14,
                  alignItems: "center",
                  shadowColor: type === "credit" ? "#10B981" : "#EF4444",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {mutation.isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      fontSize: 16,
                      letterSpacing: 0.5,
                    }}
                  >
                    SAVE {type.toUpperCase()}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingAnimatedView>
      </Modal>
    </View>
  );
}
