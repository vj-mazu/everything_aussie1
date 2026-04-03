import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScreenBase from "@/components/ScreenBase";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { CheckCircle, Clock, Trash2 } from "lucide-react-native";

export default function Anamath() {
  useRequireAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["anamath", status, page],
    queryFn: async () => {
      const res = await fetch(`/api/anamath?status=${status}&page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch anamath");
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

  const closeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch("/api/anamath", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "close" }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anamath"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch("/api/anamath", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anamath"] });
    },
  });

  return (
    <ScreenBase>
      <View style={{ flex: 1, padding: 20 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: isDark ? "#fff" : "#111827",
            marginBottom: 20,
          }}
        >
          Anamath
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
            backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
            borderRadius: 8,
            padding: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setStatus("open");
              setPage(1);
            }}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: status === "open" ? "#10B981" : "transparent",
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: status === "open" ? "#fff" : "#6B7280",
              }}
            >
              OPEN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setStatus("closed");
              setPage(1);
            }}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: status === "closed" ? "#3B82F6" : "transparent",
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: status === "closed" ? "#fff" : "#6B7280",
              }}
            >
              CLOSED
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#fff",
                padding: 16,
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {item.date}
                </Text>
                {status === "open" ? (
                  <Clock size={16} color="#F59E0B" />
                ) : (
                  <CheckCircle size={16} color="#10B981" />
                )}
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: isDark ? "#fff" : "#111827",
                }}
              >
                {item.ledger_name}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#10B981",
                  marginVertical: 4,
                }}
              >
                ₹{Number(item.amount).toLocaleString("en-IN")}
              </Text>
              {item.remarks && (
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  {item.remarks}
                </Text>
              )}

              {status === "open" && canManage && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={{ padding: 10 }}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => closeMutation.mutate(item.id)}
                    style={{
                      backgroundColor: "#10B981",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      marginLeft: 10,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Close Anamath
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <ActivityIndicator
              style={{ marginTop: 20 }}
              animating={isLoading}
            />
          }
        />
      </View>
    </ScreenBase>
  );
}

const handleDelete = (id) => {
  // We need to define this or use mutation directly
};
