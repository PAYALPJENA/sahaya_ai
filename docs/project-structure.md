# Project Structure

The Sahaya AI repository is structured as a full-stack monorepo containing a Python backend, a Next.js frontend, and comprehensive documentation.

```text
sahaya ai/
│
├── backend/                  # FastAPI Application
│   ├── ai/                   # AI logic, prompt templates, NIM client, mock fallbacks
│   ├── api/                  # API routers (v1 endpoints for sos, incidents, etc.)
│   ├── core/                 # Enums, exceptions, security, config settings
│   ├── models/               # SQLAlchemy database models (SOSReport, Incident, etc.)
│   ├── schemas/              # Pydantic schemas for API request/response validation
│   ├── seed/                 # Seed data scripts (users, hospitals, shelters, teams)
│   ├── services/             # Core business logic (ai_pipeline, triage, approvals)
│   ├── config.py             # Environment configuration mapping
│   ├── database.py           # SQLite connection and session maker
│   ├── main.py               # FastAPI application entry point
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Next.js Application
│   ├── src/                  
│   │   ├── app/              # Next.js App Router (dashboard, login, sos, layout)
│   │   ├── components/       # Reusable React components
│   │   └── lib/              # API client utilities (api.ts)
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── docs/                     # Engineering, architecture, and submission documentation
│   ├── agent-engineering.md
│   ├── api.md
│   ├── architecture.md
│   ├── database.md
│   ├── demo-test.md
│   ├── judge-demo-script.md
│   ├── project-structure.md
│   ├── real-vs-mock.md
│   ├── security-and-responsible-ai.md
│   ├── submission-checklist.md
│   └── system-audit.md
│
├── .github/                  # GitHub Actions (CI/CD)
│   └── workflows/
│       └── ci.yml            # Automated testing and build pipeline
│
├── package.json              # Root project scripts (dev, build, start)
├── README.md                 # Main project README
├── .env.example              # Example environment variables
└── sahaya_ai.db              # SQLite database (generated at runtime)
```
