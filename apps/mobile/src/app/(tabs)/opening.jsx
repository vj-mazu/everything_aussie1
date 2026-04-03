import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScreenBase from "@/components/ScreenBase";
import { useRequireAuth } from "@/utils/auth/useAuth";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function OpeningBalance() {
  useRequireAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const queryClient = useQueryClient();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");

  const { data: balances = [], isLoading } = useQuery({
    queryKey: ["opening-balances"],
    queryFn: async () => {
      const res = await fetch("/api/opening-balance");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/opening-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to set opening balance");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opening-balances"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setAmount("");
      Alert.alert(
        "Success",
        "Opening balance set and future days recalculated.",
      );
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const handleSet = () => {
    if (!amount || parseFloat(amount) < 0)
      return Alert.alert("Error", "Invalid amount");
    mutation.mutate({ date, amount: parseFloat(amount) });
  };

  return (
    <ScreenBase>
      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1, padding: 20 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: isDark ? "#fff" : "#111827",
              marginBottom: 10,
            }}
          >
            Opening Balance
          </Text>
          <Text style={{ color: "#6B7280", marginBottom: 20 }}>
            Admin only: Manually set the starting capital for a specific date.
            This will automatically update all future balances.
          </Text>

          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              padding: 20,
              borderRadius: 16,
              marginBottom: 24,
            }}
          >
            <Text
              style={{ color: isDark ? "#9CA3AF" : "#6B7280", marginBottom: 8 }}
            >
              Date
            </Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={{
                backgroundColor: isDark ? "#121212" : "#fff",
                color: isDark ? "#fff" : "#000",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
              placeholder="YYYY-MM-DD"
            />
            <Text
              style={{ color: isDark ? "#9CA3AF" : "#6B7280", marginBottom: 8 }}
            >
              Amount (₹)
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={{
                backgroundColor: isDark ? "#121212" : "#fff",
                color: isDark ? "#fff" : "#000",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
              placeholder="0.00"
            />
            <TouchableOpacity
              onPress={handleSet}
              disabled={mutation.isLoading}
              style={{
                backgroundColor: "#3B82F6",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {mutation.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  SET OPENING BALANCE
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: isDark ? "#fff" : "#000",
              marginBottom: 12,
            }}
          >
            Manual History
          </Text>
          <FlatList
            data={balances}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 16,
                  backgroundColor: isDark ? "#1E1E1E" : "#fff",
                  borderRadius: 12,
                  marginBottom: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: "#3B82F6",
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#9CA3AF" : "#6B7280",
                    fontSize: 12,
                  }}
                >
                  {item.date}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  ₹{Number(item.opening_balance).toLocaleString("en-IN")}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: "#6B7280", textAlign: "center" }}>
                No manual opening balances set yet.
              </Text>
            }
          />
        </View>
      </KeyboardAvoidingAnimatedView>
    </ScreenBase>
  );
}
