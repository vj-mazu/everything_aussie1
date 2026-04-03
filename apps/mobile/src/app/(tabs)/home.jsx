import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  useColorScheme,
  Animated,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import ScreenBase from "@/components/ScreenBase";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const GradientCard = ({
  title,
  amount,
  icon: Icon,
  colors,
  trend,
  isDark,
  delay = 0,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        width: width * 0.43,
        marginBottom: 16,
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          padding: 20,
          minHeight: 140,
          justifyContent: "space-between",
          shadowColor: colors[0],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.25)",
            width: 48,
            height: 48,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon size={24} color="#FFFFFF" />
        </View>

        <View>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 4,
              fontWeight: "500",
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#FFFFFF",
            }}
          >
            ₹
            {Number(amount).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </Text>
          {trend && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              {trend > 0 ? (
                <ArrowUpRight size={14} color="rgba(255,255,255,0.8)" />
              ) : (
                <ArrowDownRight size={14} color="rgba(255,255,255,0.8)" />
              )}
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.8)",
                  marginLeft: 2,
                }}
              >
                {Math.abs(trend)}% from yesterday
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function Dashboard() {
  useRequireAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8FAFC" }}>
      <LinearGradient
        colors={isDark ? ["#1E40AF", "#0A0A0A"] : ["#3B82F6", "#F8FAFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
        style={{ position: "absolute", width: "100%", height: 300 }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#FFFFFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.9)",
              marginBottom: 4,
            }}
          >
            Welcome Back 👋
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#FFFFFF",
            }}
          >
            Dashboard
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <GradientCard
            title="Opening Balance"
            amount={stats?.opening_balance || 0}
            icon={Wallet}
            colors={["#6366F1", "#8B5CF6"]}
            isDark={isDark}
            delay={0}
          />
          <GradientCard
            title="Daily Credits"
            amount={stats?.total_credits || 0}
            icon={TrendingUp}
            colors={["#10B981", "#059669"]}
            trend={12}
            isDark={isDark}
            delay={100}
          />
          <GradientCard
            title="Daily Debits"
            amount={stats?.total_debits || 0}
            icon={TrendingDown}
            colors={["#F59E0B", "#EF4444"]}
            trend={-8}
            isDark={isDark}
            delay={200}
          />
          <GradientCard
            title="Closing Balance"
            amount={stats?.closing_balance || 0}
            icon={Calculator}
            colors={["#14B8A6", "#06B6D4"]}
            isDark={isDark}
            delay={300}
          />
        </View>

        <View
          style={{
            marginTop: 24,
            padding: 24,
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 4,
                height: 24,
                backgroundColor: "#3B82F6",
                borderRadius: 2,
                marginRight: 12,
              }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: isDark ? "#FFFFFF" : "#111827",
              }}
            >
              Mill Accounting Cycle
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9CA3AF" : "#6B7280",
              lineHeight: 22,
            }}
          >
            Yesterday's closing balance of{" "}
            <Text
              style={{
                fontWeight: "600",
                color: isDark ? "#FFFFFF" : "#111827",
              }}
            >
              ₹{Number(stats?.opening_balance || 0).toLocaleString("en-IN")}
            </Text>{" "}
            became today's opening balance at 6:00 AM automatically. The system
            maintains perfect accuracy across all transactions.
          </Text>
        </View>

        <View
          style={{
            marginTop: 20,
            padding: 20,
            backgroundColor: isDark
              ? "rgba(59, 130, 246, 0.1)"
              : "rgba(59, 130, 246, 0.05)",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(59, 130, 246, 0.1)",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: isDark ? "#60A5FA" : "#3B82F6",
              lineHeight: 20,
            }}
          >
            💡 <Text style={{ fontWeight: "600" }}>Quick Tip:</Text> All balance
            calculations are done in real-time. Any edits or deletions in past
            transactions automatically update future balances.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
