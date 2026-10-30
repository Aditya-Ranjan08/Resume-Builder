import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Download, FileText, LoaderCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import api from "../api";
import ResumePaper from "./ResumePaper";
import "./ResumePreview.css";

export default function ResumePreview() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadResume = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get(`/resumes/${id}`);
      setResume(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadResume(); }, [loadResume]);

  const downloadPDF = async () => {
    try {
      const { downloadResumePdf } = await import("../utils/resumePdf");
      downloadResumePdf(resume);
      toast.success("Your resume PDF is downloading.");
    } catch {
      toast.error("Couldn’t download the PDF. Please try again.");
    }
  };

  if (loading) return <main className="full-preview-loading"><LoaderCircle size={22} /><span>Preparing your resume…</span></main>;
  if (error || !resume) return <main className="full-preview-loading"><FileText size={24} /><h1>Couldn’t open this resume</h1><Link to="/dashboard">Back to resume studio</Link></main>;

  return (
    <main className="full-preview-page">
      <Toaster richColors position="top-right" />
      <header className="full-preview-toolbar">
        <Link to={`/resume/${id}/edit`} className="preview-back"><ArrowLeft size={16} /><span>Back to editor</span></Link>
        <div className="preview-toolbar-title"><span className="preview-toolbar-mark"><FileText size={15} /></span><span>Resume preview</span></div>
        <button className="download-pdf-btn" onClick={downloadPDF}><Download size={16} /><span>Download PDF</span></button>
      </header>
      <section className="full-preview-canvas" aria-label="Resume document preview">
        <div className="full-preview-paper"><ResumePaper resume={{ skills: [], experiences: [], education: [], projects: [], achievements: [], certifications: [], ...resume }} /></div>
      </section>
    </main>
  );
}
