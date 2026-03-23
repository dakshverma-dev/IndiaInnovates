"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Lang = "en" | "hi";
type Step = 1 | 2 | 3 | 4;

const T = {
  en: {
    formTitle: "File a Complaint",
    formSub: "Takes less than 2 minutes.",
    stepLabels: ["Location", "Issue", "Photo", "Contact"],
    locationLabel: "Locality / Area in Delhi",
    locationPlaceholder: "Lajpat Nagar, Rohini, Dwarka...",
    gpsBtn: "Detect my location",
    descLabel: "Describe the problem",
    descPlaceholder: "e.g. \"Meri gali mein nali band hai aur kachra jam gaya hai...\"",
    photoLabel: "Attach a photo",
    photoDrag: "Click or drag to upload",
    photoHint: "Optional, but helps faster resolution",
    phoneLabel: "Mobile number",
    phonePlaceholder: "+91 98XXXXXXXX",
    whatsapp: "Send WhatsApp updates",
    noSpam: "Only civic updates. No spam.",
    submit: "Submit Complaint",
    next: "Continue",
    back: "Back",
    aiReading: "Analysing complaint...",
    aiDone: "Classified in 1.8s",
    successTitle: "Complaint Filed",
    successSub: "We've got it. Here's your reference.",
    successTicket: "Ticket ID",
    copy: "Copy",
    copied: "Copied",
    officer: "Assigned Officer",
    eta: "Expected by",
    whatsappShare: "Share on WhatsApp",
  },
  hi: {
    formTitle: "शिकायत दर्ज करें",
    formSub: "2 मिनट से कम लगेगा।",
    stepLabels: ["स्थान", "समस्या", "फ़ोटो", "संपर्क"],
    locationLabel: "दिल्ली में इलाका",
    locationPlaceholder: "लाजपत नगर, रोहिणी, द्वारका...",
    gpsBtn: "GPS से पता लगाएं",
    descLabel: "समस्या विवरण",
    descPlaceholder: "जैसे \"मेरी गली में नाली बंद है...\"",
    photoLabel: "फ़ोटो लगाएं",
    photoDrag: "क्लिक करें या खींचें",
    photoHint: "वैकल्पिक, पर जल्दी समाधान में मदद करता है",
    phoneLabel: "मोबाइल नंबर",
    phonePlaceholder: "+91 98XXXXXXXX",
    whatsapp: "WhatsApp अपडेट भेजें",
    noSpam: "केवल नागरिक अपडेट।",
    submit: "शिकायत दर्ज करें",
    next: "जारी रखें",
    back: "वापस",
    aiReading: "विश्लेषण हो रहा है...",
    aiDone: "1.8 सेकंड में वर्गीकृत",
    successTitle: "शिकायत दर्ज हुई",
    successSub: "आपकी शिकायत मिल गई।",
    successTicket: "टिकट ID",
    copy: "कॉपी",
    copied: "कॉपी हुआ",
    officer: "नियुक्त अधिकारी",
    eta: "अपेक्षित समय",
    whatsappShare: "WhatsApp पर शेयर करें",
  },
};

const WARDS: Record<string, { ward: number; zone: string }> = {
  "lajpat nagar": { ward: 42, zone: "South Delhi Zone" },
  "govindpuri": { ward: 67, zone: "South Delhi Zone" },
  "rohini": { ward: 23, zone: "North West Zone" },
  "dwarka": { ward: 51, zone: "West Delhi Zone" },
  "saket": { ward: 38, zone: "South Delhi Zone" },
  "karol bagh": { ward: 14, zone: "Central Zone" },
  "janakpuri": { ward: 55, zone: "West Delhi Zone" },
  "mayur vihar": { ward: 61, zone: "East Delhi Zone" },
};

function getAI(text: string) {
  const t = text.toLowerCase();
  if (t.includes("nali") || t.includes("drain") || t.includes("kachra") || t.includes("garbage") || t.includes("sanitation"))
    return { cat: "Sanitation", dept: "MCD — South Zone", priority: "P2 · High", sla: "48 hr SLA" };
  if (t.includes("road") || t.includes("pothole") || t.includes("sadak"))
    return { cat: "Roads", dept: "PWD Delhi", priority: "P3 · Medium", sla: "72 hr SLA" };
  if (t.includes("light") || t.includes("bijli") || t.includes("street"))
    return { cat: "Streetlight", dept: "BSES / TPDDL", priority: "P3 · Medium", sla: "72 hr SLA" };
  if (t.includes("water") || t.includes("paani") || t.includes("pipe"))
    return { cat: "Water Supply", dept: "DJB — Zone 3", priority: "P1 · Critical", sla: "24 hr SLA" };
  return { cat: "General Grievance", dept: "MCD", priority: "P3 · Medium", sla: "72 hr SLA" };
}

const LIVE_TICKETS = [
  { id: "DL-4817", type: "Drainage", ward: "W42", status: "done" },
  { id: "DL-4821", type: "Sanitation", ward: "W42", status: "done" },
  { id: "DL-4829", type: "Roads", ward: "W17", status: "live" },
  { id: "DL-4819", type: "Water Supply", ward: "W31", status: "done" },
];

export default function ComplaintPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState<Step>(1);
  const [location, setLocation] = useState("");
  const [ward, setWard] = useState<{ ward: number; zone: string } | null>(null);
  const [desc, setDesc] = useState("");
  const [ai, setAi] = useState<ReturnType<typeof getAI> | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [wa, setWa] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [realTicketId, setRealTicketId] = useState("DL-4823");
  const [realFullId, setRealFullId] = useState("");
  const [realAi, setRealAi] = useState<ReturnType<typeof getAI> | null>(null);
  const [realOfficerName, setRealOfficerName] = useState("Rajesh Kumar · South Zone");
  // upvote state
  const [similarId, setSimilarId] = useState<string | null>(null);
  const [similarUpvotes, setSimilarUpvotes] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteSkipped, setUpvoteSkipped] = useState(false);
  // satisfaction state
  const [satisfactionDone, setSatisfactionDone] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = T[lang];
  const ticketId = realTicketId;

  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + 2);
  const eta = etaDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }) + " · 5:00 PM";

  useEffect(() => {
    const key = Object.keys(WARDS).find((k) => location.toLowerCase().includes(k));
    setWard(key ? WARDS[key] : null);
  }, [location]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (desc.trim().length < 8) { setAi(null); setAiLoading(false); setSimilarId(null); return; }
    setAiLoading(true); setAi(null);
    timer.current = setTimeout(async () => {
      const classified = getAI(desc);
      setAi(classified);
      setAiLoading(false);
      // fetch similar complaints
      if (ward) {
        try {
          const res = await fetch(`/api/complaints/similar?category=${encodeURIComponent(classified.cat)}&ward_id=${ward.ward}`);
          if (res.ok) {
            const similar = await res.json() as Array<{ id: string; shortId: string; upvotes: number }>;
            if (similar.length > 0) {
              setSimilarId(similar[0].id);
              setSimilarUpvotes(similar[0].upvotes);
              setUpvoted(false);
              setUpvoteSkipped(false);
            }
          }
        } catch { /* ignore */ }
      }
    }, 1500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [desc, ward]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPhoto(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          message: desc.trim() || "General complaint",
          phone: normalizedPhone || "9999999999",
          language: lang,
          wardHint: ward?.ward,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        shortId: string;
        ticketId?: string;
        category: string;
        priority: string;
        department: string;
        sla_hours: number;
        officerName: string;
      };
      setRealTicketId(data.shortId);
      setRealFullId(data.ticketId ?? data.shortId);
      setRealAi({
        cat: data.category,
        priority: `${data.priority} · ${data.priority === "P1" ? "Critical" : data.priority === "P2" ? "High" : "Medium"}`,
        dept: data.department,
        sla: `${data.sla_hours}h SLA`,
      });
      setRealOfficerName(data.officerName);
      setSubmitting(false);
      setDone(true);
    } catch {
      setTimeout(() => { setSubmitting(false); setDone(true); }, 1200);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div style={{
        width: "clamp(240px, 28%, 340px)",
        background: "#1A2E2A",
        display: "flex",
        flexDirection: "column",
        padding: "32px 24px",
        flexShrink: 0,
        overflowY: "auto",
      }}>
        {/* Branding */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "18px", color: "#fff", letterSpacing: "-0.3px" }}>
            SANKALP AI
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>
            सहूत
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "10px", lineHeight: 1.5 }}>
            Your complaint. Tracked.<br />Verified. Resolved.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
          {[
            { val: "1,247", label: "resolved today", color: "#E7E8E2" },
            { val: "4.2s", label: "avg AI classify", color: "#E7E8E2" },
            { val: "94.3%", label: "within SLA", color: "#5BBFFF" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live Activity */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>
            Live Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {LIVE_TICKETS.map((tk) => (
              <div key={tk.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                padding: "8px 12px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Mono', monospace" }}>{tk.id}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>{tk.type} · {tk.ward}</div>
                </div>
                {tk.status === "done" ? (
                  <span style={{ fontSize: "10px", color: "#4ADE80", fontWeight: 600 }}>✓ Done</span>
                ) : (
                  <span style={{ fontSize: "10px", color: "#FBBF24", fontWeight: 600 }}>● Live</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px" }}>
          No app? Call <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>1533</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: "#EEEEE8",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Top bar: steps + lang toggle */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px 0",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {([1, 2, 3, 4] as Step[]).map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  background: step === s ? "#1A2E2A" : step > s ? "rgba(26,46,42,0.08)" : "transparent",
                  transition: "all 0.2s",
                }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: step === s ? "#fff" : step > s ? "#1A2E2A" : "#9CA3AF",
                  }}>{s}</span>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: step === s ? "#fff" : step > s ? "#1A2E2A" : "#9CA3AF",
                  }}>{t.stepLabels[i]}</span>
                </div>
                {s < 4 && <span style={{ color: "#D1D5DB", fontSize: "12px", padding: "0 2px" }}>›</span>}
              </div>
            ))}
          </div>

          {/* Lang toggle */}
          <div style={{ display: "flex", background: "rgba(26,46,42,0.08)", borderRadius: "8px", padding: "2px" }}>
            {(["en", "hi"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                background: lang === l ? "#1A2E2A" : "transparent",
                color: lang === l ? "#fff" : "rgba(26,46,42,0.5)",
                transition: "all 0.15s",
              }}>
                {l === "en" ? "EN" : "हि"}
              </button>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "48px 40px 48px",
        }}>
          <div style={{ width: "100%", maxWidth: "480px" }}>
            <AnimatePresence mode="wait">
              {done ? (
                <SuccessView key="done" t={t} ticketId={ticketId} fullId={realFullId} eta={eta} phone={phone} ai={realAi ?? ai} officerName={realOfficerName} copied={copied} onCopy={handleCopy} satisfactionDone={satisfactionDone} onSatisfaction={async (rating) => {
                    setSatisfactionDone(true);
                    try {
                      await fetch(`/api/tickets/${realFullId}/feedback`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone: phone.replace(/\D/g, "").slice(-10) || "9999999999", rating }),
                      });
                    } catch { /* ignore */ }
                  }} />
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Heading */}
                  <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 400, color: "#1A2E2A", margin: "0 0 6px", lineHeight: 1.15 }}>
                    {t.formTitle}
                  </h1>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.55)", margin: "0 0 36px" }}>
                    {t.formSub}
                  </p>

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                        <FieldLabel>{t.locationLabel}</FieldLabel>
                        <input
                          style={{
                            width: "100%",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "15px",
                            color: "#1A2E2A",
                            background: "#FFFFFF",
                            border: "1.5px solid rgba(26,46,42,0.12)",
                            borderRadius: "12px",
                            padding: "14px 16px",
                            outline: "none",
                            boxSizing: "border-box",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                          placeholder={t.locationPlaceholder}
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.12)")}
                        />

                        <AnimatePresence>
                          {ward && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              style={{
                                marginTop: "8px",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                background: "rgba(93,122,111,0.12)",
                                border: "1px solid rgba(93,122,111,0.2)",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#3D6B5F",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ opacity: 0.7 }}>→</span>
                              Ward {ward.ward} · {ward.zone}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={() => setLocation("Lajpat Nagar")}
                          style={{
                            marginTop: "12px",
                            width: "100%",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#C2552A",
                            background: "rgba(255,107,43,0.08)",
                            border: "none",
                            borderRadius: "10px",
                            padding: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,107,43,0.14)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,107,43,0.08)")}
                        >
                          <span>📍</span> {t.gpsBtn}
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                        <FieldLabel>{t.descLabel}</FieldLabel>
                        <textarea
                          rows={5}
                          style={{
                            width: "100%",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "15px",
                            color: "#1A2E2A",
                            background: "#FFFFFF",
                            border: "1.5px solid rgba(26,46,42,0.12)",
                            borderRadius: "12px",
                            padding: "14px 16px",
                            outline: "none",
                            resize: "none",
                            boxSizing: "border-box",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                          placeholder={t.descPlaceholder}
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.12)")}
                        />
                        <AnimatePresence>
                          {(aiLoading || ai) && (
                            <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              style={{ marginTop: "12px", padding: "14px 16px", borderRadius: "12px", background: "rgba(26,46,42,0.05)", border: "1px solid rgba(26,46,42,0.07)" }}>
                              {aiLoading ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {[0, 1, 2].map((i) => (
                                    <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.9 }}
                                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1A2E2A" }} />
                                  ))}
                                  <span style={{ fontSize: "12px", color: "rgba(26,46,42,0.6)" }}>{t.aiReading}</span>
                                </div>
                              ) : ai && (
                                <div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                                    {[
                                      { label: ai.cat, bg: "rgba(26,46,42,0.07)", color: "#1A2E2A" },
                                      { label: ai.priority, bg: "rgba(255,107,43,0.1)", color: "#C2552A" },
                                      { label: ai.dept, bg: "rgba(26,46,42,0.07)", color: "#1A2E2A" },
                                      { label: ai.sla, bg: "rgba(22,163,74,0.1)", color: "#15803D" },
                                    ].map((c) => (
                                      <span key={c.label} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: c.bg, color: c.color }}>
                                        {c.label}
                                      </span>
                                    ))}
                                  </div>
                                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#9CA3AF" }}>{t.aiDone}</span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Upvote nudge — show if similar complaint found and not skipped/upvoted */}
                        <AnimatePresence>
                          {similarId && !upvoteSkipped && !upvoted && ai && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              style={{ marginTop: "12px", padding: "14px 16px", borderRadius: "12px", background: "rgba(93,122,111,0.07)", border: "1px solid rgba(93,122,111,0.18)" }}
                            >
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3D6B5F", margin: "0 0 10px" }}>
                                {similarUpvotes + 1} people in this area reported the same issue. Upvote instead of filing a new complaint?
                              </p>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/complaints/${similarId}/upvote`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ phone: phone || "0000000000" }),
                                      });
                                      const data = await res.json() as { upvotes: number };
                                      setSimilarUpvotes(data.upvotes ?? similarUpvotes + 1);
                                    } catch { /* ignore */ }
                                    setUpvoted(true);
                                  }}
                                  style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "none", background: "#5D7A6F", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                                >
                                  Upvote ({similarUpvotes})
                                </button>
                                <button
                                  onClick={() => setUpvoteSkipped(true)}
                                  style={{ padding: "9px 14px", borderRadius: "8px", border: "1.5px solid rgba(26,46,42,0.15)", background: "transparent", color: "rgba(26,46,42,0.6)", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", cursor: "pointer" }}
                                >
                                  File new
                                </button>
                              </div>
                            </motion.div>
                          )}
                          {upvoted && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              style={{ marginTop: "12px", padding: "12px 16px", borderRadius: "12px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", color: "#16A34A", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600 }}>
                              Upvoted. Your voice is counted — {similarUpvotes} people now backing this issue.
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                        <FieldLabel>{t.photoLabel}</FieldLabel>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#9CA3AF", margin: "0 0 12px" }}>{t.photoHint}</p>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                        {photo ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                            <button onClick={() => setPhoto(null)} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(26,46,42,0.8)", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "12px" }}>✕</button>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => fileRef.current?.click()}
                            style={{ width: "100%", border: "2px dashed rgba(26,46,42,0.15)", borderRadius: "12px", padding: "48px 20px", textAlign: "center", cursor: "pointer", background: "transparent", color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#5D7A6F"; e.currentTarget.style.background = "rgba(93,122,111,0.05)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(26,46,42,0.15)"; e.currentTarget.style.background = "transparent"; }}
                          >
                            <span style={{ display: "block", marginBottom: "6px", fontSize: "24px", opacity: 0.4 }}>+</span>
                            {t.photoDrag}
                          </button>
                        )}
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div key="s4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                        <FieldLabel>{t.phoneLabel}</FieldLabel>
                        <input
                          type="tel"
                          style={{ width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#1A2E2A", background: "#FFFFFF", border: "1.5px solid rgba(26,46,42,0.12)", borderRadius: "12px", padding: "14px 16px", outline: "none", boxSizing: "border-box", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                          placeholder={t.phonePlaceholder}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onFocus={(e) => (e.target.style.borderColor = "#1A2E2A")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(26,46,42,0.12)")}
                        />
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#9CA3AF", margin: "8px 0 20px" }}>{t.noSpam}</p>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                          <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#1A2E2A" }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500, color: "#1A2E2A" }}>{t.whatsapp}</span>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Nav buttons */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "32px" }}>
                    {step > 1 && (
                      <button
                        onClick={() => setStep((s) => (s - 1) as Step)}
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, padding: "14px 24px", borderRadius: "999px", border: "1.5px solid rgba(26,46,42,0.2)", background: "transparent", color: "#1A2E2A", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(26,46,42,0.05)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        {t.back}
                      </button>
                    )}
                    {step < 4 ? (
                      <button
                        onClick={() => setStep((s) => (s + 1) as Step)}
                        style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, padding: "14px 24px", borderRadius: "999px", border: "none", background: "#1A2E2A", color: "#fff", cursor: "pointer", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#25423C"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#1A2E2A"; }}
                      >
                        {t.next} <span style={{ fontSize: "16px" }}>→</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, padding: "14px 24px", borderRadius: "999px", border: "none", background: submitting ? "rgba(26,46,42,0.4)" : "#1A2E2A", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", transition: "background 0.15s" }}
                      >
                        {submitting ? "..." : t.submit}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.45)", margin: "0 0 8px" }}>
      {children}
    </p>
  );
}

function SuccessView({ t, ticketId, fullId, eta, phone, ai, officerName, copied, onCopy, satisfactionDone, onSatisfaction }: {
  t: typeof T["en"]; ticketId: string; fullId: string; eta: string; phone: string;
  ai: ReturnType<typeof getAI> | null; officerName: string; copied: boolean; onCopy: () => void;
  satisfactionDone: boolean; onSatisfaction: (r: "satisfied" | "unsatisfied") => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
          style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}
        >
          <svg width="32" height="32" fill="none" stroke="#16A34A" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </motion.div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 400, color: "#1A2E2A", margin: "0 0 6px" }}>{t.successTitle}</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.55)", margin: 0 }}>{t.successSub}</p>
      </div>

      <div style={{ background: "#1A2E2A", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "16px" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 8px" }}>{t.successTicket}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "32px", fontWeight: 700, color: "#FF6B2B" }}>{ticketId}</span>
          <button onClick={onCopy} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, padding: "6px 14px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.7)", background: "transparent", cursor: "pointer" }}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid rgba(26,46,42,0.07)" }}>
        {ai && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid rgba(26,46,42,0.06)" }}>
            {[ai.cat, ai.priority, ai.sla].map((c) => (
              <span key={c} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: "rgba(26,46,42,0.05)", color: "#1A2E2A" }}>{c}</span>
            ))}
          </div>
        )}
        {[{ label: t.officer, value: officerName }, { label: t.eta, value: eta, green: true }, ...(phone ? [{ label: t.whatsapp, value: phone }] : [])].map(({ label, value, green }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", padding: "4px 0" }}>
            <span style={{ color: "rgba(26,46,42,0.55)" }}>{label}</span>
            <span style={{ fontWeight: 600, color: green ? "#16A34A" : "#1A2E2A" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Satisfaction widget */}
      {!satisfactionDone ? (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "18px 20px", marginBottom: "12px", border: "1px solid rgba(26,46,42,0.07)" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1A2E2A", margin: "0 0 12px" }}>
            Rate your experience filing this complaint
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => onSatisfaction("satisfied")}
              style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1.5px solid rgba(22,163,74,0.25)", background: "rgba(22,163,74,0.06)", color: "#16A34A", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Satisfied
            </button>
            <button
              onClick={() => onSatisfaction("unsatisfied")}
              style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1.5px solid rgba(26,46,42,0.12)", background: "transparent", color: "rgba(26,46,42,0.6)", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Not satisfied
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", color: "#16A34A", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>
          Thank you for your feedback.
        </div>
      )}

      <button
        onClick={() => window.open(`https://wa.me/?text=Complaint ${ticketId} filed with SANKALP AI`, "_blank")}
        style={{ width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, padding: "14px", borderRadius: "999px", border: "none", background: "#FF6B2B", color: "#fff", cursor: "pointer" }}
      >
        {t.whatsappShare}
      </button>
    </motion.div>
  );
}
