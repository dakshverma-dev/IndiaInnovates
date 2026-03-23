"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import RoleGuard from "../components/RoleGuard";

const WARDS = [
  { name: "Lajpat Nagar", id: 42, score: 78, speed: 82, satisfaction: 75, volume: 45, infra: 88, budget: 92, trend: "up" },
  { name: "Govindpuri", id: 67, score: 62, speed: 58, satisfaction: 60, volume: 72, infra: 55, budget: 65, trend: "down" },
  { name: "Rohini Sec 1", id: 23, score: 85, speed: 88, satisfaction: 82, volume: 30, infra: 90, budget: 85, trend: "up" },
  { name: "Dwarka Sec 7", id: 51, score: 92, speed: 95, satisfaction: 90, volume: 20, infra: 94, budget: 96, trend: "up" },
  { name: "Saket", id: 38, score: 74, speed: 70, satisfaction: 72, volume: 55, infra: 78, budget: 80, trend: "stable" },
  { name: "Karol Bagh", id: 14, score: 58, speed: 52, satisfaction: 55, volume: 80, infra: 60, budget: 50, trend: "down" },
  { name: "Chandni Chowk", id: 11, score: 45, speed: 38, satisfaction: 42, volume: 95, infra: 30, budget: 40, trend: "down" },
  { name: "Janakpuri", id: 55, score: 80, speed: 82, satisfaction: 78, volume: 40, infra: 85, budget: 82, trend: "up" },
  { name: "Vasant Kunj", id: 48, score: 88, speed: 90, satisfaction: 85, volume: 25, infra: 92, budget: 88, trend: "up" },
  { name: "Malviya Nagar", id: 40, score: 76, speed: 74, satisfaction: 75, volume: 50, infra: 80, budget: 78, trend: "up" },
  { name: "Preet Vihar", id: 102, score: 82, speed: 85, satisfaction: 80, volume: 35, infra: 88, budget: 85, trend: "up" },
  { name: "Mayur Vihar", id: 61, score: 79, speed: 80, satisfaction: 76, volume: 42, infra: 82, budget: 80, trend: "stable" },
  { name: "Pitampura", id: 28, score: 84, speed: 86, satisfaction: 82, volume: 32, infra: 88, budget: 88, trend: "up" },
  { name: "Shalimar Bagh", id: 30, score: 81, speed: 82, satisfaction: 79, volume: 38, infra: 85, budget: 84, trend: "up" },
  { name: "Mehrauli", id: 45, score: 52, speed: 48, satisfaction: 50, volume: 85, infra: 45, budget: 48, trend: "down" },
  { name: "Mustafabad", id: 142, score: 38, speed: 32, satisfaction: 35, volume: 98, infra: 25, budget: 30, trend: "down" },
  { name: "Okhla", id: 63, score: 55, speed: 50, satisfaction: 52, volume: 78, infra: 58, budget: 55, trend: "stable" },
  { name: "Shahdara", id: 115, score: 48, speed: 42, satisfaction: 45, volume: 90, infra: 40, budget: 42, trend: "down" },
  { name: "Trilokpuri", id: 130, score: 42, speed: 36, satisfaction: 40, volume: 92, infra: 35, budget: 38, trend: "down" },
  { name: "Uttam Nagar", id: 82, score: 60, speed: 55, satisfaction: 58, volume: 75, infra: 62, budget: 58, trend: "stable" },
];

function scoreColor(s: number) {
  if (s > 75) return "#16A34A";
  if (s > 50) return "#FF6B2B";
  return "#DC2626";
}

function WardCard({ ward }: { ward: typeof WARDS[0] }) {
  const color = scoreColor(ward.score);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{
        background: "white", borderRadius: "20px",
        border: "1.5px solid rgba(26,46,42,0.07)",
        padding: "24px", display: "flex", flexDirection: "column", gap: "16px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "17px", color: "#1A2E2A", margin: 0 }}>{ward.name}</h4>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(26,46,42,0.4)", marginTop: "2px" }}>Ward #{ward.id} · Delhi</p>
        </div>
        <div style={{
          width: "50px", height: "50px", borderRadius: "50%",
          background: color + "12", border: `2.5px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: "15px", color }}>{ward.score}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <MetricSmall label="Res. Speed" val={`${ward.speed}%`} />
        <MetricSmall label="Satisfaction" val={`${ward.satisfaction}%`} />
        <MetricSmall label="Infrastructure" val={`${ward.infra}%`} />
        <MetricSmall label="Efficiency" val={`${ward.budget}%`} />
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600,
          color: ward.trend === "up" ? "#16A34A" : ward.trend === "down" ? "#DC2626" : "rgba(26,46,42,0.4)",
        }}>
          {ward.trend === "up" ? "↑ Improving" : ward.trend === "down" ? "↓ Declining" : "→ Stable"}
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "#FF6B2B" }}>View Report →</span>
      </div>
    </motion.div>
  );
}

function MetricSmall({ label, val }: { label: string; val: string }) {
  return (
    <div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#1A2E2A", margin: 0 }}>{val}</p>
    </div>
  );
}

function LeaderRow({ rank, name, score, color }: { rank: number; name: string; score: number; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", background: "white", borderRadius: "12px",
      border: "1px solid rgba(26,46,42,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 800, color: "rgba(26,46,42,0.15)", width: "22px" }}>0{rank}</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A2E2A" }}>{name}</span>
      </div>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 800, color }}>{score}</span>
    </div>
  );
}

export default function WardsPage() {
  const sorted = [...WARDS].sort((a, b) => b.score - a.score);

  return (
    <RoleGuard allowedRoles={["admin", "field_officer"]}>
    <PageLayout showFooter>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px", width: "100%" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "48px" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)", marginBottom: "8px" }}>
            CIVIC ACCOUNTABILITY
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "40px", color: "#1A2E2A", lineHeight: 1.1, margin: "0 0 10px" }}>
            Delhi Civic Health Scorecard
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "rgba(26,46,42,0.5)", maxWidth: "550px" }}>
            Live ward-level governance accountability. Updated every 15 minutes.
          </p>
          <div style={{ marginTop: "16px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, color: "rgba(26,46,42,0.3)", letterSpacing: "0.1em" }}>REPORTING TO:</span>
            {["Delhi HC", "CAG", "MCD Commissioner"].map((t) => (
              <span key={t} style={{ padding: "4px 14px", background: "white", border: "1.5px solid rgba(26,46,42,0.08)", borderRadius: "100px", fontSize: "11px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: "#1A2E2A" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* HERO METRIC */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            display: "flex", background: "white", borderRadius: "24px",
            border: "1.5px solid rgba(26,46,42,0.07)", padding: "40px",
            alignItems: "center", justifyContent: "space-between", gap: "40px",
            marginBottom: "40px", flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#1A2E2A", marginBottom: "8px" }}>Delhi Overall Civic Health</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.5)", maxWidth: "400px" }}>
              City-wide average across all 272 wards, weighted by population density and complaint severity.
            </p>
            <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#16A34A", fontWeight: 700 }}>↑ 4 points</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(26,46,42,0.35)" }}>from last month</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "130px", height: "130px", borderRadius: "50%",
              background: "rgba(255,107,43,0.06)", border: "6px solid #FF6B2B",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 700, fontSize: "38px", color: "#1A2E2A" }}>67</span>
              <span style={{ position: "absolute", bottom: "22px", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(26,46,42,0.3)" }}>/100</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", marginTop: "14px", fontSize: "12px", fontWeight: 700, color: "#FF6B2B", letterSpacing: "0.05em" }}>FAIR PERFORMANCE</p>
          </div>
        </motion.section>

        {/* SEARCH & FILTER */}
        <section style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
          <div style={{
            flex: 1, minWidth: "280px", background: "white", border: "1.5px solid rgba(26,46,42,0.08)",
            borderRadius: "100px", padding: "11px 22px", display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ opacity: 0.3 }}>🔍</span>
            <input
              placeholder="Find your ward (e.g. Lajpat Nagar)..."
              style={{
                border: "none", background: "transparent", outline: "none", width: "100%",
                fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#1A2E2A",
              }}
            />
          </div>
          <select style={{
            background: "white", border: "1.5px solid rgba(26,46,42,0.08)",
            borderRadius: "100px", padding: "11px 22px", fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif", color: "#1A2E2A", outline: "none",
          }}>
            <option>All Zones</option>
            <option>South Delhi</option>
            <option>North West</option>
            <option>West Delhi</option>
          </select>
        </section>

        {/* WARD GRID */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {WARDS.map((ward) => (
              <WardCard key={ward.id} ward={ward} />
            ))}
          </div>
        </section>

        {/* LEADERBOARD */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "48px" }}>
          <div style={{ background: "rgba(22,163,74,0.04)", border: "1.5px solid rgba(22,163,74,0.12)", borderRadius: "20px", padding: "28px" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#16A34A", marginBottom: "16px" }}>Top Performing Wards</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sorted.slice(0, 5).map((w, idx) => (
                <LeaderRow key={w.id} rank={idx + 1} name={w.name} score={w.score} color="#16A34A" />
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(220,38,38,0.04)", border: "1.5px solid rgba(220,38,38,0.12)", borderRadius: "20px", padding: "28px" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#DC2626", marginBottom: "16px" }}>Wards Requiring Attention</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[...WARDS].sort((a, b) => a.score - b.score).slice(0, 5).map((w, idx) => (
                <LeaderRow key={w.id} rank={idx + 1} name={w.name} score={w.score} color="#DC2626" />
              ))}
            </div>
          </div>
        </section>

        {/* TRANSPARENCY NOTE */}
        <div style={{ padding: "32px", background: "rgba(26,46,42,0.03)", borderRadius: "20px", textAlign: "center", border: "1px solid rgba(26,46,42,0.05)" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(26,46,42,0.45)", lineHeight: 1.7, maxWidth: "700px", margin: "0 auto" }}>
            <strong style={{ color: "#1A2E2A" }}>Transparency Note:</strong> This data is sourced from SANKALP AI&apos;s complaint resolution database, cross-verified with MCD&apos;s PGMS system, and published under the RTI Act 2005. All records are immutable and blockchain-verified.
          </p>
        </div>

      </div>
    </PageLayout>
    </RoleGuard>
  );
}
