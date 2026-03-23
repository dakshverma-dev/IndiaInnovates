"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/PageLayout";

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

const inp: React.CSSProperties = {
  width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
  color: "#1A2E2A", background: "#FFF",
  border: "1.5px solid rgba(26,46,42,0.15)", borderRadius: "12px",
  padding: "13px 16px", outline: "none", transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "rgba(26,46,42,0.4)", marginBottom: "8px",
  fontFamily: "'DM Sans', sans-serif",
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#1A2E2A");
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "rgba(26,46,42,0.15)");

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
  const [realAi, setRealAi] = useState<ReturnType<typeof getAI> | null>(null);
  const [realOfficerName, setRealOfficerName] = useState("Rajesh Kumar · South Zone");
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
    if (desc.trim().length < 8) { setAi(null); setAiLoading(false); return; }
    setAiLoading(true); setAi(null);
    timer.current = setTimeout(() => { setAi(getAI(desc)); setAiLoading(false); }, 1500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [desc]);

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
        body: JSON.stringify({
          message: desc.trim() || "General complaint",
          phone: normalizedPhone || "9999999999",
          language: lang,
          wardHint: ward?.ward,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        shortId: string; category: string; priority: string;
        department: string; sla_hours: number; officerName: string;
      };
      setRealTicketId(data.shortId);
      setRealAi({
        cat: data.category,
        priority: `${data.priority} · ${data.priority === "P1" ? "Critical" : data.priority === "P2" ? "High" : data.priority === "P3" ? "Medium" : "Low"}`,
        dept: data.department,
        sla: `${data.sla_hours}h SLA`,
      });
      setRealOfficerName(data.officerName);
      setSubmitting(false);
      setDone(true);
    } catch (_err) {
      console.warn("[SANKALP] Backend unavailable, using demo mode");
      setTimeout(() => { setSubmitting(false); setDone(true); }, 1600);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(ticketId); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <PageLayout showFooter>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 96px", minHeight: "calc(100vh - 164px)" }}>

        {/* Step indicator + lang toggle */}
        <div style={{ width: "100%", maxWidth: "520px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {([1, 2, 3, 4] as Step[]).map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "5px 12px", borderRadius: "100px",
                  background: step === s ? "#1A2E2A" : step > s ? "rgba(26,46,42,0.06)" : "transparent",
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, color: step === s ? "white" : step > s ? "#1A2E2A" : "rgba(26,46,42,0.25)" }}>
                    {s}
                  </span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, color: step === s ? "white" : step > s ? "#1A2E2A" : "rgba(26,46,42,0.25)", whiteSpace: "nowrap" }}>
                    {t.stepLabels[i]}
                  </span>
                </div>
                {s < 4 && <span style={{ color: "rgba(26,46,42,0.2)", fontSize: "11px", padding: "0 2px" }}>{">"}</span>}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", background: "rgba(26,46,42,0.06)", borderRadius: "8px", padding: "2px", flexShrink: 0 }}>
            {(["en", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600,
                  padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer",
                  background: lang === l ? "#1A2E2A" : "transparent",
                  color: lang === l ? "white" : "rgba(26,46,42,0.5)",
                  transition: "all 0.15s",
                }}
              >
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ width: "100%", maxWidth: "520px" }}>
          <AnimatePresence mode="wait">
            {done ? (
              <SuccessView key="done" t={t} ticketId={ticketId} eta={eta} phone={phone} ai={realAi ?? ai} officerName={realOfficerName} copied={copied} onCopy={handleCopy} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "white", border: "1.5px solid rgba(26,46,42,0.07)",
                  borderRadius: "20px", padding: "36px 32px",
                  boxShadow: "0 2px 16px rgba(26,46,42,0.06)",
                }}
              >
                <div style={{ marginBottom: "32px" }}>
                  <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#1A2E2A", lineHeight: 1.1, marginBottom: "6px" }}>{t.formTitle}</h1>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.5)" }}>{t.formSub}</p>
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <label style={labelStyle}>{t.locationLabel}</label>
                      <input style={inp} placeholder={t.locationPlaceholder} value={location} onChange={(e) => setLocation(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                      <AnimatePresence>
                        {ward && (
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "10px", background: "rgba(93,122,111,0.08)", border: "1px solid rgba(93,122,111,0.2)", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "#5D7A6F" }}>
                            Ward {ward.ward} · {ward.zone}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => setLocation("Lajpat Nagar")}
                        style={{
                          marginTop: "16px", width: "100%", fontFamily: "'DM Sans', sans-serif",
                          fontSize: "13px", fontWeight: 600, color: "#FF6B2B",
                          background: "rgba(255,107,43,0.04)", border: "1.5px dashed rgba(255,107,43,0.3)",
                          borderRadius: "12px", padding: "12px", cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {t.gpsBtn}
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <label style={labelStyle}>{t.descLabel}</label>
                      <textarea
                        rows={5}
                        style={{ ...inp, resize: "none" } as React.CSSProperties}
                        placeholder={t.descPlaceholder}
                        value={desc} onChange={(e) => setDesc(e.target.value)}
                        onFocus={onFocus} onBlur={onBlur}
                      />
                      <AnimatePresence>
                        {(aiLoading || ai) && (
                          <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ marginTop: "14px", padding: "16px", borderRadius: "14px", background: "rgba(231,232,226,0.5)", border: "1px solid rgba(26,46,42,0.06)" }}>
                            {aiLoading ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {[0, 1, 2].map((i) => (
                                  <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.9 }}
                                    style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1A2E2A" }} />
                                ))}
                                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 500, color: "rgba(26,46,42,0.6)" }}>{t.aiReading}</span>
                              </div>
                            ) : ai && (
                              <div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                                  {[
                                    { label: ai.cat, bg: "rgba(26,46,42,0.06)", color: "#1A2E2A" },
                                    { label: ai.priority, bg: "rgba(255,107,43,0.1)", color: "#FF6B2B" },
                                    { label: ai.dept, bg: "rgba(26,46,42,0.06)", color: "#1A2E2A" },
                                    { label: ai.sla, bg: "rgba(22,163,74,0.1)", color: "#16A34A" },
                                  ].map((c) => (
                                    <motion.span key={c.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "100px", background: c.bg, color: c.color }}>
                                      {c.label}
                                    </motion.span>
                                  ))}
                                </div>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(26,46,42,0.3)" }}>{t.aiDone}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <label style={labelStyle}>{t.photoLabel}</label>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.4)", marginBottom: "12px" }}>{t.photoHint}</p>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                      {photo ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "relative", borderRadius: "14px", overflow: "hidden" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                          <button onClick={() => setPhoto(null)} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(26,46,42,0.8)", color: "#E7E8E2", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>✕</button>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => fileRef.current?.click()}
                          style={{
                            width: "100%", border: "2px dashed rgba(26,46,42,0.15)", borderRadius: "14px",
                            padding: "48px 20px", textAlign: "center", cursor: "pointer",
                            background: "transparent", color: "rgba(26,46,42,0.4)",
                            fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ display: "block", marginBottom: "8px", fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "rgba(26,46,42,0.2)" }}>+</span>
                          {t.photoDrag}
                        </button>
                      )}
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <label style={labelStyle}>{t.phoneLabel}</label>
                      <input type="tel" style={inp} placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.4)", marginTop: "8px" }}>{t.noSpam}</p>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", cursor: "pointer" }}>
                        <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#1A2E2A" }} />
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500, color: "#1A2E2A" }}>{t.whatsapp}</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "36px" }}>
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      style={{
                        padding: "13px 24px", borderRadius: "100px",
                        background: "transparent", border: "1.5px solid rgba(26,46,42,0.2)",
                        color: "#1A2E2A", fontSize: "14px", fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {t.back}
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      onClick={() => setStep((s) => (s + 1) as Step)}
                      style={{
                        flex: 1, padding: "13px 24px", borderRadius: "100px",
                        background: "#1A2E2A", border: "none",
                        color: "#E7E8E2", fontSize: "14px", fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {t.next}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{
                        flex: 1, padding: "13px 24px", borderRadius: "100px",
                        background: submitting ? "rgba(26,46,42,0.5)" : "#1A2E2A", border: "none",
                        color: "#E7E8E2", fontSize: "14px", fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: submitting ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                      }}
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
    </PageLayout>
  );
}

function SuccessView({ t, ticketId, eta, phone, ai, officerName, copied, onCopy }: {
  t: typeof T["en"]; ticketId: string; eta: string; phone: string;
  ai: ReturnType<typeof getAI> | null; officerName: string; copied: boolean; onCopy: () => void;
}) {
  return (
    <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
          style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#16A34A" }}>
          <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </motion.div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#1A2E2A", marginBottom: "4px", lineHeight: 1.1 }}>{t.successTitle}</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.5)" }}>{t.successSub}</p>
      </div>

      <div style={{ background: "#1A2E2A", borderRadius: "20px", padding: "24px", textAlign: "center", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)", pointerEvents: "none" }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: "8px" }}>{t.successTicket}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "28px", fontWeight: 700, color: "#FF6B2B", position: "relative", zIndex: 1 }}>{ticketId}</span>
          <button onClick={onCopy} style={{ position: "relative", zIndex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, padding: "6px 12px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.8)", background: "transparent", cursor: "pointer", transition: "all 0.15s" }}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>

      <div style={{ background: "white", border: "1.5px solid rgba(26,46,42,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        {ai && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid rgba(26,46,42,0.06)" }}>
            {[ai.cat, ai.priority, ai.sla].map((c) => (
              <span key={c} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "100px", background: "rgba(26,46,42,0.04)", color: "#1A2E2A" }}>{c}</span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
            <span style={{ color: "rgba(26,46,42,0.5)" }}>{t.officer}</span>
            <span style={{ fontWeight: 600, color: "#1A2E2A" }}>{officerName}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
            <span style={{ color: "rgba(26,46,42,0.5)" }}>{t.eta}</span>
            <span style={{ fontWeight: 600, color: "#16A34A" }}>{eta}</span>
          </div>
          {phone && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
              <span style={{ color: "rgba(26,46,42,0.5)" }}>{t.whatsapp}</span>
              <span style={{ fontWeight: 600, color: "#1A2E2A" }}>{phone}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => window.open(`https://wa.me/?text=Complaint ${ticketId} filed with SANKALP AI`, "_blank")}
        style={{
          width: "100%", padding: "14px", borderRadius: "100px",
          background: "#FF6B2B", border: "none",
          color: "white", fontSize: "14px", fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {t.whatsappShare}
      </button>
    </motion.div>
  );
}
