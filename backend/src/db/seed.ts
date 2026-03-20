/**
 * Seed script for PostgreSQL.
 * Usage: npm run seed
 * Requires DATABASE_URL env var.
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.log("[Seed] No DATABASE_URL — running in-memory mode needs no seeding.");
  console.log("[Seed] Set DATABASE_URL in .env and re-run to seed PostgreSQL.");
  process.exit(0);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const NAMED_WARDS = [
  { id: 1, name: "Adarsh Nagar" }, { id: 2, name: "Alipur" },
  { id: 3, name: "Ambedkar Nagar" }, { id: 4, name: "Anand Vihar" },
  { id: 5, name: "Ashok Vihar" }, { id: 6, name: "Badarpur" },
  { id: 7, name: "Bawana" }, { id: 8, name: "Bijwasan" },
  { id: 9, name: "Burari" }, { id: 10, name: "Chandni Chowk" },
  { id: 11, name: "Chhatarpur" }, { id: 12, name: "Civil Lines" },
  { id: 13, name: "Connaught Place" }, { id: 14, name: "Karol Bagh" },
  { id: 15, name: "Keshav Puram" }, { id: 16, name: "Krishna Nagar" },
  { id: 17, name: "Laxmi Nagar" }, { id: 18, name: "Madipur" },
  { id: 19, name: "Malviya Nagar" }, { id: 20, name: "Mangolpuri" },
  { id: 21, name: "Mayur Vihar" }, { id: 22, name: "Model Town" },
  { id: 23, name: "Rohini" }, { id: 24, name: "Saket" },
  { id: 25, name: "Sarita Vihar" }, { id: 26, name: "Seelampur" },
  { id: 27, name: "Shahdara" }, { id: 28, name: "Shakur Basti" },
  { id: 29, name: "Tilak Nagar" }, { id: 30, name: "Trinagar" },
  { id: 31, name: "Uttam Nagar" }, { id: 32, name: "Vasant Kunj" },
  { id: 33, name: "Vikaspuri" }, { id: 34, name: "Wazirpur" },
  { id: 35, name: "Narela" }, { id: 36, name: "Palam" },
  { id: 37, name: "Patparganj" }, { id: 38, name: "Preet Vihar" },
  { id: 39, name: "Rithala" }, { id: 40, name: "Sadar Bazar" },
  { id: 41, name: "Shastri Park" }, { id: 42, name: "Lajpat Nagar" },
  { id: 43, name: "Dwarka" }, { id: 44, name: "Janakpuri" },
  { id: 45, name: "Govindpuri" }, { id: 46, name: "Okhla" },
  { id: 47, name: "Rajouri Garden" }, { id: 48, name: "Pitampura" },
  { id: 49, name: "Hari Nagar" }, { id: 50, name: "Mustafabad" },
];

const OFFICER_NAMES = [
  "Rajan Sharma", "Priya Singh", "Amit Kumar", "Sunita Verma", "Deepak Gupta",
  "Kavita Rao", "Suresh Patel", "Anita Joshi", "Rahul Mehta", "Neha Agarwal",
  "Vikram Nair", "Pooja Chauhan", "Arun Tiwari", "Meena Pandey", "Sanjay Malhotra",
  "Ritu Dubey", "Manoj Srivastava", "Anjali Mishra", "Vinod Yadav", "Shruti Kapoor",
];

const CATEGORIES = ["Sanitation", "Roads", "Streetlight", "Water Supply", "Drainage", "Electricity", "Tree", "General Grievance"];
const PRIORITIES = ["P1", "P2", "P3", "P4"];
const WARD_SUBSET = [1, 2, 3, 4, 5, 10, 14, 21, 23, 24, 27, 32, 33, 42, 43, 44, 45, 46, 47, 48];

const MESSAGES = [
  "Nali jamm gayi hai, paani bhar gaya sadak par",
  "Street light kharab hai raat ko andhera rehta hai",
  "Sadak par bada gaḍḍha hai, accident ho sakta hai",
  "Paani ki pipe phoot gayi hai",
  "Kachra uthane wale 3 din se nahi aaye",
  "Bijli ka wire neeche latkaa hua hai, bahut khatarnak hai",
  "Drainage system block ho gaya hai",
  "Garbage not collected for 5 days, causing health hazard",
  "Pothole on main road causing accidents",
  "Water supply disrupted for 2 days",
];

async function seed() {
  console.log("[Seed] Starting...");

  // Wards (272)
  for (let i = 1; i <= 272; i++) {
    const named = NAMED_WARDS.find((w) => w.id === i);
    const name = named ? named.name : `Ward ${i}`;
    const healthScore = 55 + Math.floor(Math.random() * 40);
    await pool.query(
      `INSERT INTO wards (id, name, health_score) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
      [i, name, healthScore]
    );
  }
  console.log("[Seed] 272 wards seeded");

  // Officers (20)
  for (let i = 0; i < 20; i++) {
    const wardId = WARD_SUBSET[i % WARD_SUBSET.length];
    const karmaScore = 50 + Math.floor(Math.random() * 45);
    await pool.query(
      `INSERT INTO officers (name, phone, gps_lat, gps_lng, ward_id, karma_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (phone) DO NOTHING`,
      [
        OFFICER_NAMES[i],
        `98${String(10000000 + i).padStart(8, "0")}`,
        (28.4 + Math.random() * 0.7).toFixed(7),
        (76.9 + Math.random() * 0.8).toFixed(7),
        wardId,
        karmaScore,
      ]
    );
  }
  console.log("[Seed] 20 officers seeded");

  // Get officer IDs
  const officerRows = await pool.query(`SELECT id, ward_id FROM officers ORDER BY id`);
  const officers = officerRows.rows;

  // Complaints (50)
  const statuses = ["pending", "assigned", "in_progress", "resolved"];
  for (let i = 0; i < 50; i++) {
    const wardId = WARD_SUBSET[i % WARD_SUBSET.length];
    const officer = officers.find((o: { ward_id: number }) => o.ward_id === wardId) ?? officers[0];
    const category = CATEGORIES[i % CATEGORIES.length];
    const priority = PRIORITIES[i % PRIORITIES.length];
    const statusIndex = i < 20 ? 0 : i < 35 ? 2 : 3;
    const status = statuses[statusIndex];
    const hoursAgo = Math.floor(Math.random() * 72) + 1;
    const createdAt = new Date(Date.now() - hoursAgo * 3600 * 1000);
    const resolvedAt = status === "resolved"
      ? new Date(Date.now() - Math.floor(Math.random() * 24) * 3600 * 1000)
      : null;

    await pool.query(
      `INSERT INTO complaints
         (phone, message, category, priority, ward_id, status, assigned_officer_id, created_at, resolved_at, ai_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        `98765${String(43210 + i).padStart(5, "0")}`,
        MESSAGES[i % MESSAGES.length],
        category,
        priority,
        wardId,
        status,
        officer?.id ?? null,
        createdAt,
        resolvedAt,
        `${category} issue reported`,
      ]
    );
  }
  console.log("[Seed] 50 complaints seeded");

  // Predictions (5 monsoon)
  const predictions = [
    { ward_id: 42, category: "Drainage", date: "2026-07-15", confidence: 0.92 },
    { ward_id: 23, category: "Roads", date: "2026-07-20", confidence: 0.87 },
    { ward_id: 14, category: "Sanitation", date: "2026-07-18", confidence: 0.85 },
    { ward_id: 43, category: "Water Supply", date: "2026-07-22", confidence: 0.78 },
    { ward_id: 45, category: "Streetlight", date: "2026-08-01", confidence: 0.71 },
  ];
  for (const p of predictions) {
    await pool.query(
      `INSERT INTO predictions (ward_id, category, predicted_date, confidence)
       VALUES ($1, $2, $3, $4)`,
      [p.ward_id, p.category, p.date, p.confidence]
    );
  }
  console.log("[Seed] 5 predictions seeded");

  // Update ward counts
  await pool.query(`
    UPDATE wards w SET
      complaint_count = (SELECT COUNT(*) FROM complaints WHERE ward_id = w.id),
      resolved_count = (SELECT COUNT(*) FROM complaints WHERE ward_id = w.id AND status IN ('resolved','closed'))
  `);
  console.log("[Seed] Ward counts updated");

  await pool.end();
  console.log("[Seed] Done!");
}

seed().catch((err) => {
  console.error("[Seed] Error:", err);
  process.exit(1);
});
