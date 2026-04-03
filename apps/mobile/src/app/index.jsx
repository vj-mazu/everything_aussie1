import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";

export default function Index() {
  const { isReady } = useAuth();

  if (!isReady) return null;

  return <Redirect href="/(tabs)/home" />;
}
