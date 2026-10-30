import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AUTH_STATE_EVENT } from "./authState";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ResumeEditor = lazy(() => import("./pages/ResumeEditor"));
const ResumePreview = lazy(() => import("./pages/ResumePreview"));

function App() {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const syncAuthState = () => setIsAuth(!!localStorage.getItem("token"));
    window.addEventListener(AUTH_STATE_EVENT, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(AUTH_STATE_EVENT, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return (
    <>
      {/*  TOASTER (GLOBAL) */}
<Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    duration: 3000,
    style: {
      background: "#0b0f0c",
      color: "#fff",
      border: "1px solid #14532d",
    },
    success: {
      style: {
        background: "#052e16",
        border: "1px solid #22c55e",
        color: "#22c55e",
      },
    },
    error: {
      style: {
        background: "#1f0a0a",
        border: "1px solid #ef4444",
        color: "#ef4444",
      },
    },
  }}
/>

      {/* ROUTES */}
      <Suspense fallback={<div className="route-loading" role="status">Loading Folio…</div>}>
        <Routes>
          <Route
            path="/"
            element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route path="/register" element={isAuth ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route
            path="/dashboard"
            element={isAuth ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/resume/:id/edit"
            element={isAuth ? <ResumeEditor /> : <Navigate to="/" replace />}
          />
          <Route
            path="/resume/:id/preview"
            element={isAuth ? <ResumePreview /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to={isAuth ? "/dashboard" : "/"} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
