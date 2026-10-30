import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.msg || "Unable to sign in. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email address</span>
          <span className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></span>
        </label>
        <label className="auth-field">
          <span>Password</span>
          <span className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? <><span className="auth-spinner" />Signing in…</> : <>Sign in <MoveRight size={17} /></>}</button>
      </form>
      <div className="auth-divider"><span>YOUR CAREER, WITH A CLEARER STORY</span></div>
      <div className="auth-note"><span className="auth-note-icon"><LockKeyhole size={16} /></span><span><strong>Your information stays yours.</strong><small>Your account and resume data are kept private and secure.</small></span></div>
    </AuthLayout>
  );
}
