import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useParams } from "react-router-dom";
import { Toaster, toast } from "sonner";

import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas-pro";

export default function ResumePreview() {
  const { id } = useParams();

  const [resume, setResume] = useState(null);

  const resumeRef = useRef();

  useEffect(() => {
    loadResume();
  }, [id]);

  /* ================= LOAD RESUME ================= */

  const loadResume = async () => {
    try {
      const { data } = await api.get(`/resumes/public/${id}`);

      console.log("RESUME =>", data);

      setResume(data);

    } catch (err) {

      console.log(err);

      toast.error("Failed to load resume");
    }
  };

  /* ================= DOWNLOAD PDF ================= */

  const downloadPDF = async () => {
    try {

      toast.loading("Downloading PDF...", {
        id: "pdf",
      });

      const element = resumeRef.current;

      const options = {
        margin: 0,
        filename: `${resume?.name || "resume"}.pdf`,
        image: {
          type: "jpeg",
          quality: 1,
        },
        html2canvas: {
          scale: 3,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf()
        .set(options)
        .from(element)
        .save();

      toast.success("PDF Downloaded", {
        id: "pdf",
      });

    } catch (err) {

      console.log(err);

      toast.error("Download Failed", {
        id: "pdf",
      });
    }
  };

  /* ================= LOADING ================= */

  if (!resume) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "#f3f4f6",
        }}
      >
        <p className="text-lg font-semibold">
          Loading Resume...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        background: "#e5e7eb",
      }}
    >

      <Toaster richColors position="top-right" />

      {/* ================= RESUME ================= */}

      <div
        ref={resumeRef}
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl px-10 py-8"
        style={{
          color: "#111827",
          fontFamily: "Arial, sans-serif",
        }}
      >

        {/* ================= HEADER ================= */}

        <div
          className="border-b pb-4"
          style={{
            borderColor: "#d1d5db",
          }}
        >

          <h1 className="text-[28px] font-bold tracking-wide uppercase text-center">
            {resume.name || "Your Name"}
          </h1>

          <div
            className="mt-2 text-center"
            style={{
              fontSize: "12px",
              lineHeight: "24px",
              color: "#4b5563",
            }}
          >

            {resume.email && (
              <span>{resume.email}</span>
            )}

            {resume.phone && (
              <>
                {" | "}
                <span>{resume.phone}</span>
              </>
            )}

            {resume.linkedin && (
              <>
                {" | "}
                <span>{resume.linkedin}</span>
              </>
            )}

            {resume.github && (
              <>
                {" | "}
                <span>{resume.github}</span>
              </>
            )}

            {resume.portfolio && (
              <>
                {" | "}
                <span>{resume.portfolio}</span>
              </>
            )}

          </div>

        </div>

        {/* ================= SUMMARY ================= */}

        {resume.summary && (
          <Section title="Professional Summary">

            <p
              style={{
                fontSize: "13px",
                lineHeight: "24px",
                color: "#374151",
                whiteSpace: "pre-line",
              }}
            >
              {resume.summary}
            </p>

          </Section>
        )}

        {/* ================= SKILLS ================= */}

                {(resume.skills || []).length > 0 && (
          <Section title="Skills">

            <ul className="list-disc pl-5 space-y-2">

              {resume.skills.map((a, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "13px",
                    lineHeight: "24px",
                    color: "#374151",
                    whiteSpace: "pre-line",
                  }}
                >
                  {a}
                </li>
              ))}

            </ul>

          </Section>
        )}

        {/* ================= EDUCATION ================= */}

        {(resume.education || []).length > 0 && (
          <Section title="Education">

            <div className="space-y-4">

              {resume.education.map((ed, i) => (
                <div key={i}>

                  <div className="flex items-center justify-between">

                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {ed.degree}
                    </h3>

                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {ed.year}
                    </span>

                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      marginTop: "4px",
                    }}
                  >
                    {ed.college || ed.institution}
                  </p>

                </div>
              ))}

            </div>

          </Section>
        )}

        {/* ================= EXPERIENCE ================= */}

        {(resume.experiences || []).length > 0 && (
          <Section title="Experience">

            <div className="space-y-5">

              {resume.experiences.map((exp, i) => (
                <div key={i}>

                  <div className="flex items-center justify-between">

                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {exp.title}
                    </h3>

                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {exp.company}
                    </span>

                  </div>

                  {(exp.desc || exp.description) && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        lineHeight: "24px",
                        color: "#374151",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {exp.desc || exp.description}
                    </p>
                  )}

                </div>
              ))}

            </div>

          </Section>
        )}

        {/* ================= PROJECTS ================= */}

        {(resume.projects || []).length > 0 && (
          <Section title="Projects">

            <div className="space-y-5">

              {resume.projects.map((project, i) => (
                <div key={i}>

                  <div className="flex items-center justify-between">

                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {project.title}
                    </h3>

                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {project.tech}
                    </span>

                  </div>

                  {project.description && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        lineHeight: "24px",
                        color: "#374151",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {project.description}
                    </p>
                  )}

                </div>
              ))}

            </div>

          </Section>
        )}

        {/* ================= ACHIEVEMENTS ================= */}

        {(resume.achievements || []).length > 0 && (
          <Section title="Achievements">

            <ul className="list-disc pl-5 space-y-2">

              {resume.achievements.map((a, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "13px",
                    lineHeight: "24px",
                    color: "#374151",
                    whiteSpace: "pre-line",
                  }}
                >
                  {a}
                </li>
              ))}

            </ul>

          </Section>
        )}

      </div>

      {/* ================= DOWNLOAD ================= */}

      <div className="flex justify-center mt-8">

        <button
          onClick={downloadPDF}
          className="px-6 py-2 rounded-md text-sm font-medium transition"
          style={{
            background: "#000000",
            color: "#ffffff",
          }}
        >
          Download PDF
        </button>

      </div>

    </div>
  );
}

/* ================= SECTION ================= */

function Section({ title, children }) {
  return (
    <div className="mt-6">

      <h2
        className="uppercase tracking-wide pb-1 mb-3"
        style={{
          fontSize: "16px",
          fontWeight: "700",
          borderBottom: "1px solid #d1d5db",
          color: "#111827",
        }}
      >
        {title}
      </h2>

      {children}

    </div>
  );
}

