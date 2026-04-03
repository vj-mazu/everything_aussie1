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
import { Plus, Edit2, Trash2, Search } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function LedgerCreation() {
  useRequireAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { data: ledgers = [], isLoading } = useQuery({
    queryKey: ["ledgers"],
    queryFn: async () => {
      const res = await fetch("/api/ledgers");
      if (!res.ok) throw new Error("Failed to fetch ledgers");
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

  const canEdit =
    profile?.profile?.role === "admin" || profile?.profile?.role === "manager";

  const mutation = useMutation({
    mutationFn: async (data) => {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/ledgers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save ledger");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledgers"] });
      setName("");
      setRemarks("");
      setEditingId(null);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch("/api/ledgers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete ledger");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledgers"] });
    },
  });

  const handleSave = () => {
    if (!name.trim()) return Alert.alert("Error", "Name is required");
    mutation.mutate({ id: editingId, name, remarks });
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Ledger", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const filteredLedgers = ledgers.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScreenBase>
      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1, padding: 20 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: isDark ? "#fff" : "#111827",
              marginBottom: 20,
            }}
          >
            Ledgers
          </Text>

          {/* Creation Form */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              padding: 16,
              borderRadius: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
            }}
          >
            <TextInput
              placeholder="Ledger Name (Unique)"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              style={{
                backgroundColor: isDark ? "#121212" : "#fff",
                color: isDark ? "#fff" : "#000",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              placeholder="Remarks (Optional)"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              style={{
                backgroundColor: isDark ? "#121212" : "#fff",
                color: isDark ? "#fff" : "#000",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
              value={remarks}
              onChangeText={setRemarks}
            />
            <TouchableOpacity
              onPress={handleSave}
              disabled={mutation.isLoading}
              style={{
                backgroundColor: "#10B981",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              {mutation.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {editingId ? "Update Ledger" : "Create Ledger"}
                </Text>
              )}
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity
                onPress={() => {
                  setEditingId(null);
                  setName("");
                  setRemarks("");
                }}
                style={{ marginTop: 8, alignItems: "center" }}
              >
                <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
                  Cancel Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              borderRadius: 8,
              paddingHorizontal: 12,
              marginBottom: 16,
            }}
          >
            <Search size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
            <TextInput
              placeholder="Search Ledgers..."
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              style={{ flex: 1, padding: 12, color: isDark ? "#fff" : "#000" }}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* List */}
          <FlatList
            data={filteredLedgers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 16,
                  backgroundColor: isDark ? "#1E1E1E" : "#fff",
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: isDark ? "#fff" : "#111827",
                    }}
                  >
                    {item.name}
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
                </View>
                {canEdit && (
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(item.id);
                        setName(item.name);
                        setRemarks(item.remarks || "");
                      }}
                      style={{ padding: 8 }}
                    >
                      <Edit2 size={18} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      style={{ padding: 8 }}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: isDark ? "#6B7280" : "#9CA3AF",
                }}
              >
                No ledgers found.
              </Text>
            }
          />
        </View>
      </KeyboardAvoidingAnimatedView>
    </ScreenBase>
  );
}
