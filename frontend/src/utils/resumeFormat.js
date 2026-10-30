const normalize = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

export function uniqueResumeItems(items = [], fields = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = fields.map((field) => normalize(item?.[field])).join("|");
    const dedupeKey = key.replaceAll("|", "") ? key : JSON.stringify(item);
    if (seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    return true;
  });
}

export function formatSkills(values = []) {
  const grouped = [];
  const ungrouped = [];
  const seen = new Set();

  for (const raw of values) {
    for (const line of String(raw || "").split(/\n+/).map((part) => part.trim()).filter(Boolean)) {
      const separator = line.indexOf(":");
      if (separator > 0) {
        const label = line.slice(0, separator).trim();
        const text = line.slice(separator + 1).trim();
        const key = normalize(`${label}:${text}`);
        if (text && !seen.has(key)) {
          grouped.push({ label, text });
          seen.add(key);
        }
      } else {
        for (const skill of line.split(/[,;]/).map((part) => part.trim()).filter(Boolean)) {
          const key = normalize(skill);
          if (key && !seen.has(key)) {
            ungrouped.push(skill);
            seen.add(key);
          }
        }
      }
    }
  }

  const compact = [];
  for (let index = 0; index < ungrouped.length; index += 4) {
    compact.push({ label: "", text: ungrouped.slice(index, index + 4).join(", ") });
  }
  return [...grouped, ...compact];
}

export function cleanResumeList(values = [], skillLines = []) {
  const skillSet = new Set(skillLines.flatMap(({ text }) => text.split(/[,;]/).map(normalize)));
  const seen = new Set();
  return values.filter((raw) => {
    const value = String(raw || "").trim();
    const key = normalize(value);
    if (!key || seen.has(key) || /^https?:\/\//i.test(value)) return false;
    seen.add(key);

    const parts = value.split(/[,;|]/).map((part) => normalize(part)).filter(Boolean);
    if (parts.length >= 6) {
      const matches = parts.filter((part) => skillSet.has(part)).length;
      if (matches / parts.length >= 0.75) return false;
    }
    return true;
  });
}

export function cleanProjectText(value) {
  return String(value || "").trim();
}

export function uniqueStrings(values = []) {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatGrade(value, gradeType = "CGPA") {
  const grade = String(value).trim();
  if (gradeType === "Percentage") return `${grade.replace(/\s*%$/, "")}%`;
  return `${grade.replace(/\s*\/\s*10$/, "")}/10 CGPA`;
}

export function formatMonth(value) {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
}

export function experiencePeriod(item) {
  if (!item.startDate && !item.endDate && !item.isCurrent) return "";
  const start = formatMonth(item.startDate);
  const end = item.isCurrent ? "Present" : formatMonth(item.endDate);
  let duration = "";
  if (item.startDate) {
    const [startYear, startMonth] = item.startDate.split("-").map(Number);
    const endValue = item.isCurrent ? new Date() : item.endDate ? new Date(`${item.endDate}-01T00:00:00`) : null;
    if (endValue && !Number.isNaN(endValue.getTime())) {
      const months = Math.max(1, (endValue.getFullYear() - startYear) * 12 + endValue.getMonth() - (startMonth - 1) + 1);
      const years = Math.floor(months / 12);
      const remainder = months % 12;
      duration = `${years ? `${years} yr${years > 1 ? "s" : ""}${remainder ? " " : ""}` : ""}${remainder ? `${remainder} mo${remainder > 1 ? "s" : ""}` : ""}`;
    }
  }
  return `${[start, end].filter(Boolean).join(" - ")}${duration ? ` (${duration})` : ""}`;
}

export function safeResumeUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function resumeUrlDisplay(value) {
  try {
    const parsed = new URL(safeResumeUrl(value));
    return `${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}${parsed.search}`;
  } catch {
    return String(value || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
}

export function resumeLinkLabel(value) {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
