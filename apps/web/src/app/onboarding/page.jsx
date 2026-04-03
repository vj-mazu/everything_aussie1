import { useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading } = useUser();

  useEffect(() => {
    const completeOnboarding = async () => {
      const pendingProfile = localStorage.getItem("pendingProfile");
      if (pendingProfile && user) {
        const profileData = JSON.parse(pendingProfile);
        try {
          const res = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          });
          if (res.ok) {
            localStorage.removeItem("pendingProfile");
            window.location.href = "/";
          }
        } catch (err) {
          console.error("Onboarding failed", err);
        }
      } else if (!loading && user) {
        // If user exists but no pending profile, maybe they are already onboarded
        window.location.href = "/";
      }
    };

    completeOnboarding();
  }, [user, loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
        <h2 className="text-xl font-semibold">Completing Setup...</h2>
        <p className="text-gray-400">Preparing your accounting workspace</p>
      </div>
    </div>
  );
}
