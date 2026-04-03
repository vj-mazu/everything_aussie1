import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      setError("Incorrect email or password. Try again.");
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
          Mill Accounting
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <div className="overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#121212] px-4 py-3 focus-within:border-emerald-500">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-lg outline-none text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <div className="overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#121212] px-4 py-3 focus-within:border-emerald-500">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-lg outline-none text-white"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400 border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="text-emerald-500 hover:text-emerald-400"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
