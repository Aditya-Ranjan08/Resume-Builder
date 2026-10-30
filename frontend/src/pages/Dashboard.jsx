import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, LoaderCircle, RotateCw } from "lucide-react";
import api from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const openResumeStudio = useCallback(async () => {
    setError(false);
    try {
      const { data } = await api.get("/resumes");
      const resumes = Array.isArray(data) ? data : [];
      if (resumes.length) {
        navigate(`/resume/${resumes[0]._id}/edit`, { replace: true });
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const { data: resume } = await api.post("/resumes", {
        name: storedUser.name || "",
        email: storedUser.email || "",
        headline: "",
        summary: "",
        skills: [], experiences: [], education: [], projects: [], achievements: [], certifications: [],
      });
      navigate(`/resume/${resume._id}/edit`, { replace: true });
    } catch {
      setError(true);
    }
  }, [navigate]);

  useEffect(() => { openResumeStudio(); }, [openResumeStudio, retryKey]);

  return (
    <main className="studio-loading-page">
      <div className="studio-loading-card">
        <span className="studio-loading-logo"><FileText size={21} /></span>
        {error ? <><h1>Couldn’t open your resume studio</h1><p>Check that the backend is running, then try again.</p><button onClick={() => setRetryKey((key) => key + 1)}><RotateCw size={15} />Try again</button></> : <><LoaderCircle className="studio-loader" size={21} /><h1>Opening your resume studio</h1><p>Getting your workspace ready…</p></>}
      </div>
    </main>
  );
}
