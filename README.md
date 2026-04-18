<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=230&color=0:0B132B,50:1C2541,100:3A506B&text=India%20Innovates&fontColor=FFFFFF&fontSize=54&fontAlignY=38&desc=Team%20Seekers%20%7C%20AI%20Civic-Tech%20Platform&descAlignY=60&animation=fadeIn" width="100%" alt="India Innovates Header" />

<img src="https://readme-typing-svg.herokuapp.com?font=Poppins&weight=700&size=22&duration=2200&pause=800&color=5BC0EB&center=true&vCenter=true&width=980&lines=Built+by+Team+Seekers;AI+Driven+Civic+Intelligence;Realtime+Operations+for+Public+Impact" alt="Hero Typing Animation" />

<p>
  <img src="https://img.shields.io/badge/Team-Seekers-0A66C2?style=for-the-badge" alt="Team Seekers" />
  <img src="https://img.shields.io/badge/Presentation-Competition%20Ready-1565C0?style=for-the-badge" alt="Competition Ready" />
  <img src="https://img.shields.io/badge/Domain-Civic%20Technology-00695C?style=for-the-badge" alt="Civic Technology" />
</p>

</div>

---

## Executive Snapshot

India Innovates is a multi-platform civic-tech system designed to improve complaint response, safety operations, and governance visibility.

This version is fully transformed for clarity, visual quality, and judge-ready storytelling.

---

## Quick Navigation

<div align="center">

[Overview](#overview) • [KPI Highlights](#kpi-highlights) • [Impact Graphs](#impact-graphs) • [Architecture](#architecture) • [Platform Modules](#platform-modules) • [Quick Start](#quick-start) • [FAQ](#faq) • [Team Seekers](#team-seekers)

</div>

---

## Overview

### Why this project stands out

- Unified architecture across backend, web, and mobile
- AI-enabled decision support for civic workflows
- Realtime operational visibility for administrators
- Competition-grade product direction and execution

### Best in domain positioning

India Innovates by Team Seekers is positioned as a best-in-domain civic platform by combining AI intelligence, emergency readiness, and actionable realtime operations in one ecosystem.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=soft&height=85&color=0:1A237E,100:1976D2&text=Precision%20%7C%20Reliability%20%7C%20Impact&fontColor=FFFFFF&fontSize=28&animation=fadeIn" width="100%" alt="Overview Banner" />

</div>

---

## KPI Highlights

<div align="center">

<img src="https://img.shields.io/badge/Citizen%20Workflows-12%2B-1E88E5?style=for-the-badge" alt="Citizen Workflows" />
<img src="https://img.shields.io/badge/Admin%20Modules-8%2B-00796B?style=for-the-badge" alt="Admin Modules" />
<img src="https://img.shields.io/badge/AI%20Capabilities-6%2B-E65100?style=for-the-badge" alt="AI Capabilities" />

<img src="https://img.shields.io/badge/Backend%20Routes-20%2B-2E7D32?style=for-the-badge" alt="Backend Routes" />
<img src="https://img.shields.io/badge/Realtime%20Events-5%2B-5E35B1?style=for-the-badge" alt="Realtime Events" />
<img src="https://img.shields.io/badge/Platforms-Web%20%7C%20Mobile%20%7C%20API-0D47A1?style=for-the-badge" alt="Platforms" />

</div>

---

## Impact Graphs

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=soft&height=82&color=0:0F4C75,50:3282B8,100:00A8CC&text=Graph%20View%20for%20Decision%20Makers&fontColor=FFFFFF&fontSize=26&animation=fadeIn" width="100%" alt="Impact Graph Banner" />

</div>

### 1. Capability Mix

```mermaid
pie title Platform Capability Distribution
  "Citizen Services" : 35
  "Admin Operations" : 30
  "AI Intelligence" : 20
  "Realtime Layer" : 15
```

### 2. Complaint-to-Resolution Journey

```mermaid
flowchart LR
  C1[Citizen Complaint] --> C2[AI Categorization]
  C2 --> C3[Priority Assignment]
  C3 --> C4[Admin Review]
  C4 --> C5[Field Action]
  C5 --> C6[Resolved and Notified]
```

### 3. Operational Timeline (Illustrative)

```mermaid
timeline
  title Typical Response Lifecycle
  Complaint Logged : T + 0 min
  AI Priority Assigned : T + 1 min
  Admin Acknowledged : T + 5 min
  Action Started : T + 20 min
  Resolved and Closed : T + 90 min
```

---

## Architecture

```mermaid
flowchart LR
    U1[Citizen Mobile App] --> API[API Layer]
    U2[Citizen Web App] --> API
    A1[Admin Dashboard] --> API

    API --> AUTH[Auth and RBAC]
    API --> CORE[Complaint and Ward Services]
    API --> AUDIT[Audit and Tracking]
    API --> QUEUE[Queue and Worker]
    API --> RT[Realtime Events]

    CORE --> DB[(Data Layer)]
    QUEUE --> DB
    RT --> A1
```

### Monorepo surfaces

- backend: API routes, middleware, services, queue worker, socket events
- sankalp-ai: Next.js web app for dashboards and citizen interactions
- sankalp-ai app: Expo mobile app for citizen-first workflows

---

## Platform Modules

### Admin

- Incident and complaint operations panel
- Audit visibility and workflow controls
- Prioritized task handling with realtime status updates

### Citizen

- Fast complaint creation and lifecycle tracking
- Accessible mobile-first service flows
- Transparent status visibility and trust-oriented experience

### AI

- Complaint intelligence and classification support
- Priority recommendation signals
- Extensible AI integration points for advanced analytics

---

## Core Technology

| Layer | Stack |
|---|---|
| Backend | Node.js, TypeScript, Express, Socket.IO, Bull, JWT |
| Web | Next.js, React, Tailwind CSS, Framer Motion, Recharts |
| Mobile | Expo, React Native, Expo Router, React Query |
| Data | In-memory currently, PostgreSQL migration ready |
| AI | Google Generative AI integration points |

---

## Quick Start

### Install all dependencies

```bash
npm run install:all
```

### Run backend and web together

```bash
npm run dev
```

### Run services individually

```bash
npm run backend
npm run frontend
```

### Backend

```bash
cd backend
npm run dev
npm run build
npm run start
npm run seed
npm run migrate
```

### Web

```bash
cd sankalp-ai
npm run dev
npm run build
npm run start
npm run lint
```

### Mobile

```bash
cd "sankalp-ai app"
npm run start
npm run server:dev
npm run lint
```

---

## FAQ

### What makes this different from a standard complaint platform?

It combines AI support, realtime operations, and multi-surface delivery for both citizens and administrators.

### Is this only a demo concept?

No. The repository includes runnable service scripts, implemented route structures, and modular app surfaces.

### Can this scale for city-level deployments?

Yes. The architecture is modular and supports queue-driven processing and realtime event pipelines.

### Why is this competition-ready?

The project balances technical depth, operational clarity, and premium presentation suitable for judges and stakeholders.

---

## Team Seekers

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rounded&height=90&color=0:0D47A1,50:1976D2,100:42A5F5&text=TEAM%20SEEKERS&fontColor=FFFFFF&fontSize=34&animation=twinkling" width="100%" alt="Team Seekers Banner" />

<img src="https://readme-typing-svg.herokuapp.com?font=Poppins&weight=700&size=19&duration=2000&pause=650&color=90CAF9&center=true&vCenter=true&width=960&lines=Seekers+Build+for+Impact;Seekers+Design+for+People;Seekers+Deliver+to+Win" alt="Team Seekers Animation" />

<p><strong>Built with ambition. Engineered with discipline. Delivered for impact.</strong></p>

</div>

---


<div align="center">

<img src="https://capsule-render.vercel.app/api?type=soft&height=88&color=0:102A43,50:1F487E,100:2D6A9F&text=Thank%20You%20for%20Visiting&fontColor=FFFFFF&fontSize=30&animation=fadeIn" width="100%" alt="Footer Thank You" />

<img src="https://capsule-render.vercel.app/api?type=waving&height=125&section=footer&color=0:1C2541,50:0B132B,100:1C2541" width="100%" alt="Footer Wave" />

</div>

<div align="center"><strong>All rights reserved unless explicitly stated otherwise.</strong></div>
