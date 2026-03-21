"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import Link from "next/link";
import { motion } from "framer-motion";
import PageLayout from "../../components/PageLayout";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token, data.user);
      router.push("/dashboard");
    } catch (_err) {
      if (phone === "9999999999" && pin === "000000") {
        login(
          "demo-token-offline",
          { id: "admin-001", name: "Admin", phone: "9999999999", role: "admin" }
        );
        router.push("/dashboard");
        return;
      }
      setError("Backend offline. Use demo credentials: 9999999999 / 000000");
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
    <PageLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 164px)", padding: "0 24px 80px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%", maxWidth: "420px",
            background: "white",
            border: "1.5px solid rgba(26,46,42,0.07)",
            borderRadius: "20px",
            padding: "40px 36px",
          }}
        >
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#1A2E2A", marginBottom: "8px", lineHeight: 1.1 }}>
            Welcome back
          </h1>
          <p style={{ color: "rgba(26,46,42,0.5)", fontSize: "14px", marginBottom: "36px", fontFamily: "'DM Sans', sans-serif" }}>
            Sign in to access the civic dashboard.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif" }}>
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
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif" }}>
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-6 digits"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.15)")}
              />
            </div>

            {error && (
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.2)", color: "#FF6B2B", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
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
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div style={{ background: "rgba(26,46,42,0.04)", borderRadius: "12px", padding: "14px 16px", border: "1px solid rgba(26,46,42,0.06)" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>
                Demo Access
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#1A2E2A", fontWeight: 500 }}>
                9999999999 / 000000
              </p>
            </div>

            <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(26,46,42,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
              No account?{" "}
              <Link href="/auth/register" style={{ color: "#FF6B2B", fontWeight: 600, textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </PageLayout>
  );
}
