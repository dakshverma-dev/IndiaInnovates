"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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

function WardCard({ ward }: { ward: typeof WARDS[0] }) {
  const color = ward.score > 75 ? "#16A34A" : ward.score > 50 ? "#F59E0B" : "#DC2626";
  
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
      style={{
        background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "16px",
        padding: "20px", display: "flex", flexDirection: "column", gap: "16px",
        cursor: "pointer"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h4 style={{ fontFamily: "Sora", fontSize: "16px", fontWeight: 700, margin: 0 }}>{ward.name}</h4>
          <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)", marginTop: "2px" }}>Ward #{ward.id} · Delhi</p>
        </div>
        <div style={{ 
          width: "48px", height: "48px", borderRadius: "50%", border: `3px solid ${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative"
        }}>
          <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "14px", color: color }}>{ward.score}</span>
          {/* Simple SVG circle for progress would be better but keeping it text-based for now */}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <MetricSmall label="Res. Speed" val={`${ward.speed}%`} />
        <MetricSmall label="Satisfaction" val={`${ward.satisfaction}%`} />
        <MetricSmall label="Infrastructure" val={`${ward.infra}%`} />
        <MetricSmall label="Efficiency" val={`${ward.budget}%`} />
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.3)" }}>
          {ward.trend === "up" ? "↑ Improving" : ward.trend === "down" ? "↓ Declining" : "→ Stable"}
        </div>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#0F2D5E" }}>Report →</span>
      </div>
    </motion.div>
  );
}

function MetricSmall({ label, val }: { label: string; val: string }) {
  return (
    <div>
      <p style={{ fontSize: "10px", color: "rgba(0,0,0,0.4)", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: "12px", fontWeight: 700, margin: 0 }}>{val}</p>
    </div>
  );
}

export default function WardsPage() {
  const [filter, setFilter] = useState("All");

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FC", color: "#0A0F1E", fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <header style={{ padding: "60px 24px 40px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Sora", fontSize: "40px", fontWeight: 700, margin: 0 }}>Delhi Civic Health Scorecard</h1>
        <p style={{ fontSize: "16px", color: "rgba(10,15,30,0.5)", marginTop: "8px" }}>Live ward-level governance accountability. Updated every 15 minutes.</p>
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.3)" }}>REPORTING TO:</span>
          <span style={{ padding: "4px 12px", background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "100px", fontSize: "11px", fontWeight: 600 }}>Delhi HC</span>
          <span style={{ padding: "4px 12px", background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "100px", fontSize: "11px", fontWeight: 600 }}>CAG</span>
          <span style={{ padding: "4px 12px", background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "100px", fontSize: "11px", fontWeight: 600 }}>MCD Commissioner</span>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: "48px" }}>
        
        {/* HERO METRIC */}
        <section style={{ display: "flex", background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "32px", padding: "40px", alignItems: "center", justifyContent: "space-between", gap: "40px" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Delhi Overall Civic Health</h2>
            <p style={{ fontSize: "15px", color: "rgba(0,0,0,0.5)", maxWidth: "400px" }}>The city-wide average across all 272 wards, weighted by population density and complaint severity.</p>
            <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#16A34A", fontWeight: 700 }}>↑ 4 points</span>
              <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.3)" }}>from last month</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "140px", height: "140px", borderRadius: "50%", background: "#FDF4FF", border: "8px solid #F59E0B",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
            }}>
              <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "40px", color: "#0A0F1E" }}>67</span>
              <span style={{ position: "absolute", bottom: "24px", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.3)" }}>/100</span>
            </div>
            <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: 700, color: "#F59E0B" }}>FAIR PERFORMANCE</p>
          </div>
        </section>

        {/* SEARCH & FILTER */}
        <section style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ 
            flex: 1, minWidth: "300px", background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "100px",
            padding: "10px 24px", display: "flex", alignItems: "center", gap: "12px"
          }}>
            <span style={{ opacity: 0.3 }}>🔍</span>
            <input 
              placeholder="Find your ward (e.g. Lajpat Nagar)..." 
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px" }}
            />
          </div>
          <select style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "100px", padding: "10px 24px", fontSize: "14px", outline: "none" }}>
            <option>All Zones</option>
            <option>South Delhi</option>
            <option>North West</option>
            <option>West Delhi</option>
          </select>
        </section>

        {/* WARD GRID */}
        <section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {WARDS.map((ward) => (
              <WardCard key={ward.id} ward={ward} />
            ))}
          </div>
        </section>

        {/* LEADERBOARD */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "24px", padding: "32px" }}>
             <h3 style={{ fontFamily: "Sora", fontSize: "18px", fontWeight: 700, color: "#16A34A", marginBottom: "20px" }}>Top Performing Wards</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
               {WARDS.sort((a,b) => b.score - a.score).slice(0, 5).map((w, idx) => (
                 <LeaderRow key={w.id} rank={idx+1} name={w.name} score={w.score} color="#16A34A" />
               ))}
             </div>
          </div>
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "24px", padding: "32px" }}>
             <h3 style={{ fontFamily: "Sora", fontSize: "18px", fontWeight: 700, color: "#DC2626", marginBottom: "20px" }}>Wards Requiring Attention</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {WARDS.sort((a,b) => a.score - b.score).slice(0, 5).map((w, idx) => (
                 <LeaderRow key={w.id} rank={idx+1} name={w.name} score={w.score} color="#DC2626" />
               ))}
             </div>
          </div>
        </section>

        {/* TRANSPARENCY NOTE */}
        <footer style={{ padding: "40px", background: "rgba(0,0,0,0.03)", borderRadius: "24px", textAlign: "center" }}>
           <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.6, maxWidth: "800px", margin: "0 auto" }}>
             <strong>Transparency Note:</strong> This data is sourced from SANKALP AI's complaint resolution database, cross-verified with MCD's PGMS system, and published under the RTI Act 2005. All records are immutable and blockchain-verified for public auditing.
           </p>
        </footer>

      </main>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); borderRadius: 10px; }
      `}</style>
    </div>
  );
}

function LeaderRow({ rank, name, score, color }: { rank: number; name: string; score: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#FFF", borderRadius: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.15)", width: "20px" }}>0{rank}</span>
        <span style={{ fontSize: "14px", fontWeight: 600 }}>{name}</span>
      </div>
      <span style={{ fontSize: "14px", fontWeight: 800, color: color }}>{score}</span>
    </div>
  );
}
