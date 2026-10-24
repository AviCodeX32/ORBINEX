# ORBINEX — AI-Powered Opportunity Intelligence Platform

> **Discover → Verify → Personalize → Act → Learn**  
> An AI-powered opportunity intelligence platform built with **React.js (Vite)**, **Tailwind CSS**, and **Python FastAPI (SQLAlchemy)** designed to help students, recent graduates, and early-career professionals discover, verify, and track genuine hackathons, internships, scholarships, fellowships, and coding competitions.

Inspired by industry leaders like **Unstop (formerly Dare2Compete)**, **Devfolio**, and **Devpost**, with a clean, high-clarity **Light Mode UI**, evidence-based source verification, deduplication engine, and personalized preparation workflows.

---

## 🌟 Core Value Proposition

Students often miss high-impact career opportunities because they are scattered across numerous sites, groups, and aggregators, riddled with outdated deadlines, misleading claims, or duplicate records. **ORBINEX** solves this with a 5-step systematic pipeline:

1. **Discover:** Permitted public connectors, official developer portals, APIs, and authorized college/partner submissions.
2. **Extract:** Automated structuring of challenge tracks, eligibility restrictions, prize amounts, stipends, and direct registration links.
3. **Verify:** Multi-factor evidence auditing (SSL security, official domain authentication, active registration endpoint verification, zero hidden fee checks).
4. **Deduplicate:** Cross-platform lexical and domain clustering to collapse repeated listings into a single canonical source record.
5. **Personalize & Act:** Real-time profile match scoring, AI-generated preparation roadmaps, statement of purpose (SOP) drafting, and an interactive Kanban application tracker.

---

## 🛠️ Architecture & Tech Stack

```
ORBINEX/
├── server/                    # Python FastAPI Backend
│   ├── .env                   # Complete environment variable configuration
│   ├── .env.example           # Environment template with defaults
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Server startup script
│   └── app/
│       ├── config.py          # Settings loaded directly from .env
│       ├── database.py        # SQLAlchemy engine (SQLite local / PostgreSQL ready)
│       ├── models.py          # User, Opportunity, Tracker, Duplicate, Health models
│       ├── schemas.py         # Pydantic validation schemas
│       ├── seed.py            # Real-world inspired dataset (SIH, ETHIndia, GSoC, etc.)
│       ├── services/          # Discovery, Verification, Deduplication, AI Recommender
│       └── api/               # Opportunities, Tracker, AI, Admin, Partner, User routers
└── client/                    # React.js (Vite) + Tailwind CSS Frontend
    ├── .env                   # Client-side configuration & backend endpoints
    ├── .env.example           # Example client environment variables
    ├── index.html             # HTML entry point
    ├── vite.config.ts         # Vite bundler configuration
    ├── package.json           # React 19, Tailwind CSS 4, Lucide Icons
    ├── tsconfig.json          # TypeScript configuration
    └── src/
        ├── App.tsx            # Main application component & layout
        ├── main.tsx           # React DOM root mounting
        ├── index.css          # Tailwind CSS styles & light theme variables
        ├── components/        # Navbar, OpportunityCard, Tracker, AI, Admin, Partner, Profile
        └── lib/               # Typed API client and data models
```

### Backend (`server/`)
- **Framework:** Python 3.13+, FastAPI, Uvicorn, Pydantic
- **Database:** SQLAlchemy 2.0 (SQLite zero-config local default with seamless PostgreSQL support via `DATABASE_URL`)
- **AI Layer:** Provider-independent architecture (Google Gemini, OpenAI, and deterministic heuristic fallback engine)
- **Engines:**
  - `DiscoveryEngine`: Announcement parsing and structured data extraction
  - `VerificationEngine`: Evidence collection, SSL audit, domain reputation, and trust score computation
  - `DeduplicationEngine`: Composite Jaccard & organizer matching for canonical record unification
  - `RecommenderEngine`: Profile-to-opportunity personalized match scoring & rationale generation

### Frontend (`client/`)
- **Framework:** React.js 19 with Vite bundler (fast, reliable, 0-hydration-issue deployment)
- **Styling:** Tailwind CSS 4 with custom light-mode design system
- **Icons:** `lucide-react`
- **UI References:** Unstop, Devfolio, Devpost (crisp white cards, subtle borders, trust badges, urgency countdowns, intuitive Kanban board)

---

## 🚀 Quickstart Guide

### 1. Start the Backend Server

```powershell
# Navigate to the server folder
cd a:\ORBINEX\server

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```
- The backend API will start on: **`http://localhost:8000`**
- Interactive Swagger API Documentation: **`http://localhost:8000/docs`**
- System Health Check: **`http://localhost:8000/api/v1/health`**
- *Note: On first startup, the database is automatically created and populated with a rich initial dataset of opportunities, partner organizations, and application tracking records.*

---

### 2. Start the Frontend Client (React.js)

```powershell
# In a new terminal, navigate to the client folder
cd a:\ORBINEX\client

# Install dependencies (if not already installed)
npm install

# Start the React Vite development server
npm run dev
```
- The web application will open on: **`http://localhost:3000`**
- To build for production deployment:
  ```powershell
  npm run build
  ```
  Generates an optimized static bundle in `client/dist` ready to deploy to Netlify, Vercel, S3, or any static host in seconds!

---

## 🔐 Environment Variables Maintenance

As per project requirements, dedicated `.env` and `.env.example` files are maintained in both `server/` and `client/` directories.

### Server Environment (`server/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Running mode (`development` / `production`) | `development` |
| `SERVER_HOST` | FastAPI bind host | `0.0.0.0` |
| `SERVER_PORT` | FastAPI port | `8000` |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./orbinex.db` |
| `CORS_ORIGINS` | Permitted browser origins | `["http://localhost:3000"]` |
| `AI_PROVIDER` | Active LLM service (`fallback`, `gemini`, `openai`) | `fallback` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | `""` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `""` |
| `VERIFICATION_MIN_TRUST_SCORE` | Trust score threshold for verified badge | `75` |
| `DEDUPLICATION_SIMILARITY_THRESHOLD` | Threshold for detecting cross-feed duplicates | `0.82` |

### Client Environment (`client/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_NODE_ENV` | React execution mode | `development` |
| `VITE_APP_NAME` | Application title | `ORBINEX` |
| `VITE_API_URL` | Backend REST API endpoint | `http://localhost:8000/api/v1` |
| `VITE_BACKEND_HEALTH_URL` | Health check URL | `http://localhost:8000/api/v1/health` |
| `VITE_UI_THEME` | Default visual theme | `light` |

---

## 📱 Feature Walkthrough

### 1. 🔍 Discover Feed
- **Live Search & Multi-facet Filters:** Search by title, skills, tags; filter by Category (Hackathons, Internships, Scholarships, Fellowships, Coding Contests), Mode (Online, In-Person, Hybrid), Verification Status, and Free entry.
- **Unstop / Devfolio Card Layout:** Highlights prize pool/stipend, days remaining deadline countdown, organizer monogram, direct official application link, and personalized match score.
- **Trust Badge & Audit Popover:** Hover over any badge (e.g. `98% Verified`) to view the exact audit trail (SSL certificate verified, .gov/.edu domain authenticated, free student entry confirmed).

### 2. 📋 Interactive Application Tracker
- **Kanban Pipeline & Detailed Table:** Track opportunities across 6 stages: *Saved → Applied → Under Review → Interview / Round 2 → Accepted / Won → Closed*.
- **Task Checklist per Application:** Add custom milestones (e.g., "Prepare Pitch Deck", "Review DSA", "Submit GitHub repo") and check them off interactively.
- **Direct Portal Links & Notes:** Keep notes, submission URLs, and follow-up reminders attached to each opportunity.

### 3. 🤖 AI Opportunity Intelligence
- **AI Match Scorecard:** Evaluates candidate profile (skills, degree, CGPA, graduation batch) against challenge prerequisites with strengths and recommended growth skills.
- **4-Phase Preparation Roadmap:** Stage-by-stage playbook from Registration & Team Assembly to Problem Selection, MVP Sprint, and Pitch Deck creation.
- **Tailored SOP & Elevator Pitch Generator:** Automatically drafts a professional cover note, email subject line, and 30-second elevator pitch customized to any specific track.

### 4. 🛡️ Admin & Verification Queue
- **Verification Review:** Review community and scraped listings, inspect evidence checklists, and approve or flag listings with 1 click.
- **Deduplication Engine:** View cross-feed duplicate matches (e.g. Devfolio vs Unstop) with similarity scores and merge them into a single canonical record.
- **Source Health Monitoring:** Real-time latency, sync status, and item counts for Devfolio API, Unstop Feed, SIH AICTE portal, and Devpost.
- **Platform Analytics:** Real metrics on total opportunities, verified percentage, and active student applications.

### 5. 🤝 Colleges & Partner Organizations Portal
- **Post Opportunity:** Authorized partners can publish verified opportunities directly with verified partner badges.
- **AI Campus Outreach Drafter:** Generates personalized outreach letters for college Training & Placement Officers (TPOs) and student tech clubs.

### 6. 👤 Student Profile & Preferences
- Manage skills keywords, degree, university, CGPA, graduation year, target opportunity types, and notification preferences.
