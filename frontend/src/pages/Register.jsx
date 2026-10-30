import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, MoveRight, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Your account is ready!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout mode="register">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Full name</span>
          <span className="auth-input-wrap"><UserRound size={17} /><input type="text" autoComplete="name" placeholder="e.g. Alex Morgan" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></span>
        </label>
        <label className="auth-field">
          <span>Email address</span>
          <span className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></span>
        </label>
        <label className="auth-field">
          <span>Password</span>
          <span className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="Create a password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
          <small className="auth-hint">Use a password you don’t use elsewhere.</small>
        </label>
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? <><span className="auth-spinner" />Creating account…</> : <>Create account <MoveRight size={17} /></>}</button>
      </form>
      <div className="auth-divider"><span>A BETTER RESUME STARTS WITH YOU</span></div>
      <div className="auth-note"><span className="auth-note-icon"><UserRound size={16} /></span><span><strong>Set up once, build with confidence.</strong><small>Your details stay editable as your career grows.</small></span></div>
    </AuthLayout>
  );
}
