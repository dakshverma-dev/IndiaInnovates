import { config } from "../config";

export interface ClassificationResult {
  category: string;
  priority: "P1" | "P2" | "P3" | "P4";
  ward_id: number;
  summary: string;
  department: string;
  sla_hours: number;
}

// ─── Local keyword classifier (fallback when no GEMINI_API_KEY) ───────────────

function classifyLocally(message: string, wardHint?: number): ClassificationResult {
  const t = message.toLowerCase();
  let category = "General Grievance";
  let priority: ClassificationResult["priority"] = "P3";
  let department = "MCD Delhi";
  let sla_hours = 72;

  if (
    t.includes("nali") || t.includes("naali") || t.includes("drain") ||
    t.includes("sewage") || t.includes("overflow")
  ) {
    category = "Drainage"; priority = "P2"; department = "MCD - Sanitation Wing"; sla_hours = 48;
  } else if (
    t.includes("kachra") || t.includes("garbage") || t.includes("waste") ||
    t.includes("safai") || t.includes("sweeping")
  ) {
    category = "Sanitation"; priority = "P2"; department = "MCD - Sanitation Wing"; sla_hours = 48;
  } else if (
    t.includes("sadak") || t.includes("road") || t.includes("pothole") ||
    t.includes("gaḍḍha") || t.includes("gaddha") || t.includes("toot")
  ) {
    category = "Roads"; priority = "P3"; department = "PWD Delhi"; sla_hours = 72;
  } else if (
    t.includes("light") || t.includes("batti") || t.includes("andhera") ||
    t.includes("street") || t.includes("lamp")
  ) {
    category = "Streetlight"; priority = "P3"; department = "BSES / TPDDL"; sla_hours = 72;
  } else if (
    t.includes("paani") || t.includes("water") || t.includes("pipe") ||
    t.includes("supply") || t.includes("leak") || t.includes("phoot")
  ) {
    category = "Water Supply"; priority = "P2"; department = "DJB"; sla_hours = 24;
  } else if (
    t.includes("bijli") || t.includes("electricity") || t.includes("current") ||
    t.includes("wire") || t.includes("shock")
  ) {
    category = "Electricity"; priority = "P1"; department = "BSES / TPDDL"; sla_hours = 8;
  } else if (
    t.includes("aag") || t.includes("fire") || t.includes("gas") ||
    t.includes("blast") || t.includes("explosion")
  ) {
    category = "Emergency"; priority = "P1"; department = "Delhi Fire Services"; sla_hours = 4;
  } else if (
    t.includes("ped") || t.includes("tree") || t.includes("gira") ||
    t.includes("fell") || t.includes("branch")
  ) {
    category = "Tree"; priority = "P3"; department = "MCD - Horticulture"; sla_hours = 72;
  }

  return {
    category,
    priority,
    department,
    sla_hours,
    ward_id: wardHint ?? Math.floor(Math.random() * 50) + 1,
    summary: message.length > 120 ? message.slice(0, 117) + "..." : message,
  };
}

// ─── Gemini classifier ────────────────────────────────────────────────────────

export async function classifyComplaint(
  message: string,
  language: string = "en",
  wardHint?: number
): Promise<ClassificationResult> {
  if (!config.geminiApiKey) {
    return classifyLocally(message, wardHint);
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a civic complaint classifier for Delhi Municipal Corporation.
Classify the citizen complaint below and respond ONLY with valid JSON matching this exact schema (no markdown, no extra text):
{"category":"string","priority":"P1|P2|P3|P4","ward_id":number,"summary":"string","department":"string","sla_hours":number}

Rules:
- category: one of [Sanitation, Roads, Streetlight, Water Supply, Drainage, Electricity, Tree, Emergency, General Grievance]
- priority: P1=Emergency/life safety (sla_hours=4), P2=Essential services (sla_hours=24), P3=Infrastructure (sla_hours=72), P4=Low priority (sla_hours=168)
- ward_id: integer 1-272 (use ${wardHint ?? 42} if location is unclear)
- summary: English summary max 120 chars
- department: responsible department name

Complaint (language: ${language}): "${message}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code fences if model adds them
    const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(json) as ClassificationResult;
    // Ensure ward_id is in valid range
    if (!parsed.ward_id || parsed.ward_id < 1 || parsed.ward_id > 272) {
      parsed.ward_id = wardHint ?? 42;
    }
    return parsed;
  } catch (err) {
    console.warn("[Gemini] Classification failed, using local classifier:", (err as Error).message);
    return classifyLocally(message, wardHint);
  }
}
