import { FileText } from "lucide-react";
import { cleanProjectText, experiencePeriod, formatGrade, formatSkills, resumeUrlDisplay, safeResumeUrl, uniqueResumeItems, uniqueStrings } from "../utils/resumeFormat";
import { sortNewestFirst } from "../utils/resumeChecks";
import "./ResumePaper.css";

export default function ResumePaper({ resume, template = resume.meta?.template || "ats" }) {
  const contact = [
    { label: "Phone", value: resume.phone },
    { label: "Email", value: resume.email },
    { label: "Location", value: resume.address },
    { label: "LinkedIn", value: resume.linkedin, href: safeResumeUrl(resume.linkedin), display: resumeUrlDisplay(resume.linkedin) },
    { label: "GitHub", value: resume.github, href: safeResumeUrl(resume.github), display: resumeUrlDisplay(resume.github) },
    { label: "Portfolio", value: resume.portfolio, href: safeResumeUrl(resume.portfolio), display: resumeUrlDisplay(resume.portfolio) },
  ].filter((item) => item.value);
  const experiences = sortNewestFirst(uniqueResumeItems(resume.experiences || [], ["title", "company", "startDate", "endDate", "desc"]))
    .filter((item) => item.title || item.company || item.desc);
  const education = sortNewestFirst(uniqueResumeItems(resume.education || [], ["degree", "college", "year", "grade"]), "year")
    .filter((item) => item.degree || item.college || item.year);
  const skills = formatSkills(resume.skills || []);
  const projects = sortNewestFirst(uniqueResumeItems(resume.projects || [], ["title", "role", "tech", "description", "githubUrl", "liveUrl", "startDate", "endDate"]))
    .map((item) => ({ ...item, tech: cleanProjectText(item.tech), description: cleanProjectText(item.description) }))
    .filter((item) => item.title || item.tech || item.description || item.githubUrl || item.liveUrl);
  const achievements = uniqueStrings(resume.achievements || []);
  const certifications = uniqueStrings(resume.certifications || []);
  const hasContent = resume.name || resume.headline || resume.summary || contact.length || experiences.length || education.length || skills.length || projects.length || achievements.length || certifications.length;

  return <article className={`resume-paper resume-template-${template}`}>
    {hasContent ? <>
      <header className="paper-header"><h1>{resume.name || "Your Name"}</h1><p className="paper-headline">{resume.headline || "Professional title"}</p>{contact.length > 0 && <div className="paper-contact">{contact.map((item) => <span key={item.label}><strong>{item.label}:</strong> {item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.display}</a> : item.value}</span>)}</div>}</header>
      {resume.summary && <PaperSection title="Professional Summary"><p>{resume.summary}</p></PaperSection>}
      {skills.length > 0 && <PaperSection title="Technical Skills"><ul className="paper-bullet-list paper-skills-list">{skills.map((skill, index) => <li key={`skill-${index}`}>{skill.label && <strong>{skill.label}: </strong>}{skill.text}</li>)}</ul></PaperSection>}
      {projects.length > 0 && <PaperSection title="Projects">{projects.map((item, index) => <div className="paper-entry paper-project-entry" key={`project-${index}`}><div className="paper-project-heading"><strong>{item.title || "Project"}</strong><span>{[item.role, item.tech, experiencePeriod(item)].filter(Boolean).join(" · ")}</span></div>{(item.githubUrl || item.liveUrl) && <div className="paper-project-links">{item.githubUrl && <a href={safeResumeUrl(item.githubUrl)} target="_blank" rel="noreferrer">GitHub</a>}{item.liveUrl && <a href={safeResumeUrl(item.liveUrl)} target="_blank" rel="noreferrer">Live Demo</a>}</div>}{item.description && <BulletText value={item.description} />}</div>)}</PaperSection>}
      {experiences.length > 0 && <PaperSection title="Experience">{experiences.map((item, index) => <div className="paper-entry" key={`exp-${index}`}><div><strong>{item.title || "Position"}</strong><span>{[item.company, experiencePeriod(item)].filter(Boolean).join(" · ")}</span></div>{item.desc && <BulletText value={item.desc} />}</div>)}</PaperSection>}
      {education.length > 0 && <PaperSection title="Education">{education.map((item, index) => <div className="paper-entry" key={`edu-${index}`}><div><strong>{item.degree || "Qualification"}{item.grade && <span className="paper-grade">{formatGrade(item.grade, item.gradeType)}</span>}</strong>{item.year && <span>{item.year}</span>}</div>{item.college && <p>{item.college}</p>}</div>)}</PaperSection>}
      {certifications.length > 0 && <PaperSection title="Certifications"><ul className="paper-bullet-list">{certifications.map((item, index) => <li key={`certification-${index}`}>{item}</li>)}</ul></PaperSection>}
      {achievements.length > 0 && <PaperSection title="Achievements"><ul className="paper-bullet-list">{achievements.map((item, index) => <li key={`achievement-${index}`}>{item}</li>)}</ul></PaperSection>}
    </> : <div className="paper-empty"><span><FileText size={27} /></span><strong>Your resume will appear here</strong><p>Start with your name and professional title. Your live preview updates as you build.</p></div>}
  </article>;
}

function BulletText({ value }) {
  const bullets = String(value).split(/\n+/).map((line) => line.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);
  return <ul className="paper-bullet-list">{bullets.map((bullet, index) => <li key={`bullet-${index}`}>{bullet}</li>)}</ul>;
}

function PaperSection({ title, children }) {
  return <section className="paper-section"><h2>{title}</h2>{children}</section>;
}
