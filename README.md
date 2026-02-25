# AI-Powered Job Application Automation System

> **An intelligent MCP server and automation pipeline that discovers, scores, and applies to relevant job opportunities using RAG, LLM-powered personalization, and ethical rate limiting.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Project Vision

As an **Software Engineering Manager** with 9 years of experience, I built this system to demonstrate advanced AI integration, MCP server development, and ethical automation practices. This project showcases:

- **MCP Server Architecture** - Composable tools for LLM orchestration
- **RAG Implementation** - Semantic job matching with pgvector + Voyage embeddings
- **Multi-Agent Systems** - Autonomous job discovery, scoring, and application
- **LLM Integration** - Claude Sonnet 4 for personalized cover letters
- **Production-Grade Engineering** - Rate limiting, ethics checks, monitoring, audit trails

**Built to solve a real problem:** Applying to 1,500 jobs/month while maintaining quality and personalization.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Server Layer                         │
│         (TypeScript + Streamable HTTP Transport)             │
│  Exposes 15+ tools for LLM agents to orchestrate workflow   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Job Discovery Service (Python)                  │
│  Multi-source aggregation: Adzuna, Greenhouse, Lever, YC    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         RAG-Based Scoring Engine (pgvector + Voyage)         │
│  Semantic similarity + rule-based scoring (0-100 scale)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL + pgvector Database                  │
│  Vector search, application tracking, analytics             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│    Resume Personalization (Claude Sonnet 4 + GPT-4)         │
│  Auto-select resume version + generate tailored cover letter │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│       Application Submission (Rate-Limited + Ethical)        │
│  50/day limit, ethics checks, audit trail, compliance        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🤖 Intelligent Job Discovery

- **Multi-source aggregation**: Adzuna API, Greenhouse, Lever, YC Jobs, AngelList
- **100+ new jobs/day** from diverse sources
- **Automatic enrichment**: Company stage, tech stack, funding info
- **Smart caching**: 24-hour TTL to respect API rate limits

### 🎯 RAG-Based Job Scoring

- **Semantic similarity**: Voyage AI embeddings (voyage-3-large, 1024 dimensions)
- **Multi-dimensional scoring**:
  - Role match (30%) - Title alignment with target roles
  - Tech stack (25%) - React, TypeScript, Node.js, AWS, etc.
  - Company stage (20%) - Startup, Growth, FAANG
  - Experience level (15%) - 9 years → Senior/EM roles
  - Location (10%) - Remote/relocation flexibility
- **Hybrid search**: Semantic + keyword matching with reranking
- **Minimum threshold**: 70/100 to qualify for application

### 📝 AI-Powered Personalization

- **Resume selection**: Auto-picks best version (4 options) based on role type
  - Engineering Manager → leadership-focused
  - Full-Stack Engineer → technical breadth
  - Frontend Engineer → React/UI expertise
  - Senior Engineer → balanced for FAANG
- **Cover letter generation**: Claude Sonnet 4 creates tailored 250-300 word letters
- **3 tone options**: Professional, enthusiastic, technical
- **Anti-generic checks**: Quality validation before submission

### 🛡️ Ethical Safeguards

- ✅ **Rate limiting**: 50 applications/day max, 5-min intervals
- ✅ **Company cooldown**: 1 application per company per 30 days
- ✅ **AI transparency**: Disclosure in all cover letters
- ✅ **Quality gates**: No generic content, resume must match role
- ✅ **Human oversight**: Manual review flags for 90+ scoring roles
- ✅ **Compliance**: GDPR/CCPA ready, audit trail, opt-out mechanism

### 📊 Application Tracking & Analytics

- **Status pipeline**: Draft → Submitted → Interview → Offer/Rejected
- **Response rate tracking**: Industry benchmark comparison
- **Company insights**: Applications by stage, tech stack, location
- **Performance metrics**: Time saved, cost per application, ROI

---

## 🛠️ Technology Stack

### Backend

- **MCP Server**: TypeScript 5.3 + MCP SDK + Streamable HTTP
- **API Services**: Python 3.11 + FastAPI + asyncio
- **Database**: PostgreSQL 15 + pgvector extension
- **Embeddings**: Voyage AI (voyage-3-large, 1024 dimensions)
- **LLMs**: Claude Sonnet 4 (cover letters) + GPT-4 (fallback)

### Infrastructure

- **Hosting**: Railway (simple deploy) or AWS (production scale)
- **Queue**: Redis (rate limiting + job scheduling)
- **Cron**: GitHub Actions (daily job discovery)
- **Monitoring**: Sentry (errors) + Grafana (metrics)

### Frontend (Optional Dashboard)

- **Framework**: Next.js 14 + Tailwind CSS
- **Charts**: Recharts
- **State**: React Query

---

## 📂 Project Structure

```
ai-job-application-system/
├── mcp-server/              # TypeScript MCP server
│   ├── src/
│   │   ├── index.ts         # Server entry point
│   │   ├── tools/           # MCP tool implementations
│   │   │   ├── job-discovery.ts
│   │   │   ├── job-scoring.ts
│   │   │   ├── application-management.ts
│   │   │   └── analytics.ts
│   │   ├── schemas/         # Zod input/output schemas
│   │   └── utils/           # Shared utilities
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                 # Python FastAPI services
│   ├── services/
│   │   ├── job_discovery.py        # Multi-source job fetching
│   │   ├── scoring_engine.py       # RAG-based scoring
│   │   ├── cover_letter_gen.py     # Claude integration
│   │   └── submission_service.py   # Application submission
│   ├── models/              # Pydantic models
│   ├── db/                  # Database layer
│   │   ├── schema.sql       # PostgreSQL + pgvector schema
│   │   └── migrations/
│   ├── requirements.txt
│   └── main.py
│
├── scripts/                 # Automation scripts
│   ├── daily_job_discovery.py
│   ├── batch_submit.py
│   └── analytics_report.py
│
├── docs/                    # Documentation
│   ├── IMPLEMENTATION_PLAN.md
│   ├── API.md
│   ├── ETHICS.md
│   └── DEPLOYMENT.md
│
├── dashboard/               # Optional Next.js dashboard
│   ├── app/
│   ├── components/
│   └── package.json
│
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+ with pgvector
- Redis (for rate limiting)
- API Keys:
  - Adzuna API (free tier)
  - Voyage AI (embeddings)
  - Anthropic (Claude)
  - OpenAI (fallback)

### Installation

```bash
# Clone the repository
git clone https://github.com/EmmYup/ai-job-application-system.git
cd ai-job-application-system

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Install PostgreSQL with pgvector
brew install postgresql@15
brew install pgvector

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb job_automation
psql job_automation < backend/db/schema.sql

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Install MCP server dependencies
cd ../mcp-server
npm install

# Build MCP server
npm run build

# Start services
docker-compose up -d  # Or manual setup
```

### Running the System

```bash
# Start MCP server
cd mcp-server
npm start

# Start backend API
cd backend
uvicorn main:app --reload

# Test with MCP Inspector
npx @modelcontextprotocol/inspector

# Run daily job discovery
python scripts/daily_job_discovery.py

# Submit batch applications
python scripts/batch_submit.py --limit 20 --dry-run
```

---

## 🎯 Use Cases

### 1. Autonomous Job Search Agent

```typescript
// Claude Desktop can use MCP tools to autonomously search and apply
const jobs = await mcp.call('search_jobs', {
  keywords: ['Engineering Manager', 'Tech Lead'],
  location: 'Remote',
  remote_only: true,
});

const topMatches = await mcp.call('get_top_matches', {
  limit: 10,
  min_score: 80,
});

for (const job of topMatches) {
  const resume = await mcp.call('select_best_resume', { job_id: job.id });
  const coverLetter = await mcp.call('generate_cover_letter', {
    job_id: job.id,
    tone: 'professional',
  });

  await mcp.call('create_application', {
    job_id: job.id,
    resume_version: resume,
  });
}

await mcp.call('batch_submit_applications', { max_per_day: 50 });
```

### 2. CLI Tool for Targeted Search

```bash
# Search for specific roles
python scripts/search_jobs.py --role "Senior Frontend" --tech "React,TypeScript" --remote

# Score and filter
python scripts/score_jobs.py --min-score 75 --company-stage startup

# Generate applications
python scripts/create_applications.py --job-ids job1,job2,job3

# Submit with dry run
python scripts/batch_submit.py --limit 20 --dry-run
```

### 3. Dashboard for Monitoring

- View application pipeline (draft → submitted → interview → offer)
- Track response rates by company type
- Analyze best-performing resume versions
- Monitor daily application quota

---

## 📊 Success Metrics

### Target Metrics (30 days)

- **Applications**: 1,500 (50/day)
- **Average Score**: 75+/100
- **Response Rate**: 10-20% (industry avg)
- **Interview Rate**: 5-10%
- **Offer Rate**: 1-3%
- **Time Saved**: 40+ hours/month

### System Performance

- **Uptime**: 99.9%
- **Job Discovery**: 100+ new jobs/day
- **Scoring Speed**: < 2 seconds/job
- **Submission Success**: 95%+

### Cost Efficiency

- **Monthly Cost**: ~$107
- **Cost per Application**: $0.07
- **ROI**: 1 job offer = 100+ hours saved

---

## 🔒 Privacy & Compliance

- **GDPR/CCPA Compliant**: Minimal data collection, opt-out mechanism
- **AI Transparency**: All cover letters include AI disclosure
- **Data Retention**: 90-day policy for application data
- **Audit Trail**: Full logging of all submissions
- **API ToS Compliance**: Respect rate limits, robots.txt, attribution

---

## 🧪 Testing

```bash
# Run MCP server tests
cd mcp-server
npm test

# Run backend tests
cd backend
pytest

# Run integration tests
python tests/integration/test_end_to_end.py

# Run MCP evaluations
npm run eval
```

---

## 📈 Roadmap

### Phase 1: MVP (Weeks 1-3) ✅

- [x] PostgreSQL + pgvector setup
- [x] Job discovery (Adzuna, Greenhouse, Lever)
- [x] Basic scoring algorithm
- [x] MCP server with core tools
- [x] Cover letter generation

### Phase 2: Automation (Weeks 4-5)

- [ ] Application submission service
- [ ] Rate limiting + ethics checks
- [ ] Daily cron jobs
- [ ] Email-based submissions
- [ ] Greenhouse API integration

### Phase 3: Dashboard (Week 6)

- [ ] Next.js dashboard
- [ ] Application tracking UI
- [ ] Analytics charts
- [ ] Manual review interface

### Phase 4: Production (Weeks 7-8)

- [ ] Deploy to Railway/AWS
- [ ] CI/CD pipeline
- [ ] Monitoring + alerting
- [ ] Load testing
- [ ] Documentation

---

## 🤝 Contributing

This is a personal project showcasing AI engineering skills, but I welcome:

- **Bug reports**: Open an issue
- **Feature suggestions**: Start a discussion
- **Code improvements**: Submit a PR

Please follow ethical guidelines when forking/using this system.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👤 About the Author

**Emmanuel Yupit** - Software Engineering Manager

- 🔗 [LinkedIn](https://linkedin.com/in/emmanuelyupit)
- 💻 [GitHub](https://github.com/EmmYup)
- 🌐 [Website](https://emmanuelyupit.com)
- 📧 [e.pyupit@gmail.com](mailto:e.pyupit@gmail.com)

**Experience Highlights:**

- 9 years building scalable systems (150k+ users, $20M ARR)
- Led team of 7 engineers with 25% velocity improvement
- Built AI-powered applications with OpenAI, Claude, RAG systems
- Expertise: React, TypeScript, Node.js, Python, AWS, PostgreSQL

---

## 🎓 Learning Resources

This project demonstrates advanced AI engineering concepts:

- **MCP Server Development**: [MCP Specification](https://modelcontextprotocol.io/)
- **RAG Implementation**: [LangChain RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- **Vector Databases**: [pgvector Guide](https://github.com/pgvector/pgvector)
- **LLM Integration**: [Anthropic Docs](https://docs.anthropic.com/)
- **Ethical AI**: [Responsible AI Practices](https://www.resumly.ai/blog/is-automated-job-application-ethical)

---

## 🙏 Acknowledgments

- **Anthropic** - Claude Sonnet 4 for cover letter generation
- **Voyage AI** - High-quality embeddings for semantic search
- **Model Context Protocol** - Enabling LLM tool orchestration
- **PostgreSQL/pgvector** - Powerful vector search capabilities
- **Open Source Community** - TypeScript SDK, FastAPI, LangChain

---

**Star ⭐ this repo if you find it useful for your AI engineering journey!**
