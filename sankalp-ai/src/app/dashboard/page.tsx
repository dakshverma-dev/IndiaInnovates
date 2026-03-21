"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface LiveTicket {
  id: string;
  category: string;
  priority: "P1" | "P2" | "P3" | "P4";
  status: string;
  ward_name?: string;
  ward_id?: number;
  ai_summary?: string;
  phone?: string;
  created_at?: string;
  assigned_officer_id?: number;
  officer_name?: string;
}

interface LiveStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  avg_resolution_hours: number;
  avg_health: number;
}

interface WardHealth {
  ward: number;
  name: string;
  health: number;
}

interface Prediction {
  id: number;
  ward_name: string;
  category: string;
  predicted_date: string;
  confidence: number;
}

interface AuditEntry {
  id: number;
  action: string;
  timestamp: string;
  officer_name?: string;
  curr_hash?: string;
}

const BACKEND_URL = "";
const WS_URL = "http://localhost:3001";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#FF6B2B",
  P2: "#e8a020",
  P3: "#5D7A6F",
  P4: "#9CA3AF",
};

const PRIORITY_BG: Record<string, string> = {
  P1: "rgba(255,107,43,0.1)",
  P2: "rgba(232,160,32,0.1)",
  P3: "rgba(93,122,111,0.1)",
  P4: "rgba(156,163,175,0.1)",
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuth();

  const [stats, setStats] = useState<LiveStats | null>(null);
  const [tickets, setTickets] = useState<LiveTicket[]>([]);
  const [wards, setWards] = useState<WardHealth[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  const fallbackWards = [
    { ward: 14, name: "Karol Bagh", health: 91 },
    { ward: 42, name: "Lajpat Nagar", health: 88 },
    { ward: 23, name: "Rohini", health: 76 },
    { ward: 51, name: "Dwarka", health: 64 },
    { ward: 45, name: "Govindpuri", health: 45 },
  ];

  const fallbackPredictions = [
    { id: 1, ward_name: "Lajpat Nagar", category: "Drainage", predicted_date: "2026-07-15T00:00:00Z", confidence: 0.92 },
    { id: 2, ward_name: "Rohini", category: "Potholes", predicted_date: "2026-07-22T00:00:00Z", confidence: 0.87 },
    { id: 3, ward_name: "Dwarka", category: "Water Supply", predicted_date: "2026-07-18T00:00:00Z", confidence: 0.78 },
  ];

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: "Bearer " + token };

    fetch(BACKEND_URL + "/api/admin/stats", { headers })
      .then((r) => r.json()).then(setStats).catch(() => setBackendOnline(false));

    fetch(BACKEND_URL + "/api/admin/complaints?limit=20", { headers })
      .then((r) => r.json()).then(setTickets).catch(() => setBackendOnline(false));

    fetch(BACKEND_URL + "/api/wards", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWards(data.map((w: Record<string, unknown>) => ({ ward: w.id as number, name: w.name as string, health: (w.health_score as number) || 80 }))
            .sort((a, b) => b.health - a.health).slice(0, 5));
        } else setWards(fallbackWards);
      })
      .catch(() => setWards(fallbackWards));

    fetch(BACKEND_URL + "/api/predictions", { headers })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPredictions(data.slice(0, 5)); else setPredictions(fallbackPredictions); })
      .catch(() => setPredictions(fallbackPredictions));

    let socket: { on: (e: string, cb: (d: unknown) => void) => void; disconnect: () => void } | null = null;
    import("socket.io-client").then(({ io }) => {
      socket = io(WS_URL, { transports: ["websocket", "polling"], auth: { token } });
      socket.on("connect", () => setWsConnected(true));
      socket.on("disconnect", () => setWsConnected(false));
      socket.on("stats_update", (data: unknown) => setStats(data as LiveStats));
      socket.on("new_ticket", (data: unknown) => {
        setTickets((prev) => [data as LiveTicket, ...prev].slice(0, 50));
        setStats((s) => s ? { ...s, total: s.total + 1, pending: s.pending + 1 } : s);
      });
      socket.on("ticket_updated", (data: unknown) => {
        const u = data as LiveTicket;
        setTickets((prev) => prev.map((t) => t.id === u.id ? { ...t, ...u } : t));
        if (u.status === "resolved") {
          setStats((s) => s ? { ...s, resolved: s.resolved + 1, pending: Math.max(0, s.pending - 1) } : s);
        }
      });
    }).catch(() => {});

    return () => { socket?.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await fetch(BACKEND_URL + "/api/tickets/" + id + "/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ resolvedBy: "Dashboard Admin" }),
      });
      setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "resolved" } : t));
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(null);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setAuditData([]);
    try {
      const res = await fetch(BACKEND_URL + "/api/audit/" + id, { headers: { Authorization: "Bearer " + token } });
      if (res.ok) setAuditData(await res.json());
      else setTimeout(() => setAuditData([
        { id: 1, action: "CREATED", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, action: "ASSIGNED_OFFICER", officer_name: "Amit Kumar", timestamp: new Date(Date.now() - 1800000).toISOString() },
      ]), 400);
    } catch {
      setTimeout(() => setAuditData([
        { id: 1, action: "CREATED", timestamp: new Date(Date.now() - 3600000).toISOString() },
      ]), 400);
    }
  };

  if (!isAuthenticated || !user) return null;

  const displayStats = [
    { label: "Total Tickets", value: stats?.total ?? "—", color: "#1A2E2A" },
    { label: "Pending", value: stats?.pending ?? "—", color: "#FF6B2B" },
    { label: "Resolved", value: stats?.resolved ?? "—", color: "#16A34A" },
    { label: "Avg Health", value: stats?.avg_health ? stats.avg_health + "/100" : "—/100", color: "#5D7A6F" },
  ];

  return (
    <PageLayout showFooter>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px", width: "100%" }}>

        {!backendOnline && (
          <div style={{ background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.18)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#FF6B2B" }}>
            Backend offline — showing demo data. Start backend: <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>cd backend && npm run dev</span>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "40px", paddingBottom: "28px", borderBottom: "1px solid rgba(26,46,42,0.08)" }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#1A2E2A", marginBottom: "6px", lineHeight: 1.1 }}>
              Civic Dashboard
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.5)" }}>
              Delhi Operations · <span style={{ color: "#1A2E2A", fontWeight: 600 }}>{user.name}</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", border: "1.5px solid rgba(26,46,42,0.08)", borderRadius: "100px", padding: "8px 14px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: wsConnected ? "#16A34A" : "#9CA3AF", flexShrink: 0 }} className={wsConnected ? "animate-pulse" : ""} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: wsConnected ? "#16A34A" : "#9CA3AF" }}>
              {wsConnected ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }} className="grid-cols-2-mobile">
          {displayStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ background: "white", border: "1.5px solid rgba(26,46,42,0.07)", borderRadius: "16px", padding: "20px 22px" }}
            >
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "10px" }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: s.color, lineHeight: 1, marginBottom: "2px" }}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }} className="grid-single-mobile">

          {/* Live feed */}
          <div style={{ background: "white", border: "1.5px solid rgba(26,46,42,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(26,46,42,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#1A2E2A" }}>Live Feed</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16A34A" }} className="animate-pulse" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "#16A34A" }}>
                  {tickets.length} tickets
                </span>
              </div>
            </div>
            <div style={{ maxHeight: "720px", overflowY: "auto", padding: "16px" }}>
              <AnimatePresence>
                {tickets.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginBottom: "10px" }}
                  >
                    <div
                      onClick={() => toggleExpand(t.id)}
                      style={{
                        background: expandedId === t.id ? "rgba(93,122,111,0.04)" : "rgba(26,46,42,0.02)",
                        border: "1.5px solid " + (expandedId === t.id ? "rgba(93,122,111,0.25)" : "rgba(26,46,42,0.07)"),
                        borderRadius: "14px", padding: "14px 16px", cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: PRIORITY_COLORS[t.priority] || "#9CA3AF", flexShrink: 0 }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", background: PRIORITY_BG[t.priority] || "rgba(156,163,175,0.1)", color: PRIORITY_COLORS[t.priority] || "#9CA3AF" }}>
                            {t.category}
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(26,46,42,0.35)", whiteSpace: "nowrap" }}>
                            #{t.id.slice(0, 8)}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(26,46,42,0.4)" }}>
                            {timeAgo(t.created_at)}
                          </span>
                          {t.status === "resolved" ? (
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, color: "#16A34A", display: "flex", alignItems: "center", gap: "4px" }}>
                              ✓ Resolved
                            </span>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleResolve(t.id); }}
                              disabled={resolving === t.id}
                              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "100px", border: "1.5px solid rgba(26,46,42,0.2)", background: "transparent", color: "#1A2E2A", cursor: "pointer", transition: "all 0.15s" }}
                            >
                              {resolving === t.id ? "..." : "Resolve"}
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(26,46,42,0.65)", marginTop: "8px", lineHeight: 1.5 }}>
                        {t.ai_summary || ("Complaint regarding " + t.category.toLowerCase() + " in " + (t.ward_name || "Delhi"))}
                      </p>
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(26,46,42,0.4)" }}>
                          📍 {t.ward_name || "Unknown Ward"}
                        </span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, color: PRIORITY_COLORS[t.priority] }}>
                          {t.priority}
                        </span>
                      </div>

                      {/* Audit trail */}
                      {expandedId === t.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(26,46,42,0.07)" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "12px" }}>
                            Audit Trail
                          </p>
                          {auditData.length === 0 ? (
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.4)" }}>Loading...</p>
                          ) : (
                            <div style={{ position: "relative", borderLeft: "2px solid rgba(26,46,42,0.1)", marginLeft: "8px", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                              {auditData.map((a) => (
                                <div key={a.id} style={{ position: "relative" }}>
                                  <div style={{ position: "absolute", width: "8px", height: "8px", background: "#1A2E2A", borderRadius: "50%", left: "-21px", top: "4px", border: "2px solid white" }} />
                                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(26,46,42,0.35)", marginBottom: "2px" }}>
                                    {new Date(a.timestamp).toLocaleString("en-IN")}
                                  </p>
                                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1A2E2A" }}>
                                    {a.action.replace(/_/g, " ")}
                                  </p>
                                  {a.officer_name && (
                                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#5D7A6F", fontWeight: 500 }}>
                                      By: {a.officer_name}
                                    </p>
                                  )}
                                  {a.curr_hash && (
                                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "rgba(26,46,42,0.25)", marginTop: "2px" }}>
                                      {a.curr_hash.slice(0, 24)}…
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {tickets.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.4)" }}>
                  No tickets yet. Submit a complaint to see it here.
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Ward health */}
            <div style={{ background: "white", border: "1.5px solid rgba(26,46,42,0.07)", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(26,46,42,0.06)" }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1A2E2A" }}>Ward Health</h2>
              </div>
              <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {wards.map((w, idx) => (
                  <div key={w.ward}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1A2E2A" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(26,46,42,0.35)", marginRight: "6px" }}>{String(idx + 1).padStart(2, "0")}</span>
                        {w.name}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 600, color: w.health > 80 ? "#16A34A" : w.health > 50 ? "#5D7A6F" : "#FF6B2B" }}>
                        {w.health}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "4px", background: "rgba(26,46,42,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: w.health + "%" }}
                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: "100px", background: w.health > 80 ? "#16A34A" : w.health > 50 ? "#5D7A6F" : "#FF6B2B" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Predictions */}
            <div style={{ background: "white", border: "1.5px solid rgba(26,46,42,0.07)", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(26,46,42,0.06)" }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1A2E2A" }}>AI Predictions</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.4)", marginTop: "2px" }}>Monsoon season risks</p>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {predictions.map((p) => (
                  <div
                    key={p.id}
                    style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(255,107,43,0.04)", border: "1px solid rgba(255,107,43,0.12)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#1A2E2A" }}>
                        {p.category}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 600, color: "#FF6B2B", background: "rgba(255,107,43,0.1)", padding: "2px 7px", borderRadius: "100px" }}>
                        {Math.round(p.confidence * 100)}%
                      </span>
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.5)" }}>
                      {p.ward_name} · {new Date(p.predicted_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .grid-single-mobile { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .grid-cols-2-mobile { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </PageLayout>
  );
}
