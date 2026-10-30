import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowDownToLine, ArrowLeft, Check, CheckCircle2, Eye, FileText, Plus, Save, Search, Sparkles, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import api from "../api";
import ResumePaper from "./ResumePaper";
import { compareJobDescription, inspectResume, sortNewestFirst } from "../utils/resumeChecks";
import "./ResumeEditor.css";

const emptyResume = {
  name: "", email: "", phone: "", address: "", linkedin: "", github: "", portfolio: "",
  headline: "", summary: "", skills: [], education: [], experiences: [], projects: [], achievements: [], certifications: [],
  meta: { template: "ats" },
};

const profileCompletion = (resume) => {
  const checks = [
    Boolean(resume.name), Boolean(resume.email), Boolean(resume.headline), Boolean(resume.summary),
    resume.experiences.some((item) => item.title || item.company || item.desc),
    resume.education.some((item) => item.degree || item.college || item.year),
    resume.skills.some(Boolean),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(emptyResume);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mobilePane, setMobilePane] = useState("edit");
  const [jobDescription, setJobDescription] = useState("");
  const completion = useMemo(() => profileCompletion(resume), [resume]);
  const formatting = useMemo(() => inspectResume(resume), [resume]);
  const keywordReport = useMemo(() => compareJobDescription(resume, jobDescription), [resume, jobDescription]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/resumes/${id}`);
      setResume({ ...emptyResume, ...data, meta: { ...emptyResume.meta, ...(data.meta || {}) },
        skills: Array.isArray(data.skills) ? data.skills : [],
        experiences: Array.isArray(data.experiences) ? data.experiences : [],
        education: Array.isArray(data.education) ? data.education : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      });
    } catch {
      toast.error("Couldn’t load this resume.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateField = (field, value) => setResume((current) => ({ ...current, [field]: value }));
  const addItem = (field, item) => setResume((current) => ({ ...current, [field]: [...current[field], item] }));
  const updateItem = (field, index, key, value) => setResume((current) => ({
    ...current,
    [field]: current[field].map((item, itemIndex) => itemIndex === index
      ? (typeof item === "string" ? value : { ...item, [key]: value })
      : item),
  }));
  const removeItem = (field, index) => setResume((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/resumes/${id}`, resume);
      toast.success("Resume saved.");
      return true;
    } catch {
      toast.error("Couldn’t save your resume. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAndReturn = async () => {
    if (await save()) navigate("/dashboard");
  };

  const openPreview = async () => {
    if (await save()) navigate(`/resume/${id}/preview`);
  };

  const createAnother = async () => {
    setCreating(true);
    try {
      await api.put(`/resumes/${id}`, resume);
      const { data } = await api.post("/resumes", { ...emptyResume, name: "", email: "" });
      navigate(`/resume/${data._id}/edit`);
    } catch {
      toast.error("Couldn’t create a new resume.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="builder-loading"><span className="builder-loading-mark"><FileText size={20} /></span><span className="builder-loading-spinner" /><p>Opening your resume…</p></div>;

  return (
    <main className="builder-page">
      <Toaster richColors position="top-right" />
      <header className="builder-topbar">
        <button className="builder-brand builder-brand-button" type="button" onClick={saveAndReturn} disabled={saving}><span className="builder-brand-mark"><FileText size={17} /></span>folio<span>.</span></button>
        <div className="builder-doc-title"><span className="builder-doc-icon"><FileText size={15} /></span><span>{resume.name || "Untitled resume"}</span><i /> <small>{saving ? "Saving…" : "Draft"}</small></div>
        <div className="builder-top-actions"><button className="builder-new-btn" onClick={createAnother} disabled={creating}><Plus size={15} /><span>{creating ? "Creating…" : "New resume"}</span></button><button className="builder-preview-btn" onClick={openPreview} disabled={saving}><Eye size={16} /><span>Preview & export</span></button><button className="builder-save-btn" onClick={save} disabled={saving}><Save size={15} /><span>{saving ? "Saving…" : "Save changes"}</span></button></div>
      </header>

      <div className="builder-mobile-tabs"><button className={mobilePane === "edit" ? "selected" : ""} onClick={() => setMobilePane("edit")}>Build resume</button><button className={mobilePane === "preview" ? "selected" : ""} onClick={() => setMobilePane("preview")}><Eye size={15} />Live preview</button></div>

      <div className="builder-workspace">
        <section className={`builder-edit-pane ${mobilePane === "edit" ? "mobile-active" : "mobile-hidden"}`}>
          <div className="editor-intro"><span className="builder-eyebrow">RESUME STUDIO <span>·</span> STEP 1 OF 1</span><h1>Build your resume</h1><p>Add your details and watch your resume take shape in real time.</p><div className="completion-row"><span className="completion-label">Profile strength</span><div className="completion-track"><i style={{ width: `${completion}%` }} /></div><strong>{completion}%</strong></div></div>

          <div className="resume-tools-panel">
            <div className="resume-template-control"><div><span className="builder-eyebrow">DOCUMENT STYLE</span><strong>Choose a resume template</strong></div><select aria-label="Resume template" value={resume.meta?.template || "ats"} onChange={(event) => updateField("meta", { ...resume.meta, template: event.target.value })}><option value="ats">ATS Professional</option><option value="modern">Modern Professional</option><option value="developer">Developer Resume</option></select></div>
            <section className="resume-checker"><div className="resume-checker-heading"><div><span className="builder-eyebrow">FORMATTING CHECK</span><strong>{formatting.score}% ready</strong></div><span className="checker-caption">Estimated formatting readiness · no ATS guarantee</span></div>{formatting.warnings.length ? <ul>{formatting.warnings.slice(0, 4).map((warning) => <li key={warning}><AlertCircle size={13} />{warning}</li>)}</ul> : <p className="checker-success"><CheckCircle2 size={14} />No basic formatting issues found.</p>}</section>
            <section className="keyword-checker"><label htmlFor="job-description"><span className="builder-eyebrow"><Search size={12} /> JOB DESCRIPTION CHECK</span><textarea id="job-description" rows={3} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste a job description to compare its keywords with your resume." /></label>{jobDescription.trim() && <div className="keyword-results"><strong>Estimated keyword match: {keywordReport.score}%</strong><p>{keywordReport.matching.length} matching terms · {keywordReport.matchedSkills.length} entered skills found</p>{keywordReport.missing.length > 0 && <p className="keyword-missing"><b>Not found in your resume:</b> {keywordReport.missing.join(", ")}</p>}<small>Review these terms and add only details that accurately describe your skills and experience.</small></div>}</section>
          </div>

          <div className="editor-sections">
            <EditorSection number="01" title="Personal information" hint="How employers can reach you">
              <div className="editor-fields two-col"><Field label="Full name" value={resume.name} onChange={(value) => updateField("name", value)} placeholder="e.g. Aditi Sharma" /><Field label="Professional title" value={resume.headline} onChange={(value) => updateField("headline", value)} placeholder="e.g. Frontend Developer" /><Field label="Email address" type="email" value={resume.email} onChange={(value) => updateField("email", value)} placeholder="you@example.com" /><Field label="Phone" value={resume.phone} onChange={(value) => updateField("phone", value)} placeholder="+91 98765 43210" /><Field label="Location" value={resume.address} onChange={(value) => updateField("address", value)} placeholder="City, Country" /><Field label="LinkedIn" value={resume.linkedin} onChange={(value) => updateField("linkedin", value)} placeholder="linkedin.com/in/you" /><Field label="Portfolio" value={resume.portfolio} onChange={(value) => updateField("portfolio", value)} placeholder="yourportfolio.com" /><Field label="GitHub" value={resume.github} onChange={(value) => updateField("github", value)} placeholder="github.com/you" /></div>
            </EditorSection>

            <EditorSection number="02" title="Professional summary" hint="A short introduction that highlights your strengths">
              <Field label="About you" multiline value={resume.summary} onChange={(value) => updateField("summary", value)} placeholder="Write 2–4 sentences about your experience, strengths, and the value you bring." rows={4} />
            </EditorSection>

            <EditorSection number="03" title="Work experience" hint="Include internships, part-time roles, and jobs">
              {sortNewestFirst(resume.experiences).map((item) => { const index = resume.experiences.indexOf(item); return <EntryCard key={`experience-${index}`} index={index} onRemove={() => removeItem("experiences", index)}><div className="editor-fields two-col"><Field label="Job title" value={item.title || ""} onChange={(value) => updateItem("experiences", index, "title", value)} placeholder="e.g. Software Engineering Intern" /><Field label="Company" value={item.company || ""} onChange={(value) => updateItem("experiences", index, "company", value)} placeholder="Company name" /><Field label="Start month" type="month" value={item.startDate || ""} onChange={(value) => updateItem("experiences", index, "startDate", value)} /><Field label="End month" type="month" value={item.endDate || ""} onChange={(value) => updateItem("experiences", index, "endDate", value)} disabled={item.isCurrent} /></div><label className="current-role"><input type="checkbox" checked={Boolean(item.isCurrent)} onChange={(event) => { updateItem("experiences", index, "isCurrent", event.target.checked); if (event.target.checked) updateItem("experiences", index, "endDate", ""); }} /><span>I currently work here</span></label><Field label="Key contributions" multiline rows={3} value={item.desc || ""} onChange={(value) => updateItem("experiences", index, "desc", value)} placeholder="Describe what you achieved. Add outcomes or numbers where possible." /></EntryCard>; })}
              <AddEntry onClick={() => addItem("experiences", { title: "", company: "", desc: "", startDate: "", endDate: "", isCurrent: false })}>Add experience</AddEntry>
            </EditorSection>

            <EditorSection number="04" title="Education" hint="Add your degrees, courses, or certifications">
              {sortNewestFirst(resume.education, "year").map((item) => { const index = resume.education.indexOf(item); return <EntryCard key={`education-${index}`} index={index} onRemove={() => removeItem("education", index)}><div className="editor-fields two-col"><Field label="Degree or qualification" value={item.degree || ""} onChange={(value) => updateItem("education", index, "degree", value)} placeholder="e.g. B.Tech, Computer Science" /><Field label="School or institution" value={item.college || ""} onChange={(value) => updateItem("education", index, "college", value)} placeholder="University name" /><Field label="Year" value={item.year || ""} onChange={(value) => updateItem("education", index, "year", value)} placeholder="2022 – 2026" /><SelectField label="Grade format" value={item.gradeType || "CGPA"} onChange={(value) => updateItem("education", index, "gradeType", value)} options={["CGPA", "Percentage"]} /><Field label={item.gradeType === "Percentage" ? "Percentage" : "CGPA (out of 10)"} type="number" min="0" max={item.gradeType === "Percentage" ? "100" : "10"} step="0.01" value={item.grade || ""} onChange={(value) => updateItem("education", index, "grade", value)} placeholder={item.gradeType === "Percentage" ? "e.g. 74" : "e.g. 8.1"} /></div></EntryCard>; })}
              <AddEntry onClick={() => addItem("education", { degree: "", college: "", year: "", gradeType: "CGPA", grade: "" })}>Add education</AddEntry>
            </EditorSection>

            <EditorSection number="05" title="Skills" hint="Group skills with a label and colon, e.g. Languages: JavaScript, SQL">
              <div className="skill-list">{resume.skills.map((skill, index) => <div className="skill-row" key={`skill-${index}`}><input aria-label={`Skill group ${index + 1}`} value={skill || ""} onChange={(event) => updateItem("skills", index, null, event.target.value)} placeholder="e.g. Frontend: React, HTML, CSS" /><button onClick={() => removeItem("skills", index)} aria-label="Remove skill"><Trash2 size={15} /></button></div>)}</div>
              <AddEntry onClick={() => addItem("skills", "")}>Add skill</AddEntry>
            </EditorSection>

            <EditorSection number="06" title="Projects" hint="Show work that demonstrates what you can do">
              {resume.projects.map((item, index) => <EntryCard key={`project-${index}`} index={index} onRemove={() => removeItem("projects", index)}><div className="editor-fields two-col"><Field label="Project name" value={item.title || ""} onChange={(value) => updateItem("projects", index, "title", value)} placeholder="Project title" /><Field label="Role (optional)" value={item.role || ""} onChange={(value) => updateItem("projects", index, "role", value)} placeholder="e.g. Full-stack developer" /><Field label="Tools or technologies" value={item.tech || ""} onChange={(value) => updateItem("projects", index, "tech", value)} placeholder="e.g. React, Node.js" /><Field label="Start month" type="month" value={item.startDate || ""} onChange={(value) => updateItem("projects", index, "startDate", value)} /><Field label="End month" type="month" value={item.endDate || ""} onChange={(value) => updateItem("projects", index, "endDate", value)} /></div><Field label="What did you build?" multiline rows={3} value={item.description || ""} onChange={(value) => updateItem("projects", index, "description", value)} placeholder="Briefly describe the project and your contribution." /><div className="editor-fields two-col"><Field label="GitHub repository" type="url" value={item.githubUrl || ""} onChange={(value) => updateItem("projects", index, "githubUrl", value)} placeholder="https://github.com/you/project" /><Field label="Live project link" type="url" value={item.liveUrl || ""} onChange={(value) => updateItem("projects", index, "liveUrl", value)} placeholder="https://your-project.com" /></div></EntryCard>)}
              <AddEntry onClick={() => addItem("projects", { title: "", tech: "", description: "", githubUrl: "", liveUrl: "" })}>Add project</AddEntry>
            </EditorSection>

            <EditorSection number="07" title="Achievements" hint="Awards, certifications, and milestones">
              {resume.achievements.map((item, index) => <div className="skill-row achievement-row" key={`achievement-${index}`}><input aria-label={`Achievement ${index + 1}`} value={item || ""} onChange={(event) => updateItem("achievements", index, null, event.target.value)} placeholder="e.g. AWS Certified Solutions Architect" /><button onClick={() => removeItem("achievements", index)} aria-label="Remove achievement"><Trash2 size={15} /></button></div>)}
              <AddEntry onClick={() => addItem("achievements", "")}>Add achievement</AddEntry>
            </EditorSection>

            <EditorSection number="08" title="Certifications" hint="List professional courses, certificates, and workshops">
              {resume.certifications.map((item, index) => <div className="skill-row achievement-row" key={`certification-${index}`}><input aria-label={`Certification ${index + 1}`} value={item || ""} onChange={(event) => updateItem("certifications", index, null, event.target.value)} placeholder="e.g. AWS Cloud Practitioner — Amazon" /><button onClick={() => removeItem("certifications", index)} aria-label="Remove certification"><Trash2 size={15} /></button></div>)}
              <AddEntry onClick={() => addItem("certifications", "")}>Add certification</AddEntry>
            </EditorSection>
          </div>
          <div className="editor-bottom-save"><span><Check size={14} />Your edits appear in the preview instantly</span><div><button className="editor-save-only" onClick={save} disabled={saving}><Save size={15} />{saving ? "Saving…" : "Save changes"}</button><button onClick={saveAndReturn} disabled={saving}><ArrowLeft size={15} />{saving ? "Saving…" : "Save & return to resumes"}</button></div></div>
        </section>

        <aside className={`builder-preview-pane ${mobilePane === "preview" ? "mobile-active" : "mobile-hidden"}`}>
          <div className="preview-pane-header"><div><span className="builder-eyebrow">LIVE PREVIEW</span><strong>Your resume</strong></div><div className="preview-live-indicator"><i />Live</div></div>
          <div className="resume-paper-wrap"><ResumePaper resume={resume} /></div>
          <div className="preview-pane-footer"><span><Sparkles size={14} />Clean, recruiter-friendly layout</span><Link to={`/resume/${id}/preview`}><ArrowDownToLine size={14} />Full preview & PDF</Link></div>
        </aside>
      </div>
    </main>
  );
}

function EditorSection({ number, title, hint, children }) {
  return <section className="editor-section"><div className="editor-section-heading"><span>{number}</span><div><h2>{title}</h2><p>{hint}</p></div></div><div className="editor-section-body">{children}</div></section>;
}

function Field({ label, value, onChange, placeholder, type = "text", multiline = false, rows = 3, disabled = false, min, max, step }) {
  const Control = multiline ? "textarea" : "input";
  return <label className="editor-field"><span>{label}</span><Control type={multiline ? undefined : type} rows={multiline ? rows : undefined} min={min} max={max} step={step} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} /></label>;
}

function SelectField({ label, value, onChange, options }) {
  return <label className="editor-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function EntryCard({ index, onRemove, children }) {
  return <div className="editor-entry-card"><div className="entry-card-heading"><span>Entry {index + 1}</span><button onClick={onRemove} aria-label="Remove entry"><Trash2 size={14} />Remove</button></div>{children}</div>;
}

function AddEntry({ onClick, children }) {
  return <button className="add-entry-btn" type="button" onClick={onClick}><Plus size={15} />{children}</button>;
}
