import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "sonner";
import "./Style.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved || (prefersDark ? "dark" : "dark"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handle = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/register", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Account created successfully 🚀");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white relative overflow-hidden">

      {/* TOASTER */}
      <Toaster richColors position="top-right" />

      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-purple-600 blur-[150px] opacity-30 rounded-full"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-cyan-500 blur-[150px] opacity-30 rounded-full"></div>

      {/* CARD */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">

        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Join and start building resumes 
        </p>

        <form onSubmit={handle} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500 outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500 outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-semibold hover:scale-[1.02] transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}