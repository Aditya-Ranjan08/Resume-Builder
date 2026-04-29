import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeEditor from "./pages/ResumeEditor";
import ResumePreview from "./pages/ResumePreview";

function App() {
  const isAuth = !!localStorage.getItem("token");

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
      <Routes>
        <Route
          path="/"
          element={isAuth ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={isAuth ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/resume/:id/edit"
          element={isAuth ? <ResumeEditor /> : <Navigate to="/" />}
        />
        <Route path="/resume/:id/preview" element={<ResumePreview />} />
      </Routes>
    </>
  );
}

export default App;
