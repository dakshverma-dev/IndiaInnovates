# SANKALP AI

Delhi has 272 wards. Each ward generates hundreds of civic complaints every week — broken drains, potholes, water outages, street lights down. Most of them vanish into phone calls, WhatsApp forwards, and paper registers. No tracking. No accountability. No resolution.

SANKALP AI is a complaint management system that changes that. Citizens file a complaint in two minutes. The AI routes it to the right department and officer automatically. Officers verify on-site with GPS and photo proof. Admins see everything in real time. And when a complaint is marked "resolved" by an official, citizens can say whether it was actually fixed.

---

## The problem is bigger than it looks

According to DARPG's CPGRAMS data, central government services alone received **7,932 grievances in a single quarter** (Oct–Dec 2025). Provident Fund: 2,548. Banking: 1,317. Railways: 349. Posts: 456. That's just the central tier — at the ward level, volumes are 10x higher, with far fewer resources and no system to handle them.

Most complaints go unresolved because there's no accountability loop. An officer can mark a ticket "closed" without leaving their desk. There's no photo, no GPS, no citizen confirmation. SANKALP AI closes that loop.

---

## What it does

**For citizens**
- File a complaint in Hindi or English in under 2 minutes
- Get a ticket ID (DL-XXXX) with real-time status
- Upvote existing complaints instead of filing duplicates — if 50 people have the same drainage problem, it shows up as one high-priority ticket, not 50
- Track your complaint at `/track` — no login needed
- Rate whether the issue was actually resolved (separate from the official "resolved" status)

**For field officers**
- Dedicated login portal at `/auth/officer`
- View assigned complaints with GPS routing
- Verify resolution with photo upload and QR code scan
- Complaints can't be closed without on-site verification

**For administrators**
- Live dashboard at `/dashboard` with WebSocket updates
- Citizen Satisfaction % — tracks whether people are actually happy, not just whether tickets are "resolved"
- Ward health scores (0–100) updated after every resolution
- Monsoon risk predictions by ward (e.g. "Ward 42 / Drainage / July 15 / 92% confidence")
- Filterable complaint list by priority, status, ward

**Under the hood**
- Gemini AI classifies complaints in 1–2 seconds (Hindi + English, 9 categories)
- Smart deduplication — same issue in same ward within 24h gets merged
- Hash-chained audit trail — every action is SHA-256 linked to the previous one, tamper-proof
- SLA escalation — P1 tickets auto-escalate after 4 hours
- Works without any external dependencies (in-memory fallback for DB, queue, and AI)

---

## How to run locally

```bash
# Clone
git clone https://github.com/dakshverma-dev/IndiaInnovates.git
cd IndiaInnovates

# Start the backend (port 3001)
cd backend
npm install
npm run dev

# In a new terminal — start the frontend (port 3000)
cd sankalp-ai
npm install
npm run dev
```

Open http://localhost:3000

The backend works with zero configuration. If you have a Gemini API key, add it as `GEMINI_API_KEY` in `backend/.env` for real AI classification. Without it, a local keyword classifier runs instead.

---

## Demo in 5 steps (for judges)

1. Go to `/complaint` — type a Hindi complaint like "nali band hai lajpat nagar mein" and watch the AI classify it in real time
2. Notice the upvote nudge — if similar complaints exist in that ward, you'll be asked to upvote instead of filing a duplicate
3. Submit — you get a ticket ID (DL-XXXX). The success screen asks for satisfaction feedback
4. Open `/dashboard` in another tab — your ticket appears instantly via WebSocket
5. Click Resolve — then go to `/track`, enter your ticket ID to see the hash-chained audit trail

---

## Tech

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 (App Router), Framer Motion |
| Backend | Node.js, Express, Socket.IO |
| AI | Google Gemini (local keyword fallback) |
| Database | PostgreSQL (in-memory fallback) |
| Queue | Bull + Redis (setTimeout fallback) |
| Auth | JWT (phone + PIN) |

---

## Access portals

| Portal | URL | Demo credentials |
|--------|-----|-----------------|
| Admin dashboard | `/auth/login` | 9999999999 / 000000 |
| Officer portal | `/auth/officer` | 9876500001 / 111111 |
| Citizen tracker | `/track` | No login needed |
| File complaint | `/complaint` | No login needed |

---

## Built for India Innovates Hackathon — March 2026

This is a working prototype, not a slideshow. The backend handles real AI classification, real Socket.IO updates, and real hash-chained audit trails. The in-memory store means data resets on restart — connect a PostgreSQL database via `DATABASE_URL` env var for persistence.
