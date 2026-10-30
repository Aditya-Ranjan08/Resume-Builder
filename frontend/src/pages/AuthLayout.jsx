import { ArrowUpRight, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Auth.css";

const highlights = ["ATS-friendly templates", "AI-powered writing", "Export-ready in minutes"];

export default function AuthLayout({ mode, children }) {
  const isRegister = mode === "register";

  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-label="About Folio">
        <Link className="auth-brand" to="/" aria-label="Folio home">
          <span className="auth-brand-mark"><FileText size={19} strokeWidth={2.2} /></span>
          <span>folio<span className="auth-brand-dot">.</span></span>
        </Link>

        <div className="showcase-copy">
          <span className="eyebrow"><Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Make your experience <em>impossible to ignore.</em></h1>
          <p>Build a polished resume that tells your story clearly and gets you closer to work you love.</p>
          <ul className="showcase-highlights">
            {highlights.map((highlight) => <li key={highlight}><span className="highlight-check">✓</span>{highlight}</li>)}
          </ul>
        </div>

        <div className="resume-card-art" aria-hidden="true">
          <div className="resume-art-top"><span>RESUME / 2026</span><span className="resume-art-status"><i /> READY TO SHARE</span></div>
          <div className="resume-art-person">
            <div className="resume-art-avatar">JD</div>
            <div><strong>Jordan Davis</strong><span>Product Designer</span></div>
          </div>
          <div className="resume-art-rule" />
          <div className="resume-art-columns">
            <div><span className="resume-art-label">EXPERIENCE</span><b>Senior Product Designer</b><small>Northstar Studio · 2022 — Now</small><i /><i className="short" /></div>
            <div><span className="resume-art-label">EDUCATION</span><b>Design & Technology</b><small>Westbridge University</small><span className="resume-art-score"><strong>94</strong><small>ATS SCORE</small></span></div>
          </div>
          <span className="resume-art-sparkle"><Sparkles size={18} /></span>
        </div>

        <div className="showcase-footer"><span>DESIGNED FOR YOUR NEXT MOVE</span><span>01 — 03</span></div>
      </section>

      <section className="auth-content">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><span className="auth-brand-mark"><FileText size={19} /></span>folio<span className="auth-brand-dot">.</span></div>
          <div className="auth-heading">
            <span className="auth-step">{isRegister ? "LET’S GET YOU STARTED" : "GOOD TO HAVE YOU BACK"}</span>
            <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
            <p>{isRegister ? "A standout resume is a few details away." : "Sign in to pick up where your next chapter begins."}</p>
          </div>
          {children}
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to Folio?"}{" "}
            <Link to={isRegister ? "/" : "/register"}>{isRegister ? "Sign in" : "Create an account"}<ArrowUpRight size={14} /></Link>
          </p>
          <div className="auth-legal">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</div>
        </div>
        <div className="auth-content-footer"><span>© 2026 FOLIO RESUME BUILDER</span><span>MADE FOR WHAT’S NEXT <span className="footer-star">✳</span></span></div>
      </section>
    </main>
  );
}
