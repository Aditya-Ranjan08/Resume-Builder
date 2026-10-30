import { jsPDF } from "jspdf";
import { experiencePeriod, formatGrade, formatSkills, resumeUrlDisplay, safeResumeUrl, uniqueResumeItems, uniqueStrings } from "./resumeFormat";
import { sortNewestFirst } from "./resumeChecks";

const cleanText = (value) => String(value || "").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u00A0/g, " ").trim();

const TEMPLATE_STYLES = {
  ats: { accent: [32, 50, 69], body: [35, 38, 36] },
  modern: { accent: [33, 62, 94], body: [39, 44, 51] },
  developer: { accent: [31, 76, 71], body: [35, 41, 40] },
};

export function downloadResumePdf(resume) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const template = TEMPLATE_STYLES[resume.meta?.template] ? resume.meta.template : "ats";
  const style = TEMPLATE_STYLES[template];
  let y = margin;

  doc.setProperties({ title: `${cleanText(resume.name || "Resume")} - Resume`, subject: "Resume", creator: "Folio Resume Builder" });

  const ensureSpace = (height = 5) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addText = (text, { size = 10.5, font = "normal", color = style.body, indent = 0, lineHeight = 4.8, bullet = false } = {}) => {
    const value = cleanText(text);
    if (!value) return;
    doc.setFont("helvetica", font);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(value, contentWidth - indent - (bullet ? 4 : 0));
    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      if (bullet && index === 0) doc.text("•", margin + indent, y);
      doc.text(line, margin + indent + (bullet ? 4 : 0), y);
      y += lineHeight;
    });
  };

  const addBullets = (value) => {
    for (const line of cleanText(value).split(/\n+/).map((item) => item.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean)) {
      addText(line, { bullet: true, indent: 1, lineHeight: 4.7 });
    }
  };

  const addSection = (title) => {
    ensureSpace(10);
    y += 2.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...style.accent);
    doc.text(cleanText(title).toUpperCase(), margin, y);
    y += 1.6;
    doc.setDrawColor(...style.accent);
    doc.setLineWidth(0.25);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4.5;
  };

  const addEntryTitle = (title) => {
    const lines = doc.splitTextToSize(cleanText(title), contentWidth);
    ensureSpace(Math.max(4.8, lines.length * 4.8));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.8);
    doc.setTextColor(...style.body);
    doc.text(lines, margin, y);
    y += lines.length * 4.8;
  };

  const addContactRow = (items) => {
    const prepared = items.filter((item) => item.value).map((item) => {
      let value = cleanText(item.display || item.value);
      doc.setFont("helvetica", item.url ? "bold" : "normal");
      doc.setFontSize(9.5);
      const prefix = `${item.label}: `;
      while (doc.getTextWidth(prefix + value) > contentWidth && value.length > 10) value = `${value.slice(0, -4)}...`;
      return { ...item, value, prefix, width: doc.getTextWidth(prefix + value) };
    });
    const lines = [];
    let line = [];
    let width = 0;
    for (const item of prepared) {
      const nextWidth = width + (line.length ? doc.getTextWidth("   |   ") : 0) + item.width;
      if (line.length && nextWidth > contentWidth) {
        lines.push(line);
        line = [];
        width = 0;
      }
      width += (line.length ? doc.getTextWidth("   |   ") : 0) + item.width;
      line.push(item);
    }
    if (line.length) lines.push(line);

    for (const row of lines) {
      ensureSpace(4.5);
      const rowWidth = row.reduce((sum, item) => sum + item.width, 0) + Math.max(0, row.length - 1) * doc.getTextWidth("   |   ");
      let x = (pageWidth - rowWidth) / 2;
      for (const [index, item] of row.entries()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(85, 89, 87);
        doc.text(item.prefix, x, y);
        x += doc.getTextWidth(item.prefix);
        doc.setFont("helvetica", item.url ? "bold" : "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...(item.url ? style.accent : style.body));
        if (item.url) {
          doc.textWithLink(item.value, x, y, { url: item.url });
          doc.setDrawColor(...style.accent);
          doc.setLineWidth(0.2);
          doc.line(x, y + 0.6, x + doc.getTextWidth(item.value), y + 0.6);
        } else {
          doc.text(item.value, x, y);
        }
        x += doc.getTextWidth(item.value);
        if (index < row.length - 1) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(150, 154, 151);
          doc.text("   |   ", x, y);
          x += doc.getTextWidth("   |   ");
        }
      }
      y += 4.3;
    }
  };

  const skills = formatSkills(resume.skills || []);
  const projects = sortNewestFirst(uniqueResumeItems(resume.projects || [], ["title", "role", "tech", "description", "githubUrl", "liveUrl", "startDate", "endDate"]));
  const experiences = sortNewestFirst(uniqueResumeItems(resume.experiences || [], ["title", "company", "startDate", "endDate", "desc"]));
  const education = sortNewestFirst(uniqueResumeItems(resume.education || [], ["degree", "college", "year", "grade"]), "year");
  const certifications = uniqueStrings(resume.certifications || []);
  const achievements = uniqueStrings(resume.achievements || []);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(...style.accent);
  const nameLines = doc.splitTextToSize(cleanText(resume.name || "Your Name"), contentWidth);
  doc.text(nameLines, pageWidth / 2, y, { align: "center" });
  y += nameLines.length * 7.2 + 0.5;

  if (resume.headline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11.5);
    doc.setTextColor(...style.body);
    doc.text(doc.splitTextToSize(cleanText(resume.headline), contentWidth), pageWidth / 2, y, { align: "center" });
    y += 5.2;
  }

  addContactRow([
    { label: "Phone", value: resume.phone, url: resume.phone ? `tel:${cleanText(resume.phone).replace(/[^+\d]/g, "")}` : "" },
    { label: "Email", value: resume.email, url: resume.email ? `mailto:${cleanText(resume.email)}` : "" },
    { label: "Location", value: resume.address },
  ]);
  addContactRow([
    { label: "LinkedIn", value: resume.linkedin, display: resumeUrlDisplay(resume.linkedin), url: resume.linkedin ? safeResumeUrl(resume.linkedin) : "" },
    { label: "GitHub", value: resume.github, display: resumeUrlDisplay(resume.github), url: resume.github ? safeResumeUrl(resume.github) : "" },
    { label: "Portfolio", value: resume.portfolio, display: resumeUrlDisplay(resume.portfolio), url: resume.portfolio ? safeResumeUrl(resume.portfolio) : "" },
  ]);
  y += 1.2;

  if (resume.summary?.trim()) {
    addSection("Professional Summary");
    addText(resume.summary, { lineHeight: 4.8 });
  }

  if (skills.length) {
    addSection("Technical Skills");
    skills.forEach(({ label, text }) => addText(`${label ? `${label}: ` : ""}${text}`, { lineHeight: 4.7 }));
  }

  if (projects.some((item) => item.title || item.description || item.githubUrl || item.liveUrl)) {
    addSection("Projects");
    projects.filter((item) => item.title || item.description || item.githubUrl || item.liveUrl).forEach((item) => {
      addEntryTitle(item.title || "Project");
      const details = [item.role, item.tech, experiencePeriod(item)].filter(Boolean).join(" | ");
      if (details) addText(details, { size: 9.8, color: [85, 89, 87], lineHeight: 4.5 });
      if (item.githubUrl || item.liveUrl) {
        ensureSpace(4.8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.8);
        doc.setTextColor(...style.accent);
        let x = margin;
        if (item.githubUrl) {
          doc.textWithLink("GitHub repository", x, y, { url: safeResumeUrl(item.githubUrl) });
          doc.setDrawColor(...style.accent);
          doc.setLineWidth(0.2);
          doc.line(x, y + 0.6, x + doc.getTextWidth("GitHub repository"), y + 0.6);
          x += doc.getTextWidth("GitHub repository") + 5;
        }
        if (item.liveUrl) {
          doc.textWithLink("Live demo", x, y, { url: safeResumeUrl(item.liveUrl) });
          doc.line(x, y + 0.6, x + doc.getTextWidth("Live demo"), y + 0.6);
        }
        y += 4.6;
      }
      if (item.description) addBullets(item.description);
      y += 1.4;
    });
  }

  if (experiences.some((item) => item.title || item.company || item.desc)) {
    addSection("Experience");
    experiences.filter((item) => item.title || item.company || item.desc).forEach((item) => {
      addEntryTitle(item.title || "Position");
      const details = [item.company, experiencePeriod(item)].filter(Boolean).join(" | ");
      if (details) addText(details, { size: 9.8, color: [85, 89, 87], lineHeight: 4.5 });
      if (item.desc) addBullets(item.desc);
      y += 1.4;
    });
  }

  if (education.some((item) => item.degree || item.college || item.year)) {
    addSection("Education");
    education.filter((item) => item.degree || item.college || item.year).forEach((item) => {
      const title = `${cleanText(item.degree || "Qualification")}${item.grade ? ` | ${formatGrade(item.grade, item.gradeType)}` : ""}`;
      addEntryTitle(title);
      const details = [item.college, item.year].filter(Boolean).join(" | ");
      if (details) addText(details, { size: 9.8, color: [85, 89, 87], lineHeight: 4.5 });
      y += 1.4;
    });
  }

  if (certifications.length) {
    addSection("Certifications");
    certifications.forEach(addBullets);
  }

  if (achievements.length) {
    addSection("Achievements");
    achievements.forEach(addBullets);
  }

  if (doc.getNumberOfPages() > 1) {
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(105, 105, 105);
      doc.text(`${page} / ${pageCount}`, pageWidth / 2, pageHeight - 7, { align: "center" });
    }
  }

  const fileName = cleanText(resume.name || "Resume").replace(/[<>:"/\\|?*]+/g, "-");
  doc.save(`${fileName}.pdf`);
}
