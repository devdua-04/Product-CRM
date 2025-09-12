"use client";

import { useState } from "react";
import { useAuth } from "@/Contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const error = await login({ email, password });

    setLoading(false);
    setError(error || "");
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#d9e4f5] to-[#eae6f7] relative overflow-hidden">
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-10 left-5 w-32 h-32 bg-purple-300 opacity-30 rounded-full blur-3xl animate-bounce"></div>
      <div className="absolute bottom-16 right-8 w-24 h-24 bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative w-full max-w-md bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        
        {/* Decorative Shapes inside Card */}
        <div className="absolute -top-6 left-10 w-14 h-14 bg-purple-500/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-4 right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6 tracking-wide">
          Welcome Back 👋
        </h2>

        {error && (
          <p className="text-red-600 text-center bg-red-100 p-3 rounded-lg shadow-sm mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
