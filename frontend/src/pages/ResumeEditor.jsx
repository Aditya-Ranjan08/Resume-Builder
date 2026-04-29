import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [resume, setResume] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    portfolio: "",
    headline: "",
    summary: "",

    skills: [],
    education: [],
    experiences: [],
    projects: [],
    achievements: [],
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await api.get(`/resumes/${id}`);

      setResume({
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        address: data?.address || "",
        linkedin: data?.linkedin || "",
        github: data?.github || "",
        portfolio: data?.portfolio || "",
        headline: data?.headline || "",
        summary: data?.summary || "",

        skills: data?.skills || [],
        education: data?.education || [],
        experiences: data?.experiences || [],
        projects: data?.projects || [],
        achievements: data?.achievements || [],
      });

      toast.success("Resume loaded");
    } catch (err) {
      toast.error("Failed to load resume");
    }
  };

  /* ================= SAVE ================= */

  const save = async () => {
    try {
      setSaving(true);

      await api.put(`/resumes/${id}`, resume);

      toast.success("Resume saved successfully ");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

    } catch (err) {
      toast.error("Save failed ");
    } finally {
      setSaving(false);
    }
  };

  /* ================= HELPERS ================= */

  const addItem = (key, item) => {
    setResume((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), item],
    }));
  };

  const updateItem = (key, index, value) => {
    const arr = [...(resume[key] || [])];
    arr[index] = value;

    setResume({
      ...resume,
      [key]: arr,
    });
  };

  const removeItem = (key, index) => {
    const arr = [...(resume[key] || [])];

    arr.splice(index, 1);

    setResume({
      ...resume,
      [key]: arr,
    });

    toast.info("Removed");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-6">

      <Toaster richColors position="top-right" />

      {/* HEADER */}

      <div className="flex justify-between mb-6">

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          type="button"
          onClick={save}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold"
        >
          <Save size={18} />

          {saving ? "Saving..." : "Save Resume"}
        </button>

      </div>

      {/* PERSONAL DETAILS */}

      <Section title="Personal Details">

        <Grid>
          <Input
            value={resume.name}
            onChange={(v) =>
              setResume({ ...resume, name: v })
            }
            placeholder="Full Name"
          />

          <Input
            value={resume.email}
            onChange={(v) =>
              setResume({ ...resume, email: v })
            }
            placeholder="Email"
          />

          <Input
            value={resume.phone}
            onChange={(v) =>
              setResume({ ...resume, phone: v })
            }
            placeholder="Phone"
          />

          <Input
            value={resume.address}
            onChange={(v) =>
              setResume({ ...resume, address: v })
            }
            placeholder="Address"
          />

          <Input
            value={resume.linkedin}
            onChange={(v) =>
              setResume({ ...resume, linkedin: v })
            }
            placeholder="LinkedIn"
          />

          <Input
            value={resume.github}
            onChange={(v) =>
              setResume({ ...resume, github: v })
            }
            placeholder="GitHub"
          />

          <Input
            value={resume.portfolio}
            onChange={(v) =>
              setResume({ ...resume, portfolio: v })
            }
            placeholder="Portfolio"
          />
        </Grid>

        <textarea
          className="input mt-3 w-full max-w-[570px] h-40 resize-y"
          placeholder="Summary"
          value={resume.summary}
          onChange={(e) =>
            setResume({
              ...resume,
              summary: e.target.value,
            })
          }
        />

      </Section>

      {/* EDUCATION */}

      <Section title="Education">

        {resume.education.map((e, i) => (
          <Card key={i}>

            <Input
              value={e.degree || ""}
              onChange={(v) =>
                updateItem("education", i, {
                  ...e,
                  degree: v,
                })
              }
              placeholder="Degree"
            />

            <Input
              value={e.college || ""}
              onChange={(v) =>
                updateItem("education", i, {
                  ...e,
                  college: v,
                })
              }
              placeholder="College"
            />

            <Input
              value={e.year || ""}
              onChange={(v) =>
                updateItem("education", i, {
                  ...e,
                  year: v,
                })
              }
              placeholder="Year"
            />

            <button
              type="button"
              onClick={() =>
                removeItem("education", i)
              }
            >
              <Trash2 />
            </button>

          </Card>
        ))}

        <AddBtn
          onClick={() =>
            addItem("education", {
              degree: "",
              college: "",
              year: "",
            })
          }
        />

      </Section>

      {/* SKILLS */}

     

 <Section title="Skills">

        {resume.skills.map((a, i) => (
          <Card
            key={i}
            className="flex flex-col gap-3"
          >

            <textarea
              className="input w-full h-28 resize-y"
              value={a || ""}
              onChange={(e) =>
                updateItem(
                  "skills",
                  i,
                  e.target.value
                )
              }
              placeholder="Write skills"
            />

            <button
              type="button"
              onClick={() =>
                removeItem("skills", i)
              }
              className="text-red-400"
            >
              <Trash2 />
            </button>

          </Card>
        ))}

        <AddBtn
          onClick={() =>
            addItem("skills", "")
          }
        />

      </Section>



      {/* EXPERIENCE */}

      <Section title="Experience">

        {resume.experiences.map((e, i) => (
          <Card
            key={i}
            className="flex flex-col gap-3"
          >

            <Input
              value={e.title || ""}
              onChange={(v) =>
                updateItem("experiences", i, {
                  ...e,
                  title: v,
                })
              }
              placeholder="Title"
            />

            <Input
              value={e.company || ""}
              onChange={(v) =>
                updateItem("experiences", i, {
                  ...e,
                  company: v,
                })
              }
              placeholder="Company"
            />

            <textarea
              className="input w-full h-28 resize-y"
              value={e.desc || ""}
              onChange={(v) =>
                updateItem("experiences", i, {
                  ...e,
                  desc: v.target.value,
                })
              }
              placeholder="Description"
            />

            <button
              type="button"
              onClick={() =>
                removeItem("experiences", i)
              }
            >
              <Trash2 />
            </button>

          </Card>
        ))}

        <AddBtn
          onClick={() =>
            addItem("experiences", {
              title: "",
              company: "",
              desc: "",
            })
          }
        />

      </Section>

      {/* PROJECTS */}

      <Section title="Projects">

        {resume.projects.map((p, i) => (
          <Card
            key={i}
            className="flex flex-col gap-3"
          >

            <Input
              value={p.title || ""}
              onChange={(v) =>
                updateItem("projects", i, {
                  ...p,
                  title: v,
                })
              }
              placeholder="Title"
            />

            <Input
              value={p.tech || ""}
              onChange={(v) =>
                updateItem("projects", i, {
                  ...p,
                  tech: v,
                })
              }
              placeholder="Tech Stack"
            />

            <textarea
              className="input w-full h-28 resize-y"
              value={p.description || ""}
              onChange={(v) =>
                updateItem("projects", i, {
                  ...p,
                  description: v.target.value,
                })
              }
              placeholder="Description"
            />

            <button
              type="button"
              onClick={() =>
                removeItem("projects", i)
              }
            >
              <Trash2 />
            </button>

          </Card>
        ))}

        <AddBtn
          onClick={() =>
            addItem("projects", {
              title: "",
              tech: "",
              description: "",
            })
          }
        />

      </Section>

      {/* ACHIEVEMENTS */}

      <Section title="Achievements">

        {resume.achievements.map((a, i) => (
          <Card
            key={i}
            className="flex flex-col gap-3"
          >

            <textarea
              className="input w-full h-28 resize-y"
              value={a || ""}
              onChange={(e) =>
                updateItem(
                  "achievements",
                  i,
                  e.target.value
                )
              }
              placeholder="Write achievement..."
            />

            <button
              type="button"
              onClick={() =>
                removeItem("achievements", i)
              }
              className="text-red-400"
            >
              <Trash2 />
            </button>

          </Card>
        ))}

        <AddBtn
          onClick={() =>
            addItem("achievements", "")
          }
        />

      </Section>

    </div>
  );
}

/* ================= COMPONENTS ================= */

const Section = ({ title, children }) => (
  <div className="mb-6">

    <h2 className="text-lg font-bold mb-3">
      {title}
    </h2>

    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
      {children}
    </div>

  </div>
);

const Card = ({ children }) => (
  <div className="flex flex-col gap-3 mb-3 bg-white/5 p-3 rounded-xl">
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-3">
    {children}
  </div>
);

const Input = ({
  value = "",
  onChange,
  placeholder,
  onKeyDown,
}) => (
  <input
    className="w-full p-2 rounded-lg bg-black/40 border border-white/10"
    value={value}
    placeholder={placeholder}
    onChange={(e) =>
      onChange(e.target.value)
    }
    onKeyDown={onKeyDown}
  />
);

const AddBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-2 flex items-center gap-2 text-purple-400"
  >
    <Plus size={16} />
    Add More
  </button>
);



