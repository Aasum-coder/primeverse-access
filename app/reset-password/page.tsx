"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"loading" | "expired" | "form" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;

    // Check for expired / denied link
    if (hash.includes("error=access_denied") || hash.includes("error_code=otp_expired")) {
      setStatus("expired");
      return;
    }

    // Check for recovery flow
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(hash.replace("#", ""));

    // Handle code param (PKCE flow — session already established by callback)
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus("expired");
        } else {
          setStatus("form");
        }
      });
      return;
    }

    // Handle hash-based recovery (type=recovery with access_token in hash)
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (type === "recovery" && accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      }).then(({ error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus("expired");
        } else {
          setStatus("form");
        }
      });
      return;
    }

    // Hash contains access_token without type (old-style)
    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      }).then(({ error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus("expired");
        } else {
          setStatus("form");
        }
      });
      return;
    }

    // Check if session already exists (callback already set it)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus("form");
      } else {
        setStatus("expired");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="marble-bg" />
      <div className="reset-page">
        <div className="logo-container">
          {/* <img className="logo-img" src="/images/1move-logo.png" alt="1Move Academy" width={180} /> */}
          <div className="portal-title">Reset Password</div>
        </div>

        <div className="reset-card">
          {status === "loading" && (
            <p className="status-text">Verifying link...</p>
          )}

          {status === "expired" && (
            <div className="message-block">
              <p className="error-text">
                This link has expired. Please request a new password reset.
              </p>
              <button className="gold-btn" onClick={() => router.push("/login")}>
                Request new link
              </button>
            </div>
          )}

          {(status === "form" || status === "error") && (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">New Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                  autoFocus
                />
              </div>
              <div className="field">
                <label className="field-label">Confirm Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={6}
                  required
                />
              </div>
              {errorMsg && <p className="error-text">{errorMsg}</p>}
              <button className="gold-btn" type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Set New Password"}
              </button>
            </form>
          )}

          {status === "success" && (
            <div className="message-block">
              <svg className="success-check" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="success-text">
                Password updated! Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --gold-deep: #7a5c12;
    --marble-dark: #0a0a0a;
    --card-bg: rgba(8, 8, 8, 0.75);
    --card-border: rgba(212, 165, 55, 0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
    --input-focus: rgba(212, 165, 55, 0.5);
    --error-color: #d44a37;
    --success-color: #c9a84c;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    height: 100%;
    font-family: 'Outfit', sans-serif;
    background: var(--marble-dark);
    color: var(--text-primary);
    overflow-x: hidden;
  }

  .marble-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse 120% 80% at 20% 30%, rgba(30, 25, 18, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 120% at 80% 70%, rgba(25, 20, 14, 0.8) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(35, 28, 18, 0.5) 0%, transparent 50%),
      linear-gradient(137deg, transparent 30%, rgba(212, 165, 55, 0.03) 32%, transparent 34%),
      linear-gradient(217deg, transparent 45%, rgba(212, 165, 55, 0.04) 47%, transparent 49%),
      linear-gradient(352deg, transparent 55%, rgba(180, 140, 45, 0.03) 57%, transparent 59%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
    background-size: cover;
  }

  .reset-page {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .logo-container {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .logo-img {
    display: block;
    margin: 0 auto 0.75rem;
    filter: drop-shadow(0 2px 8px rgba(212, 165, 55, 0.15));
  }

  .portal-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 1.35rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 40%, var(--gold-dark) 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 0.75rem;
  }

  .reset-card {
    width: 100%;
    max-width: 420px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 2.5rem 2rem 2rem;
    backdrop-filter: blur(24px);
    box-shadow:
      0 1px 0 rgba(212, 165, 55, 0.05) inset,
      0 24px 80px rgba(0, 0, 0, 0.4),
      0 4px 20px rgba(0, 0, 0, 0.3);
    animation: cardReveal 0.6s ease;
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .field {
    margin-bottom: 1.15rem;
  }

  .field-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 0.45rem;
  }

  .field-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .field-input::placeholder {
    color: rgba(154, 145, 126, 0.5);
  }

  .field-input:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212, 165, 55, 0.08);
    outline: 2px solid var(--gold);
    outline-offset: 1px;
  }

  .gold-btn {
    position: relative;
    width: 100%;
    padding: 0.85rem 1.5rem;
    margin-top: 0.5rem;
    border: none;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    overflow: hidden;
    color: #0a0804;
    background:
      linear-gradient(135deg,
        #c9a227 0%, #e8c975 15%, #d4a537 30%, #b8922a 45%,
        #e8c975 55%, #d4a537 70%, #c9a227 85%, #dbb84c 100%
      );
    background-size: 200% 200%;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.15) inset,
      0 -1px 0 rgba(0, 0, 0, 0.2) inset,
      0 4px 16px rgba(160, 120, 24, 0.25),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }

  .gold-btn:hover {
    transform: translateY(-1px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.15) inset,
      0 -1px 0 rgba(0, 0, 0, 0.2) inset,
      0 8px 24px rgba(160, 120, 24, 0.35),
      0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .gold-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .gold-btn:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }

  .error-text {
    color: var(--error-color);
    font-size: 0.88rem;
    margin-bottom: 0.75rem;
    text-align: center;
    line-height: 1.5;
  }

  .success-check {
    display: block;
    margin: 0 auto 1rem;
    animation: checkPop 0.4s ease;
  }

  @keyframes checkPop {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }

  .success-text {
    color: var(--success-color);
    font-size: 1rem;
    text-align: center;
    line-height: 1.5;
  }

  .status-text {
    color: var(--text-secondary);
    font-size: 0.95rem;
    text-align: center;
  }

  .message-block {
    text-align: center;
  }
`;
