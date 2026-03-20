"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      register(data.token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "13px 16px",
    borderRadius: "12px", border: "1.5px solid rgba(26,46,42,0.15)",
    background: "white", color: "#1A2E2A", fontSize: "14px",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col"
        style={{ width: "42%", background: "#1A2E2A", padding: "48px", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(93,122,111,0.25) 0%, transparent 70%)", transform: "translate(-30%, 30%)", pointerEvents: "none" }} />

        <Link href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#E7E8E2", textDecoration: "none", position: "relative", zIndex: 1 }}>
          SANKALP<span style={{ color: "#5D7A6F" }}>.</span>
        </Link>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "40px", color: "#E7E8E2", lineHeight: 1.1, marginBottom: "20px" }}>
            Join the<br />
            <span style={{ color: "#5D7A6F" }}>civic network.</span>
          </p>
          <p style={{ color: "rgba(231,232,226,0.45)", fontSize: "15px", lineHeight: 1.7, maxWidth: "270px" }}>
            File complaints, track resolution, and help build a better Delhi — one ticket at a time.
          </p>
          <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {["Free to use for citizens", "Real-time ticket tracking", "WhatsApp status updates"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#5D7A6F", flexShrink: 0 }} />
                <span style={{ color: "rgba(231,232,226,0.45)", fontSize: "13px" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(231,232,226,0.2)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", zIndex: 1 }}>
          India Innovates · 2026
        </p>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", background: "#E7E8E2" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: "380px" }}
        >
          <div className="lg:hidden" style={{ marginBottom: "36px" }}>
            <Link href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1A2E2A", textDecoration: "none" }}>
              SANKALP<span style={{ color: "#5D7A6F" }}>.</span>
            </Link>
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "34px", color: "#1A2E2A", marginBottom: "8px", lineHeight: 1.1 }}>
            Create account
          </h1>
          <p style={{ color: "rgba(26,46,42,0.5)", fontSize: "14px", marginBottom: "36px" }}>
            Join SANKALP AI to report and track civic issues.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "8px" }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.15)")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "8px" }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.15)")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "8px" }}>
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4–6 digits"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.15)")}
              />
            </div>

            {error && (
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: "100px",
                background: loading ? "rgba(26,46,42,0.5)" : "#1A2E2A",
                color: "#E7E8E2", fontSize: "14px", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s", marginTop: "4px",
              }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>

            <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(26,46,42,0.5)" }}>
              Already have an account?{" "}
              <Link href="/auth/login" style={{ color: "#FF6B2B", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
