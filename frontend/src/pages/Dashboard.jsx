import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ChevronDown, Clock3, FileText, GraduationCap, KeyRound, LoaderCircle, LogOut, Plus, RotateCw, Sparkles, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import "./Dashboard.css";

const blankResume = {
  name: "", email: "", phone: "", address: "", linkedin: "", github: "", portfolio: "",
  headline: "", summary: "", skills: [], experiences: [], education: [], projects: [], achievements: [], certifications: [],
  meta: { template: "ats" },
};

const dateLabel = (value) => value
  ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
  : "Not saved yet";

const templateLabel = (resume) => ({
  ats: "ATS Professional",
  modern: "Modern Professional",
  developer: "Developer Resume",
}[resume.meta?.template] || "ATS Professional");

const completionFor = (resume) => {
  const checks = [resume.name, resume.email, resume.headline, resume.summary, resume.skills?.length, resume.education?.length, resume.experiences?.length];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [error, setError] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [accountDialog, setAccountDialog] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const profileMenuRef = useRef(null);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  useEffect(() => {
    const closeMenuOnOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false);
    };
    const closeMenuOnEscape = (event) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeMenuOnOutsideClick);
    document.addEventListener("keydown", closeMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  const loadResumes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/resumes");
      setResumes(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  const totals = useMemo(() => resumes.reduce((result, resume) => ({
    projects: result.projects + (resume.projects?.length || 0),
    experience: result.experience + (resume.experiences?.length || 0),
    education: result.education + (resume.education?.length || 0),
  }), { projects: 0, experience: 0, education: 0 }), [resumes]);

  const createResume = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/resumes", { ...blankResume, name: user.name || "", email: user.email || "" });
      navigate(`/resume/${data._id}/edit`);
    } catch {
      setError(true);
      setCreating(false);
    }
  };

  const deleteResume = async () => {
    if (!resumeToDelete) return;
    setDeleting(true);
    setDeleteError(false);
    try {
      await api.delete(`/resumes/${resumeToDelete._id}`);
      setResumes((current) => current.filter((resume) => resume._id !== resumeToDelete._id));
      setResumeToDelete(null);
    } catch {
      setDeleteError(true);
    } finally {
      setDeleting(false);
    }
  };

  const openAccountDialog = (dialog) => {
    setProfileMenuOpen(false);
    setAccountDialog(dialog);
    setPasswordError("");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setAccountDialog("");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully.");
    } catch (err) {
      setPasswordError(err.response?.data?.msg || "Couldn’t change your password. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const firstName = String(user.name || "there").trim().split(/\s+/)[0];

  return (
    <main className="resume-home">
      <header className="home-topbar">
        <Link className="home-brand" to="/dashboard"><span className="home-brand-icon"><FileText size={18} /></span>folio<span>.</span></Link>
        <div className="home-profile" ref={profileMenuRef}>
          <button className="home-user" type="button" aria-haspopup="menu" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>
            <span className="home-user-avatar">{String(user.name || "U").trim().slice(0, 1).toUpperCase()}</span>
            <span>{user.name || "My profile"}</span>
            <ChevronDown size={14} className={profileMenuOpen ? "home-user-chevron is-open" : "home-user-chevron"} />
          </button>
          {profileMenuOpen && <div className="home-profile-menu" role="menu">
            <div className="home-profile-menu-user"><strong>{user.name || "My profile"}</strong>{user.email && <span>{user.email}</span>}</div>
            <button type="button" role="menuitem" onClick={() => openAccountDialog("password")}><KeyRound size={15} />Change password</button>
            <button type="button" role="menuitem" className="home-profile-logout" onClick={() => openAccountDialog("logout")}><LogOut size={15} />Log out</button>
          </div>}
        </div>
      </header>

      <section className="home-content">
        <div className="home-welcome-row">
          <div><span className="home-eyebrow"><Sparkles size={13} /> YOUR PERSONAL WORKSPACE</span><h1>Welcome back, {firstName}</h1><p>Manage your resumes and keep every application ready.</p></div>
          <button className="home-create-btn" type="button" onClick={createResume} disabled={creating}><Plus size={17} />{creating ? "Creating resume…" : "Create new resume"}</button>
        </div>

        <section className="home-stats" aria-label="Resume profile summary">
          <article className="home-stat-card home-stat-primary"><span className="home-stat-icon"><FileText size={17} /></span><span className="home-stat-label">Total resumes</span><strong>{resumes.length}</strong><small>{resumes.length === 1 ? "Saved in your workspace" : "Saved in your workspace"}</small></article>
          <article className="home-stat-card"><span className="home-stat-icon"><BriefcaseBusiness size={17} /></span><span className="home-stat-label">Projects added</span><strong>{totals.projects}</strong><small>Across all resumes</small></article>
          <article className="home-stat-card"><span className="home-stat-icon"><Clock3 size={17} /></span><span className="home-stat-label">Experience entries</span><strong>{totals.experience}</strong><small>Jobs and internships</small></article>
          <article className="home-stat-card"><span className="home-stat-icon"><GraduationCap size={18} /></span><span className="home-stat-label">Education entries</span><strong>{totals.education}</strong><small>Across all resumes</small></article>
        </section>

        <section className="home-resume-section">
          <div className="home-section-heading"><div><span className="home-eyebrow">YOUR LIBRARY</span><h2>My resumes <span>{resumes.length}</span></h2></div><button className="home-refresh-btn" type="button" onClick={loadResumes} disabled={loading}><RotateCw size={14} className={loading ? "refreshing" : ""} />Refresh</button></div>

          {loading ? <div className="home-state"><LoaderCircle size={21} className="refreshing" /><span>Loading your saved resumes…</span></div> : error ? <div className="home-state home-state-error"><p>Couldn’t load your resumes. Check that the backend is running.</p><button type="button" onClick={loadResumes}>Try again</button></div> : resumes.length ? <div className="resume-card-grid">{resumes.map((resume, index) => <article className="saved-resume-card" key={resume._id}>
            <div className="saved-card-top"><span className="saved-card-number">RESUME {String(index + 1).padStart(2, "0")}</span><span className="saved-card-template">{templateLabel(resume)}</span></div>
            <h3>{resume.name?.trim() || "Untitled resume"}</h3><p className="saved-card-headline">{resume.headline || "Add a professional title"}</p>
            {resume.email && <p className="saved-card-email">{resume.email}{resume.address ? ` · ${resume.address}` : ""}</p>}
            {resume.summary && <p className="saved-card-summary">{resume.summary}</p>}
            {!!resume.skills?.filter(Boolean).length && <div className="saved-card-skills">{resume.skills.filter(Boolean).slice(0, 4).map((skill, skillIndex) => <span key={`${skill}-${skillIndex}`}>{skill.split(":")[0].trim()}</span>)}{resume.skills.filter(Boolean).length > 4 && <span>+{resume.skills.filter(Boolean).length - 4}</span>}</div>}
            <div className="saved-card-progress"><div><span>Profile strength</span><b>{completionFor(resume)}%</b></div><i><span style={{ width: `${completionFor(resume)}%` }} /></i></div>
            <div className="saved-card-details"><span>{resume.projects?.length || 0} projects</span><span>{resume.experiences?.length || 0} experience</span><span>{resume.education?.length || 0} education</span></div>
            <div className="saved-card-footer"><span><Clock3 size={12} />Updated {dateLabel(resume.updatedAt || resume.createdAt)}</span><div><button type="button" className="saved-card-delete" onClick={() => { setDeleteError(false); setResumeToDelete(resume); }} aria-label={`Delete ${resume.name || "untitled resume"}`}><Trash2 size={13} /></button><button type="button" className="saved-card-preview" onClick={() => navigate(`/resume/${resume._id}/preview`)}>Preview</button><button type="button" className="saved-card-edit" onClick={() => navigate(`/resume/${resume._id}/edit`)}>Open editor <ArrowRight size={14} /></button></div></div>
          </article>)}</div> : <div className="home-empty"><span><FileText size={25} /></span><h3>Your first resume starts here</h3><p>Create a resume, save it, and it will stay in this workspace while you build more.</p><button type="button" onClick={createResume} disabled={creating}><Plus size={15} />{creating ? "Creating…" : "Create your first resume"}</button></div>}
        </section>
      </section>
      {resumeToDelete && <div className="delete-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setResumeToDelete(null); }}><section className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-resume-title"><button className="delete-dialog-close" type="button" onClick={() => setResumeToDelete(null)} disabled={deleting} aria-label="Close delete confirmation"><X size={17} /></button><span className="delete-dialog-icon"><Trash2 size={19} /></span><h2 id="delete-resume-title">Delete this resume?</h2><p><strong>{resumeToDelete.name?.trim() || "Untitled resume"}</strong> will be permanently removed from your workspace.</p>{deleteError && <p className="delete-dialog-error" role="alert">Couldn’t delete this resume. Please try again.</p>}<div><button type="button" className="delete-cancel-btn" onClick={() => setResumeToDelete(null)} disabled={deleting}>Keep resume</button><button type="button" className="delete-confirm-btn" onClick={deleteResume} disabled={deleting}><Trash2 size={14} />{deleting ? "Deleting…" : "Delete resume"}</button></div></section></div>}
      {accountDialog === "logout" && <div className="delete-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAccountDialog(""); }}><section className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title"><button className="delete-dialog-close" type="button" onClick={() => setAccountDialog("")} aria-label="Close logout confirmation"><X size={17} /></button><span className="delete-dialog-icon"><LogOut size={19} /></span><h2 id="logout-title">Log out?</h2><p>Are you sure you want to log out of your account?</p><div><button type="button" className="delete-cancel-btn" onClick={() => setAccountDialog("")}>Cancel</button><button type="button" className="delete-confirm-btn" onClick={logout}><LogOut size={14} />Log out</button></div></section></div>}
      {accountDialog === "password" && <div className="delete-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !passwordSaving) setAccountDialog(""); }}><section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="change-password-title"><button className="delete-dialog-close" type="button" onClick={() => setAccountDialog("")} disabled={passwordSaving} aria-label="Close change password dialog"><X size={17} /></button><span className="delete-dialog-icon account-dialog-icon"><KeyRound size={19} /></span><h2 id="change-password-title">Change password</h2><p>Enter your current password and choose a new one.</p><form onSubmit={changePassword}>
        <label>Current password<input type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required /></label>
        <label>New password<input type="password" autoComplete="new-password" minLength={8} value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} required /><small>Use at least 8 characters.</small></label>
        <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} required /></label>
        {passwordError && <p className="delete-dialog-error" role="alert">{passwordError}</p>}
        <div><button type="button" className="delete-cancel-btn" onClick={() => setAccountDialog("")} disabled={passwordSaving}>Cancel</button><button type="submit" className="password-save-btn" disabled={passwordSaving}><KeyRound size={14} />{passwordSaving ? "Saving…" : "Update password"}</button></div>
      </form></section></div>}
    </main>
  );
}
