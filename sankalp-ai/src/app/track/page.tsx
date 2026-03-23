"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/PageLayout";
import Link from "next/link";

interface AuditEntry {
  id: number;
  action: string;
  officer_name?: string;
  timestamp: string;
  curr_hash: string;
}

interface TrackResult {
  ticketId: string;
  status: string;
  category: string;
  ward_name?: string;
  created_at: string;
  resolved_at?: string;
  satisfaction?: string;
  audit: AuditEntry[];
}

export default function TrackPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const handleTrack = async () => {
    const id = input.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/audit/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Ticket not found");
      const data = await res.json() as { ticketId: string; entries: AuditEntry[] };
      // also fetch ticket status
      let status = "pending", category = "General Grievance", ward_name = "", created_at = "", resolved_at = "", satisfaction = "";
      try {
        const ticketRes = await fetch(`/api/admin/complaints?limit=200`);
        if (ticketRes.ok) {
          const complaints = await ticketRes.json() as Array<{ id: string; status: string; category: string; ward_name?: string; created_at: string; resolved_at?: string; satisfaction?: string }>;
          const match = complaints.find((c) => c.id === data.ticketId || c.id.startsWith(id.replace(/^DL-/i, "").toLowerCase()));
          if (match) {
            status = match.status;
            category = match.category;
            ward_name = match.ward_name ?? "";
            created_at = match.created_at;
            resolved_at = match.resolved_at ?? "";
            satisfaction = match.satisfaction ?? "";
          }
        }
      } catch { /* ignore */ }
      setResult({ ticketId: data.ticketId, status, category, ward_name, created_at, resolved_at, satisfaction, audit: data.entries ?? [] });
    } catch {
      setError("No ticket found with that ID. Check the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (rating: "satisfied" | "unsatisfied") => {
    if (!result || !phone) return;
    setFeedbackLoading(true);
    try {
      await fetch(`/api/tickets/${result.ticketId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, "").slice(-10), rating }),
      });
      setFeedbackDone(true);
    } catch { /* ignore */ } finally {
      setFeedbackLoading(false);
    }
  };

  const statusColor = (s: string) =>
    s === "resolved" || s === "closed" ? "#16A34A" : s === "in_progress" ? "#F59E0B" : "#6B7280";

  const statusLabel = (s: string) =>
    s === "resolved" ? "Resolved" : s === "in_progress" ? "In Progress" : s === "assigned" ? "Assigned" : "Pending";

  const formatTime = (iso: string) =>
    iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <PageLayout>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 80px", minHeight: "calc(100vh - 164px)" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: "560px" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 400, color: "#1A2E2A", margin: "0 0 6px" }}>
            Track Your Complaint
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.55)", margin: "0 0 32px" }}>
            Enter your ticket ID to see live status and audit trail.
          </p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="e.g. DL-4A2B1C"
              style={{
                flex: 1, padding: "13px 16px", borderRadius: "12px",
                border: "1.5px solid rgba(26,46,42,0.15)", background: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#1A2E2A",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.15)")}
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              style={{
                padding: "13px 24px", borderRadius: "12px", border: "none",
                background: loading ? "rgba(26,46,42,0.4)" : "#1A2E2A",
                color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "..." : "Track"}
            </button>
          </div>

          {error && (
            <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.2)", color: "#C2552A", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Status card */}
                <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid rgba(26,46,42,0.07)", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", fontWeight: 700, color: "#FF6B2B" }}>
                        DL-{result.ticketId.slice(0, 6).toUpperCase()}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(26,46,42,0.55)", marginTop: "4px" }}>
                        {result.category} · {result.ward_name}
                      </div>
                    </div>
                    <span style={{
                      padding: "5px 12px", borderRadius: "999px",
                      background: `${statusColor(result.status)}18`,
                      color: statusColor(result.status),
                      fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700,
                    }}>
                      {statusLabel(result.status)}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Row label="Filed on" value={formatTime(result.created_at)} />
                    {result.resolved_at && <Row label="Resolved on" value={formatTime(result.resolved_at)} green />}
                    {result.satisfaction && (
                      <Row label="Your rating" value={result.satisfaction === "satisfied" ? "Satisfied" : "Not satisfied"} green={result.satisfaction === "satisfied"} />
                    )}
                  </div>
                </div>

                {/* Satisfaction feedback (if resolved and no feedback yet) */}
                {result.status === "resolved" && !result.satisfaction && !feedbackDone && (
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", border: "1.5px solid rgba(26,46,42,0.07)", marginBottom: "16px" }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A2E2A", marginBottom: "12px" }}>
                      Was the issue actually resolved to your satisfaction?
                    </p>
                    {!showFeedback ? (
                      <button
                        onClick={() => setShowFeedback(true)}
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, padding: "8px 18px", borderRadius: "999px", border: "1.5px solid rgba(26,46,42,0.2)", background: "transparent", color: "#1A2E2A", cursor: "pointer" }}
                      >
                        Leave feedback
                      </button>
                    ) : (
                      <div>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Your mobile number (to verify)"
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid rgba(26,46,42,0.15)", background: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "12px" }}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleFeedback("satisfied")}
                            disabled={feedbackLoading || !phone}
                            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "#16A34A", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                          >
                            Yes, satisfied
                          </button>
                          <button
                            onClick={() => handleFeedback("unsatisfied")}
                            disabled={feedbackLoading || !phone}
                            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid rgba(26,46,42,0.2)", background: "transparent", color: "#1A2E2A", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                          >
                            No, not satisfied
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {feedbackDone && (
                  <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", color: "#16A34A", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>
                    Thank you for your feedback. It helps improve civic services.
                  </div>
                )}

                {/* Audit trail */}
                {result.audit.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", border: "1.5px solid rgba(26,46,42,0.07)" }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "16px" }}>
                      Audit Trail
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {result.audit.map((entry, i) => (
                        <div key={entry.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === result.audit.length - 1 ? "#16A34A" : "#5D7A6F", flexShrink: 0, marginTop: "4px" }} />
                          <div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1A2E2A" }}>
                              {entry.action.replace(/_/g, " ")}
                            </div>
                            {entry.officer_name && <div style={{ fontSize: "12px", color: "rgba(26,46,42,0.5)" }}>{entry.officer_name}</div>}
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "rgba(26,46,42,0.35)", marginTop: "2px" }}>
                              {formatTime(entry.timestamp)}
                            </div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "rgba(26,46,42,0.2)", marginTop: "2px", wordBreak: "break-all" }}>
                              {entry.curr_hash.slice(0, 32)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Link href="/complaint" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A2E2A", textDecoration: "none", padding: "11px 24px", borderRadius: "999px", border: "1.5px solid rgba(26,46,42,0.2)", display: "inline-block" }}>
              File a new complaint
            </Link>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }}>
      <span style={{ color: "rgba(26,46,42,0.5)" }}>{label}</span>
      <span style={{ fontWeight: 600, color: green ? "#16A34A" : "#1A2E2A" }}>{value}</span>
    </div>
  );
}
