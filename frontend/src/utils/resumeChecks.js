import { formatSkills, uniqueResumeItems } from "./resumeFormat";

const STOP_WORDS = new Set("about above after again all also and any are as at be because been before being between both but by can could did do does for from further had has have having he her here hers herself him himself his how if in into is it its itself just more most my no nor not of on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why with would you your".split(" "));

function words(value = "") {
  return new Set(String(value).toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []);
}

function validUrl(value) {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).protocol);
  } catch {
    return false;
  }
}

export function inspectResume(resume = {}) {
  const warnings = [];
  if (!resume.name?.trim()) warnings.push("Add your full name at the top of the resume.");
  if (!resume.email?.trim()) warnings.push("Add a professional email address.");
  if (!resume.phone?.trim()) warnings.push("Add a phone number with country code.");
  if (!resume.education?.some((item) => item.degree || item.college)) warnings.push("Add your education details.");
  const missingExperienceDates = (resume.experiences || []).some((item) => (item.title || item.company) && (!item.startDate || (!item.endDate && !item.isCurrent)));
  const missingEducationDates = (resume.education || []).some((item) => (item.degree || item.college) && !item.year);
  if (missingExperienceDates || missingEducationDates) warnings.push("Add relevant start/end dates to experience and year dates to education.");
  const describedProjects = (resume.projects || []).filter((item) => item.description?.trim());
  const repeatedProjects = uniqueResumeItems(describedProjects, ["description"]).length < describedProjects.length;
  if (repeatedProjects) warnings.push("Some projects have the same description. Give each project its own details.");
  const links = [resume.linkedin, resume.github, resume.portfolio, ...(resume.projects || []).flatMap((item) => [item.githubUrl, item.liveUrl])].filter(Boolean);
  if (links.some((link) => !validUrl(link))) warnings.push("Check the format of your LinkedIn, portfolio, GitHub, or project links.");
  if (!resume.summary?.trim()) warnings.push("Add a short professional summary tailored to the role.");
  if (!(resume.skills || []).some(Boolean)) warnings.push("Add relevant skills that you can support with your experience.");

  return { warnings, score: Math.max(0, Math.round(((9 - warnings.length) / 9) * 100)) };
}

export function compareJobDescription(resume = {}, description = "") {
  const source = [resume.headline, resume.summary, ...(resume.skills || []), ...(resume.experiences || []).flatMap((item) => [item.title, item.company, item.desc]), ...(resume.projects || []).flatMap((item) => [item.title, item.role, item.tech, item.description]), ...(resume.education || []).flatMap((item) => [item.degree, item.college]), ...(resume.certifications || []), ...(resume.achievements || [])].filter(Boolean).join(" ");
  const resumeWords = words(source);
  const jobWords = [...words(description)].filter((word) => !STOP_WORDS.has(word));
  const matching = jobWords.filter((word) => resumeWords.has(word));
  const missing = jobWords.filter((word) => !resumeWords.has(word));
  const skills = words(formatSkills(resume.skills || []).map((item) => `${item.label} ${item.text}`).join(" "));
  return {
    matching: [...new Set(matching)],
    missing: [...new Set(missing)].slice(0, 15),
    matchedSkills: [...skills].filter((word) => jobWords.includes(word)),
    score: jobWords.length ? Math.round((new Set(matching).size / new Set(jobWords).size) * 100) : 0,
  };
}

export function sortNewestFirst(items = [], field = "startDate") {
  return [...items].sort((a, b) => String(b?.[field] || "").localeCompare(String(a?.[field] || ""), undefined, { numeric: true }));
}
