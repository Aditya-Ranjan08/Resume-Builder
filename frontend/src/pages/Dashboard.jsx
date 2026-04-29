import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Eye,
  Pencil,
  LogOut,
  Sparkles,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import "./Style.css";

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/resumes");
      setResumes(data);
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const createNew = async () => {
    try {
      const { data } = await api.post("/resumes", {
        name: "Your Name",
        headline: "Software Developer",
        summary: "Write something awesome...",
        skills: [],
        experiences: [],
        education: [],
        projects: [],
        certifications: [],
      });

      toast.success("Resume created 🚀");
      navigate(`/resume/${data._id}/edit`);
    } catch {
      toast.error("Failed to create resume");
    }
  };

  //  OPEN MODAL
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  //  CONFIRM DELETE
  const confirmDelete = async () => {
    try {
      await api.delete(`/resumes/${deleteId}`);
      setResumes((prev) => prev.filter((r) => r._id !== deleteId));
      toast.success("Resume deleted 🗑️");
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowDelete(false);
      setDeleteId(null);
    }
  };

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white relative overflow-hidden">

      <Toaster richColors position="top-right" />

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-purple-600 blur-[150px] opacity-30 rounded-full"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-cyan-500 blur-[150px] opacity-30 rounded-full"></div>

      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-5">

          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Sparkles className="text-purple-400" />
              Resume Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              Build your professional resumes
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={createNew}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:scale-105 transition font-semibold flex items-center gap-2"
            >
              <Plus size={18} />
              Create
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-6">

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No resumes found. Create one 
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">

            {resumes.map((r) => (
              <div
                key={r._id}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:scale-[1.02] transition"
              >

                <h2 className="text-xl font-bold mb-2">
                  {r.headline || "Untitled Resume"}
                </h2>

                <p className="text-gray-400 text-sm mb-5">
                  {r.summary || "No summary added yet..."}
                </p>

                <div className="flex gap-2 flex-wrap">

                  <Link
                    to={`/resume/${r._id}/edit`}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 transition flex items-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>

                  <Link
                    to={`/resume/${r._id}/preview`}
                    className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 transition flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Preview
                  </Link>

                  <button
                    onClick={() => openDeleteModal(r._id)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/30 text-red-400 transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* MODERN DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">

          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 w-[90%] max-w-md text-white animate-[fadeIn_0.2s_ease]">

            <h2 className="text-xl font-bold mb-2">Delete Resume?</h2>
            <p className="text-gray-300 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-red-300 transition"
              >
                Delete
              </button>

            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto text-center text-gray-500 py-8 text-sm border-t border-white/10 bg-black/30 backdrop-blur-xl">
        © 2026 Designed By <strong>ADITYA RANJAN</strong> | All Rights Reserved
      </footer>

    </div>
  );
}

