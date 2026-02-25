# System Architecture

## Overview

This system uses a **Modular Monolith** architecture with clear domain boundaries, designed for rapid MVP development while maintaining scalability for future microservices decomposition.

## Architecture Decision

### Why Modular Monolith?

**For MVP (2-3 weeks):**
- ✅ Faster development (single deployment)
- ✅ Simpler debugging (single process)
- ✅ Lower infrastructure cost ($25/mo Railway)
- ✅ Easier testing (no distributed system complexity)
- ✅ Single database transaction boundary

**Future-Ready:**
- ✅ Clear module boundaries enable microservices extraction
- ✅ Domain-driven design principles
- ✅ Interface-based communication between modules
- ✅ Independent module testing

### Alternative Considered: Microservices

**Rejected for MVP because:**
- ❌ Overhead: API gateway, service discovery, distributed tracing
- ❌ Complexity: Network calls, eventual consistency, distributed transactions
- ❌ Cost: Multiple containers, load balancers ($100+/mo)
- ❌ Time: 2-3x longer development

**When to migrate:** After 1,000+ applications/day or team size > 3 engineers.

---

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Dashboard                         │
│                    (React + Tailwind + shadcn)                   │
│                  Port 3000 - User Interface                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (Monolith)                   │
│                         Port 8000 - API                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Application Layer                       │  │
│  │  • REST Controllers (FastAPI routes)                       │  │
│  │  • Request/Response DTOs (Pydantic)                        │  │
│  │  • Authentication middleware                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Domain Modules (Use Cases)                │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Jobs      │  │ Applications │  │   Analytics     │  │  │
│  │  │  Module     │  │   Module     │  │    Module       │  │  │
│  │  │             │  │              │  │                 │  │  │
│  │  │ • Discovery │  │ • Creation   │  │ • Stats         │  │  │
│  │  │ • Scoring   │  │ • Submission │  │ • Reporting     │  │  │
│  │  │ • Filtering │  │ • Tracking   │  │ • Insights      │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌──────────────┐                        │  │
│  │  │  Resumes    │  │ Cover Letter │                        │  │
│  │  │  Module     │  │   Module     │                        │  │
│  │  │             │  │              │                        │  │
│  │  │ • Selection │  │ • Generation │                        │  │
│  │  │ • Matching  │  │ • Validation │                        │  │
│  │  └─────────────┘  └──────────────┘                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Infrastructure Layer                     │  │
│  │  • Repositories (PostgreSQL + pgvector)                    │  │
│  │  • External APIs (Adzuna, Anthropic, Voyage)               │  │
│  │  • Cache (Redis)                                           │  │
│  │  • Queue (Celery + Redis)                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data & External Services                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   Adzuna     │          │
│  │  + pgvector  │  │   (Cache)    │  │     API      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Anthropic  │  │  Voyage AI   │  │    SMTP      │          │
│  │  (Claude)    │  │ (Embeddings) │  │   (Gmail)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Boundaries

### Jobs Module
**Responsibility:** Job discovery, enrichment, and scoring

**Public Interface:**
```python
class JobsModule:
    async def search_jobs(keywords, filters) -> List[Job]
    async def score_job(job_id) -> JobScore
    async def get_top_matches(limit, filters) -> List[Job]
    async def refresh_listings() -> RefreshResult
```

**Internal:**
- Job discovery service (Adzuna, Greenhouse, Lever)
- RAG-based scoring engine
- Company enrichment
- Job repository

### Applications Module
**Responsibility:** Application lifecycle management

**Public Interface:**
```python
class ApplicationsModule:
    async def create_application(job_id, options) -> Application
    async def submit_application(app_id) -> SubmissionResult
    async def batch_submit(app_ids, options) -> BatchResult
    async def get_status(app_id) -> ApplicationStatus
    async def list_applications(filters) -> List[Application]
```

**Internal:**
- Application service
- Ethics validator
- Rate limiter
- Submission handler
- Application repository

### Resumes Module
**Responsibility:** Resume selection and management

**Public Interface:**
```python
class ResumesModule:
    async def select_best_resume(job_id) -> ResumeVersion
    async def get_resume_versions() -> List[ResumeVersion]
    async def get_resume_performance() -> Dict[str, Metrics]
```

**Internal:**
- Resume selector (rule-based)
- Resume metadata repository

### Cover Letter Module
**Responsibility:** AI-powered cover letter generation

**Public Interface:**
```python
class CoverLetterModule:
    async def generate(job_id, tone, length) -> CoverLetter
    async def validate_quality(cover_letter) -> ValidationResult
    async def get_cached(job_id) -> Optional[CoverLetter]
```

**Internal:**
- Claude integration
- Prompt templates
- Quality validator
- Cover letter repository

### Analytics Module
**Responsibility:** Metrics, reporting, and insights

**Public Interface:**
```python
class AnalyticsModule:
    async def get_stats(date_range) -> ApplicationStats
    async def get_response_rate(group_by) -> Dict[str, float]
    async def get_top_companies() -> List[CompanyStats]
    async def get_pipeline_summary() -> PipelineSummary
```

**Internal:**
- Stats aggregator
- Report generator
- Analytics repository

---

## Data Flow

### Job Discovery Flow
```
1. Cron Job (daily) → Jobs Module
2. Jobs Module → Adzuna API
3. Jobs Module → Enrich company data
4. Jobs Module → Generate embeddings (Voyage AI)
5. Jobs Module → Store in PostgreSQL + pgvector
6. Jobs Module → Score all new jobs
7. Jobs Module → Update job scores
```

### Application Creation Flow
```
1. User/Agent → Applications Module.create_application(job_id)
2. Applications Module → Jobs Module.get_job(job_id)
3. Applications Module → Resumes Module.select_best_resume(job_id)
4. Applications Module → CoverLetter Module.generate(job_id, tone)
5. Applications Module → Validate ethics checks
6. Applications Module → Store draft application
7. Applications Module → Return Application
```

### Application Submission Flow
```
1. User/Agent → Applications Module.submit_application(app_id)
2. Applications Module → Check rate limits (Redis)
3. Applications Module → Validate ethics (6 checks)
4. Applications Module → Check manual review threshold (90+)
5. If manual review: Applications Module → Flag for review
6. Else: Applications Module → Submit via email/API
7. Applications Module → Update status
8. Applications Module → Log to audit trail
9. Applications Module → Update daily stats
```

---

## Technology Stack

### Backend (Python 3.11+)
- **Framework:** FastAPI (async/await)
- **ORM:** SQLAlchemy 2.0 (async)
- **Validation:** Pydantic v2
- **Task Queue:** Celery + Redis
- **Testing:** pytest + pytest-asyncio

### Frontend (TypeScript)
- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **State:** React Query (TanStack Query)
- **Charts:** Recharts
- **Icons:** Lucide React

### Database
- **Primary:** PostgreSQL 15 + pgvector
- **Cache:** Redis 7
- **Migrations:** Alembic

### External Services
- **LLM:** Anthropic Claude Sonnet 4
- **Embeddings:** Voyage AI (voyage-3-large)
- **Job Search:** Adzuna API
- **Email:** Gmail SMTP

### Infrastructure
- **Hosting:** Railway (single service)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors)
- **Logging:** Structured JSON logs

---

## Deployment Architecture

### Railway Configuration

**Single Service Deployment:**
```yaml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r backend/requirements.txt && cd mcp-server && npm install && npm run build && cd ../dashboard && npm install && npm run build"

[deploy]
startCommand = "uvicorn backend.main:app --host 0.0.0.0 --port $PORT & cd dashboard && npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 10

[[services]]
name = "job-automation"
```

**Environment Variables:**
- All from `.env.example`
- Railway provides: `DATABASE_URL`, `REDIS_URL`, `PORT`

**Cost Estimate:**
- Starter Plan: $5/mo (500 hours)
- Pro Plan: $20/mo (unlimited hours)
- PostgreSQL Plugin: Free (500MB)
- Redis Plugin: Free (25MB)
- **Total: ~$25/mo**

---

## Security Considerations

### Authentication
- Dashboard: JWT tokens (httpOnly cookies)
- API: Bearer tokens
- MCP Server: Stdio (local only)

### Data Protection
- Environment variables for secrets
- Database encryption at rest (Railway)
- HTTPS only (Railway provides SSL)
- Rate limiting on all endpoints

### API Keys
- Stored in environment variables
- Never logged or exposed
- Rotated quarterly

---

## Scalability Path

### Phase 1: MVP (Current)
- Single Railway service
- 20 applications/day
- ~100 jobs/day discovered
- 1-2 concurrent users

### Phase 2: Growth (1,000 apps/day)
- Separate dashboard service
- Dedicated worker service (Celery)
- Managed PostgreSQL (Railway Pro)
- Redis caching layer

### Phase 3: Scale (10,000 apps/day)
- Extract modules to microservices:
  - Job Discovery Service
  - Application Service
  - Cover Letter Service
- API Gateway (Kong/Nginx)
- Message queue (RabbitMQ/SQS)
- Horizontal scaling

---

## Testing Strategy

### Unit Tests
- Domain logic (use cases)
- Scoring algorithms
- Validation rules
- **Coverage target:** 80%+

### Integration Tests
- API endpoints
- Database operations
- External API mocks
- **Coverage target:** 60%+

### E2E Tests
- Critical user flows:
  - Job discovery → scoring → application → submission
  - Dashboard: view jobs → create app → submit
- **Coverage target:** Key paths only

### Performance Tests
- Load testing: 100 concurrent requests
- Database query optimization
- API response times < 500ms

---

## Monitoring & Observability

### Metrics
- Application submission rate
- Job discovery success rate
- API response times
- Database query performance
- Error rates by module

### Logging
- Structured JSON logs
- Log levels: DEBUG, INFO, WARNING, ERROR
- Correlation IDs for request tracing

### Alerts
- Error rate > 5%
- API response time > 1s
- Daily job discovery failure
- Rate limit violations

---

## Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2: Dashboard
cd dashboard
npm run dev

# Terminal 3: Database
docker-compose up postgres redis
```

### Git Workflow
- `main` branch: production-ready
- `develop` branch: integration
- Feature branches: `feature/job-scoring`
- PR required for `main`

### Deployment
- Push to `main` → Railway auto-deploys
- Migrations run automatically
- Zero-downtime deployments

---

## Future Enhancements

### Phase 2 Features
- LinkedIn job scraping
- Greenhouse/Lever API integration
- Resume version A/B testing
- Email response parsing
- Interview scheduling

### Phase 3 Features
- Multi-user support
- Team collaboration
- Custom scoring weights
- Browser extension
- Mobile app

---

**This architecture balances speed (MVP in 2-3 weeks) with quality (production-ready, scalable).**
