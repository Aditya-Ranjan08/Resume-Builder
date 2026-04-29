
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Style.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved || (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handle = async (e) => {
    e.preventDefault();
    setError("");

    const loadingToast = toast.loading("Logging in...");

    try {
      const { data } = await api.post("/auth/login", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful ", { id: loadingToast });

      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data?.msg || "Login failed. Please try again.";

      toast.error(msg, { id: loadingToast });
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 relative overflow-hidden">

      {/* glowing background */}
      <div className="absolute w-72 h-72 bg-indigo-600 blur-3xl opacity-30 rounded-full top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-purple-600 blur-3xl opacity-20 rounded-full bottom-10 right-10"></div>

      {/* CARD */}
      <div className="w-full max-w-md relative">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8">

          {/* HEADER */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-300 mt-1">
              Login to continue your journey
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-4" onSubmit={handle}>

            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-400/20 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition"
            >
              Login
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-6 text-sm text-gray-300">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 font-medium hover:underline"
            >
              Register
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="text-center mt-6 text-gray-400 text-xs">
          © 2026 Designed By <strong>ADITYA RANJAN</strong> | All Rights Reserved
        </footer>
      </div>
    </div>
  );
}