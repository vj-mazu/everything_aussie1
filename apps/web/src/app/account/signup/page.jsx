import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");
  const [millName, setMillName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name || (role === "admin" && !millName)) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      // Store pending profile data
      localStorage.setItem(
        "pendingProfile",
        JSON.stringify({ name, role, millName }),
      );

      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      setError("Sign-up failed. Email may already be registered.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#121212] p-4 font-['Plus_Jakarta_Sans']">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-[#1E1E1E] p-8 shadow-xl border border-[#2A2A2A]"
      >
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Create Account
        </h1>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">
              Full Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-white outline-none focus:border-emerald-500"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-white outline-none focus:border-emerald-500"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin (Create New Mill)</option>
            </select>
          </div>

          {role === "admin" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400">
                Mill Name
              </label>
              <input
                required
                value={millName}
                onChange={(e) => setMillName(e.target.value)}
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-white outline-none focus:border-emerald-500"
                placeholder="Enter Mill Name"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-white outline-none focus:border-emerald-500"
              placeholder="Email address"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-white outline-none focus:border-emerald-500"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400 border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-emerald-500 hover:text-emerald-400"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
