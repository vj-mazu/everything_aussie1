import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import ScreenBase from "@/components/ScreenBase";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react-native";

export default function LedgerSummary() {
  useRequireAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedLedger, setSelectedLedger] = useState(null);

  const { data: summaries = [], isLoading } = useQuery({
    queryKey: ["ledger-summary"],
    queryFn: async () => {
      const res = await fetch("/api/ledger-summary");
      if (!res.ok) throw new Error("Failed to fetch summaries");
      return res.json();
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
          Ledger Summary
        </Text>

        <FlatList
          data={summaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const net = Number(item.total_credits) - Number(item.total_debits);
            return (
              <TouchableOpacity
                onPress={() => setSelectedLedger(item)}
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#fff",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: isDark ? "#fff" : "#111827",
                    }}
                  >
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 4 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#10B981",
                        marginRight: 10,
                      }}
                    >
                      CR: ₹{Number(item.total_credits).toLocaleString("en-IN")}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#EF4444" }}>
                      DR: ₹{Number(item.total_debits).toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: net >= 0 ? "#10B981" : "#EF4444",
                    }}
                  >
                    {net >= 0 ? "+" : "-"} ₹
                    {Math.abs(net).toLocaleString("en-IN")}
                  </Text>
                  <ChevronRight size={16} color="#6B7280" />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<ActivityIndicator animating={isLoading} />}
        />
      </View>

      {selectedLedger && (
        <LedgerHistoryModal
          ledger={selectedLedger}
          visible={!!selectedLedger}
          onClose={() => setSelectedLedger(null)}
          isDark={isDark}
        />
      )}
    </ScreenBase>
  );
}

function LedgerHistoryModal({ ledger, visible, onClose, isDark }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["ledger-history", ledger.id, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/ledger-summary?ledger_id=${ledger.id}&page=${page}`,
      );
      return res.json();
    },
  });

  return (
    <Modal visible={visible} animationType="slide">
      <ScreenBase>
        <View style={{ flex: 1, padding: 20 }}>
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
                fontSize: 20,
                fontWeight: "bold",
                color: isDark ? "#fff" : "#000",
              }}
            >
              {ledger.name} History
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: "#EF4444" }}>Close</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                Total Credits
              </Text>
              <Text style={{ color: "#10B981", fontWeight: "bold" }}>
                ₹
                {Number(data?.totals?.total_credits || 0).toLocaleString(
                  "en-IN",
                )}
              </Text>
            </View>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                Total Debits
              </Text>
              <Text style={{ color: "#EF4444", fontWeight: "bold" }}>
                ₹
                {Number(data?.totals?.total_debits || 0).toLocaleString(
                  "en-IN",
                )}
              </Text>
            </View>
          </View>

          <FlatList
            data={data?.history || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    {item.date}
                  </Text>
                  <Text style={{ color: isDark ? "#fff" : "#000" }}>
                    {item.remarks || "No remarks"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {item.type === "credit" ? (
                    <ArrowUpRight size={14} color="#10B981" />
                  ) : (
                    <ArrowDownLeft size={14} color="#EF4444" />
                  )}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: item.type === "credit" ? "#10B981" : "#EF4444",
                      marginLeft: 4,
                    }}
                  >
                    ₹{Number(item.amount).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            )}
            onEndReached={() => {
              if (data?.history?.length === 50) setPage((p) => p + 1);
            }}
          />
        </View>
      </ScreenBase>
    </Modal>
  );
}
