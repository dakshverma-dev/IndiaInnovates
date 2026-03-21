"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: string;
  category: string;
  priority: "P1" | "P2" | "P3" | "P4";
  status: string;
  ward_name?: string;
  ai_summary?: string;
  message?: string;
  created_at?: string;
  officer_name?: string;
}

const BACKEND = "";
const WS_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const PRIORITY_COLOR: Record<string, string> = {
  P1: "#FF6B2B",
  P2: "#e8a020",
  P3: "#5D7A6F",
  P4: "#9CA3AF",
};

const PRIORITY_LABEL: Record<string, string> = {
  P1: "Critical",
  P2: "High",
  P3: "Medium",
  P4: "Low",
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

type VerifyState = "idle" | "scanning" | "gps" | "photo" | "done";

export default function OfficerPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState<VerifyState>("idle");
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [justResolved, setJustResolved] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = "Bearer " + token;
    fetch(BACKEND + "/api/tickets?status=pending&limit=20", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTickets(data);
      })
      .catch(() => setBackendOnline(false))
      .finally(() => setLoading(false));

    // Also listen for new tickets via Socket.IO
    let socket: { on: (e: string, cb: (d: unknown) => void) => void; disconnect: () => void } | null = null;
    import("socket.io-client").then(({ io }) => {
      socket = io(WS_URL, { transports: ["websocket", "polling"] });
      socket.on("new_ticket", (data: unknown) => {
        setTickets((prev) => [data as Ticket, ...prev]);
      });
    }).catch(() => {});
    return () => { socket?.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const simulateVerify = async (ticket: Ticket) => {
    if (resolved.has(ticket.id)) return;
    setVerifying(ticket.id);
    setVerifyStep("scanning");
    await new Promise((r) => setTimeout(r, 1200));
    setVerifyStep("gps");
    await new Promise((r) => setTimeout(r, 1000));
    setVerifyStep("photo");
    await new Promise((r) => setTimeout(r, 1200));
    setVerifyStep("done");

    try {
      await fetch(BACKEND + "/api/tickets/" + ticket.id + "/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify({
          qrCode: ticket.id.slice(0, 8),
          gpsLat: 28.5 + Math.random() * 0.3,
          gpsLng: 77.1 + Math.random() * 0.3,
          photoBase64: "DEMO_PHOTO_DATA",
          officerId: 1,
        }),
      });
    } catch (_) {
      // Backend might not be up — still show success in demo
    }

    setResolved((prev) => new Set([...prev, ticket.id]));
    setJustResolved(ticket.id);
    setVerifyStep("idle");
    setVerifying(null);

    setTimeout(() => setJustResolved(null), 3000);
    setTickets((prev) =>
      prev.map((t) => t.id === ticket.id ? { ...t, status: "resolved" } : t)
    );
  };

  if (!isAuthenticated) return null;

  const pendingTickets = tickets.filter((t) => t.status !== "resolved" && !resolved.has(t.id));
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || resolved.has(t.id));

  const verifySteps = [
    { key: "scanning", label: "Scanning QR code", icon: "◈" },
    { key: "gps", label: "Verifying GPS location", icon: "◎" },
    { key: "photo", label: "Uploading resolution photo", icon: "◉" },
  ];

  return (
    <PageLayout showFooter>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 80px" }}>

        {!backendOnline && (
          <div style={{ background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.18)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#FF6B2B" }}>
            Backend offline — no live data. Start backend: <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>cd backend && npm run dev</span>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: "40px", paddingBottom: "28px", borderBottom: "1px solid rgba(26,46,42,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16A34A" }} className="animate-pulse" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 600, color: "#16A34A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Field Officer Portal
            </span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(30px, 5vw, 42px)", color: "#1A2E2A", lineHeight: 1.1, marginBottom: "10px" }}>
            Your Assignments
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "rgba(26,46,42,0.5)", lineHeight: 1.6, maxWidth: "480px" }}>
            Scan QR codes on-site and upload resolution photos. Each action is recorded in the immutable audit trail.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "36px" }}>
          {[
            { label: "Pending", value: pendingTickets.length, color: "#FF6B2B" },
            { label: "Resolved Today", value: resolvedTickets.length, color: "#16A34A" },
            { label: "Total", value: tickets.length, color: "#1A2E2A" },
          ].map((s) => (
            <div key={s.label} style={{ background: "white", border: "1.5px solid rgba(26,46,42,0.07)", borderRadius: "14px", padding: "16px 18px" }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "8px" }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: s.color, lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Pending tickets */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.8 }}
                  style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1A2E2A" }}
                />
              ))}
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(26,46,42,0.4)", marginTop: "12px" }}>Loading assignments...</p>
          </div>
        ) : pendingTickets.length === 0 && resolvedTickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: "20px", border: "1.5px solid rgba(26,46,42,0.07)" }}>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#1A2E2A", marginBottom: "8px" }}>All clear.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.4)" }}>No pending assignments. Backend may not be running.</p>
          </div>
        ) : (
          <>
            {pendingTickets.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "14px" }}>
                  Pending · {pendingTickets.length}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <AnimatePresence>
                    {pendingTickets.map((ticket) => {
                      const isVerifying = verifying === ticket.id;
                      return (
                        <motion.div
                          key={ticket.id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40, transition: { duration: 0.3 } }}
                          style={{
                            background: "white",
                            border: "1.5px solid " + (isVerifying ? "#FF6B2B" : "rgba(26,46,42,0.08)"),
                            borderRadius: "18px",
                            padding: "20px 22px",
                            boxShadow: isVerifying ? "0 4px 24px rgba(255,107,43,0.1)" : "none",
                            transition: "box-shadow 0.3s, border-color 0.3s",
                          }}
                        >
                          {/* Ticket header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: PRIORITY_COLOR[ticket.priority], flexShrink: 0 }} />
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#1A2E2A" }}>
                                {ticket.category}
                              </span>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", background: PRIORITY_COLOR[ticket.priority] + "18", color: PRIORITY_COLOR[ticket.priority] }}>
                                {ticket.priority} · {PRIORITY_LABEL[ticket.priority]}
                              </span>
                            </div>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(26,46,42,0.4)", flexShrink: 0 }}>
                              {timeAgo(ticket.created_at)}
                            </span>
                          </div>

                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.7)", lineHeight: 1.5, marginBottom: "12px" }}>
                            {ticket.ai_summary || ticket.message || "Complaint filed in this area."}
                          </p>

                          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.45)", display: "flex", alignItems: "center", gap: "4px" }}>
                              📍 {ticket.ward_name || "Unknown Ward"}
                            </span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(26,46,42,0.3)" }}>
                              #{ticket.id.slice(0, 8)}
                            </span>
                          </div>

                          {/* Verification steps (shown while verifying) */}
                          <AnimatePresence>
                            {isVerifying && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: "hidden", marginBottom: "16px" }}
                              >
                                <div style={{ background: "rgba(26,46,42,0.03)", borderRadius: "12px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {verifySteps.map((vs, i) => {
                                    const stepOrder = ["scanning", "gps", "photo"];
                                    const currentIdx = stepOrder.indexOf(verifyStep);
                                    const thisIdx = i;
                                    const done = currentIdx > thisIdx;
                                    const active = currentIdx === thisIdx;
                                    return (
                                      <div key={vs.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                          width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                          background: done ? "#16A34A" : active ? "#FF6B2B" : "rgba(26,46,42,0.06)",
                                          transition: "background 0.3s",
                                        }}>
                                          {done ? (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          ) : active ? (
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.7 }}
                                              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />
                                          ) : (
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(26,46,42,0.2)" }} />
                                          )}
                                        </div>
                                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: active ? 600 : 400, color: done ? "#16A34A" : active ? "#FF6B2B" : "rgba(26,46,42,0.4)" }}>
                                          {vs.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Resolve button */}
                          <motion.button
                            whileHover={!isVerifying ? { scale: 1.01 } : {}}
                            whileTap={!isVerifying ? { scale: 0.98 } : {}}
                            onClick={() => simulateVerify(ticket)}
                            disabled={isVerifying}
                            style={{
                              width: "100%", padding: "13px",
                              borderRadius: "100px",
                              background: isVerifying ? "rgba(26,46,42,0.06)" : "#1A2E2A",
                              color: isVerifying ? "rgba(26,46,42,0.4)" : "#E7E8E2",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "14px", fontWeight: 600,
                              border: "none", cursor: isVerifying ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            }}
                          >
                            {isVerifying ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                  style={{ width: "14px", height: "14px", border: "2px solid rgba(26,46,42,0.2)", borderTopColor: "#1A2E2A", borderRadius: "50%" }}
                                />
                                Verifying...
                              </>
                            ) : (
                              "Simulate Field Resolve →"
                            )}
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Resolved section */}
            {resolvedTickets.length > 0 && (
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "14px" }}>
                  Resolved · {resolvedTickets.length}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {resolvedTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      initial={justResolved === ticket.id ? { opacity: 0, scale: 0.97 } : false}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        background: justResolved === ticket.id ? "rgba(22,163,74,0.05)" : "rgba(26,46,42,0.02)",
                        border: "1.5px solid " + (justResolved === ticket.id ? "rgba(22,163,74,0.3)" : "rgba(26,46,42,0.06)"),
                        borderRadius: "14px", padding: "14px 18px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        transition: "all 0.5s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1A2E2A" }}>{ticket.category}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.4)", marginLeft: "8px" }}>{ticket.ward_name}</span>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "#16A34A" }}>Resolved</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Demo explainer */}
        <div style={{ marginTop: "48px", background: "#1A2E2A", borderRadius: "20px", padding: "24px 28px" }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#E7E8E2", marginBottom: "8px" }}>
            How field verification works
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(231,232,226,0.5)", lineHeight: 1.7, marginBottom: "16px" }}>
            In production, the field officer scans a QR code placed at the complaint site, captures a resolution photo, and GPS coordinates are verified. All steps are hash-chained in the audit log.
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["QR Scan", "GPS Verify", "Photo Upload", "Audit Log"].map((step) => (
              <span key={step} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "100px", background: "rgba(255,255,255,0.08)", color: "rgba(231,232,226,0.7)" }}>
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
