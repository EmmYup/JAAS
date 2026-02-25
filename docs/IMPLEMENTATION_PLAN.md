# AI-Powered Job Application Automation System

Build an intelligent MCP server and automation pipeline that searches, scores, and applies to relevant job opportunities automatically while maintaining ethical standards and personalizing applications based on role requirements.

---

## Executive Summary

This system will leverage your existing resume strategy, technical expertise, and AI engineering skills to create a sophisticated job application automation platform that:

1. **Discovers** relevant opportunities from multiple sources using job board APIs
2. **Scores** positions based on fit, company type, and target role alignment
3. **Stores** opportunities in a PostgreSQL database with pgvector for semantic search
4. **Personalizes** resume selection and cover letters based on job requirements
5. **Applies** automatically with rate limiting (50/day) and ethical safeguards
6. **Tracks** application status and provides analytics

**Tech Stack:** TypeScript, FastAPI (Python), PostgreSQL + pgvector, MCP Server, OpenAI/Claude APIs

**Timeline:** 2-3 weeks for MVP, 4-6 weeks for production-ready system

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Server Layer                         │
│  (Exposes tools for LLM agents to orchestrate workflow)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Job Discovery Service                       │
│  - Adzuna API (free tier: 1000 calls/month)                 │
│  - LinkedIn Job Search (via scraping or API)                │
│  - Greenhouse/Lever Public Job Boards                       │
│  - YC Jobs, AngelList, Remote.co                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Scoring & Filtering Engine (RAG)               │
│  - Semantic similarity to target roles (pgvector)           │
│  - Keyword matching (title, description, requirements)      │
│  - Company type classification (startup/growth/FAANG)       │
│  - Tech stack alignment score                               │
│  - Experience level match (9 years → Senior/EM level)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL + pgvector DB                     │
│  Tables:                                                     │
│  - jobs (raw job data with embeddings)                      │
│  - applications (tracking + status)                         │
│  - resume_versions (4 PDFs + metadata)                      │
│  - cover_letters (generated + cached)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            Resume Personalization Service                    │
│  - Select best resume (EM/Full-Stack/Senior/Frontend)       │
│  - Generate tailored cover letter (Claude Sonnet)           │
│  - Optional: Customize resume summary for specific role     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Application Submission Service                  │
│  - Rate limiting: 50 applications/day                       │
│  - Email-based applications (SMTP)                          │
│  - Greenhouse API submissions (where available)             │
│  - Application tracker with status updates                  │
│  - Ethics checks (no spam, transparency flags)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Design

### 1. MCP Server (TypeScript + Streamable HTTP)

**Purpose:** Expose tools for LLM agents to orchestrate the entire workflow

**Tools to Implement:**

```typescript
// Job Discovery
- search_jobs(keywords, location, remote_only, page)
- refresh_job_listings(force_update)
- get_job_sources()

// Scoring & Filtering
- score_job(job_id)
- filter_jobs(min_score, role_type, company_stage, tech_stack)
- get_top_matches(limit, filters)

// Application Management
- create_application(job_id, resume_version, custom_notes)
- submit_application(application_id)
- batch_submit_applications(application_ids, max_per_day)
- get_application_status(application_id)
- list_applications(status, date_range)

// Resume & Cover Letter
- select_best_resume(job_id)
- generate_cover_letter(job_id, tone, length)
- customize_resume_summary(job_id, resume_version)

// Analytics
- get_application_stats()
- get_response_rate()
- get_top_companies_applied()
```

**Why MCP Server?**
- Enables LLM agents (Claude, GPT-4) to autonomously manage job search
- Composable tools allow flexible workflows
- Can be used from CLI, web UI, or integrated into other systems
- Stateless HTTP transport = scalable and maintainable

**Implementation:**
- Use TypeScript SDK (recommended by mcp-builder skill)
- Streamable HTTP for remote access
- Zod schemas for input validation
- Output schemas for structured responses
- Error handling with actionable messages

---

### 2. Job Discovery Service (Python FastAPI)

**Data Sources:**

**Primary (Free/Low-Cost):**
1. **Adzuna API** (Free tier: 1000 calls/month)
   - Coverage: USA, UK, Canada, and 20+ countries
   - Provides: job title, company, location, description, salary, URL
   - Rate limit: ~33 jobs/day to stay within free tier
   
2. **Greenhouse Public Job Boards**
   - Many companies expose their job boards via Greenhouse API
   - No authentication required for public listings
   - Example: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`

3. **Lever Public Job Boards**
   - Similar to Greenhouse, many companies use Lever
   - Example: `https://api.lever.co/v0/postings/{company}`

4. **YC Jobs** (Web scraping with consent)
   - Target: YC-backed startups (high-quality early-stage companies)
   - https://www.ycombinator.com/jobs

5. **AngelList/Wellfound API** (if available)
   - Startup-focused job board
   - Good for Founding Engineer, Tech Lead roles

**Secondary (Manual curation):**
- LinkedIn Job Search (manual or limited scraping)
- Remote.co, We Work Remotely, Remotive
- FAANG career pages (Google, Meta, Amazon, Pinterest)

**Implementation:**
```python
class JobDiscoveryService:
    async def fetch_adzuna_jobs(self, keywords: list[str], location: str) -> list[Job]
    async def fetch_greenhouse_jobs(self, company_list: list[str]) -> list[Job]
    async def fetch_lever_jobs(self, company_list: list[str]) -> list[Job]
    async def scrape_yc_jobs(self) -> list[Job]  # With rate limiting
    
    async def enrich_job(self, job: Job) -> Job:
        # Add company info, funding stage, tech stack from Crunchbase/LinkedIn
        pass
```

**Ethical Considerations:**
- Respect robots.txt for web scraping
- Rate limiting on all APIs (stay well below limits)
- Cache results to avoid redundant requests
- Attribute data sources properly

---

### 3. Scoring & Filtering Engine (RAG-Based)

**Purpose:** Rank jobs by fit using semantic search + rule-based scoring

**Scoring Dimensions:**

```python
class JobScore(BaseModel):
    overall_score: float  # 0-100
    
    # Component scores (weighted)
    role_match: float  # 30% - Title matches target roles
    tech_stack_match: float  # 25% - Required skills alignment
    company_stage_match: float  # 20% - Startup/Growth/FAANG preference
    experience_level_match: float  # 15% - 9 years → Senior/EM
    location_match: float  # 10% - Remote/Mexico/Relocation
    
    # Metadata
    reasoning: str
    matched_keywords: list[str]
    red_flags: list[str]  # e.g., "requires 15+ years", "on-site only"
```

**RAG Implementation:**
1. **Embeddings:** Use voyage-3-large for job descriptions
2. **Vector DB:** pgvector extension on PostgreSQL
3. **Retrieval:** Hybrid search (semantic + keyword)
4. **Reranking:** Claude-based scoring for final ranking

**Filtering Rules:**
```python
TARGET_ROLES = [
    "Engineering Manager",
    "Senior Full-Stack Engineer",
    "Senior Frontend Engineer", 
    "Tech Lead",
    "Founding Engineer",
    "Software Engineer (L4/L5)"  # FAANG only
]

REQUIRED_KEYWORDS = [
    "React", "TypeScript", "Node.js", "AWS", "Remote"
]

DISQUALIFIERS = [
    "15+ years required",
    "PhD required",
    "On-site only (non-FAANG)",
    "Security clearance required"
]

COMPANY_STAGES = {
    "startup": ["Seed", "Series A", "Series B"],
    "growth": ["Series C", "Series D", "Series E"],
    "faang": ["Google", "Meta", "Amazon", "Apple", "Netflix", "Pinterest", "LinkedIn"]
}
```

**Resume Mapping Logic:**
```python
def select_resume_version(job: Job) -> str:
    role_title = job.title.lower()
    company_stage = job.company_stage
    
    if "engineering manager" in role_title or "em" in role_title:
        return "Emmanuel_Yupit_Engineering_Manager.pdf"
    
    elif "tech lead" in role_title:
        if company_stage == "startup":
            return "Emmanuel_Yupit_FullStack_Engineer.pdf"
        else:
            return "Emmanuel_Yupit_Engineering_Manager.pdf"
    
    elif "founding engineer" in role_title:
        return "Emmanuel_Yupit_FullStack_Engineer.pdf"
    
    elif "frontend" in role_title or "ui" in role_title:
        return "Emmanuel_Yupit_Frontend_Engineer.pdf"
    
    elif "full stack" in role_title or "full-stack" in role_title:
        return "Emmanuel_Yupit_FullStack_Engineer.pdf"
    
    elif company_stage == "faang":
        return "Emmanuel_Yupit_Senior_Engineer.pdf"
    
    else:
        return "Emmanuel_Yupit_FullStack_Engineer.pdf"  # Default: most versatile
```

---

### 4. PostgreSQL + pgvector Database Schema

```sql
-- Extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Job listings table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE,  -- Source API ID
    source VARCHAR(50) NOT NULL,  -- 'adzuna', 'greenhouse', 'yc', etc.
    
    -- Core job data
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    remote BOOLEAN DEFAULT false,
    url TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    posted_date TIMESTAMP,
    
    -- Enriched data
    company_stage VARCHAR(50),  -- 'startup', 'growth', 'faang'
    tech_stack TEXT[],  -- Array of technologies
    
    -- Embeddings (1024 dimensions for voyage-3-large)
    description_embedding vector(1024),
    requirements_embedding vector(1024),
    
    -- Scoring
    overall_score FLOAT,
    role_match_score FLOAT,
    tech_stack_score FLOAT,
    company_stage_score FLOAT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_score (overall_score DESC),
    INDEX idx_company (company),
    INDEX idx_posted_date (posted_date DESC)
);

-- Vector similarity index
CREATE INDEX ON jobs USING ivfflat (description_embedding vector_cosine_ops);
CREATE INDEX ON jobs USING ivfflat (requirements_embedding vector_cosine_ops);

-- Applications tracking
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    
    -- Application data
    resume_version VARCHAR(100),  -- Which PDF was used
    cover_letter_id UUID REFERENCES cover_letters(id),
    custom_notes TEXT,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'draft',  -- draft, submitted, interview, rejected, offer
    submitted_at TIMESTAMP,
    response_date TIMESTAMP,
    
    -- Submission details
    submission_method VARCHAR(50),  -- 'email', 'greenhouse', 'lever', 'manual'
    submission_url TEXT,
    contact_email VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(job_id)  -- One application per job
);

-- Cover letters (cached and reusable)
CREATE TABLE cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    
    -- Content
    content TEXT NOT NULL,
    tone VARCHAR(50) DEFAULT 'professional',  -- professional, enthusiastic, technical
    
    -- Generation metadata
    model_used VARCHAR(50),  -- 'claude-sonnet-4', 'gpt-4', etc.
    prompt_version VARCHAR(20),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW()
);

-- Resume versions (store metadata, not PDFs)
CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    
    -- Metadata
    target_roles TEXT[],
    highlights TEXT[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Application statistics (for analytics)
CREATE TABLE application_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    
    applications_submitted INTEGER DEFAULT 0,
    interviews_received INTEGER DEFAULT 0,
    offers_received INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5. Resume Personalization Service (Python)

**Cover Letter Generation:**

```python
from anthropic import AsyncAnthropic
from typing import Literal

class CoverLetterGenerator:
    def __init__(self):
        self.client = AsyncAnthropic()
        self.model = "claude-sonnet-4-20250514"
    
    async def generate(
        self,
        job: Job,
        resume_version: str,
        tone: Literal["professional", "enthusiastic", "technical"] = "professional"
    ) -> str:
        """Generate tailored cover letter using Claude."""
        
        prompt = f"""Generate a concise, impactful cover letter for this job application.

Job Details:
- Title: {job.title}
- Company: {job.company}
- Description: {job.description}

Candidate Profile:
- Name: Emmanuel Yupit
- Email: e.pyupit@gmail.com
- Phone: +529981546160
- Years of Experience: 9 years
- Current Role: Engineering Manager at Vetted Health (Contractor since Jun 2024)
- Previous: Senior Software Engineer at EPAM Systems (May 2022 - Aug 2025)
- Resume Version: {resume_version}

Key Achievements:
- Led team of 7 engineers with 25% velocity improvement and zero attrition
- Built systems serving 150k users with 99.9% uptime and $20M ARR
- Reduced costs by 95% ($50k/year) with feature flag platform
- 40% latency reduction on APIs handling 100k+ daily requests

Target Roles: Engineering Manager, Senior Full-Stack, Tech Lead, Founding Engineer

Instructions:
1. Keep it to 3-4 paragraphs (250-300 words max)
2. Tone: {tone}
3. Focus on specific achievements that match job requirements
4. Mention the 14-month overlap (Jun 2024-Aug 2025) managing both roles successfully
5. Express genuine interest in the company/role
6. Include a clear call to action
7. Do NOT use clichés like "I'm writing to express my interest"
8. Be authentic and conversational

Cover Letter:"""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
```

**Resume Summary Customization (Optional):**

For high-priority roles, dynamically update the professional summary in the PDF to match specific job requirements. This requires PDF manipulation (reportlab or pypdf).

---

### 6. Application Submission Service (Python)

**Submission Methods:**

1. **Email-based applications** (most common)
   - Use SMTP to send resume + cover letter
   - Support for attachments (PDF)
   - Track email delivery status

2. **Greenhouse API submissions**
   - POST to `/v1/boards/{company}/jobs/{job_id}/applications`
   - Include resume, cover letter, and form fields
   - Requires job-specific form data

3. **Lever API submissions**
   - Similar to Greenhouse
   - POST to `/v0/postings/{company}/{job_id}/apply`

4. **Manual flag**
   - For complex applications, flag for manual submission
   - Store application draft for user review

**Rate Limiting & Ethics:**

```python
from datetime import datetime, timedelta
from typing import Optional

class ApplicationSubmitter:
    MAX_DAILY_SUBMISSIONS = 50
    MIN_INTERVAL_SECONDS = 300  # 5 minutes between submissions
    
    async def submit_batch(
        self,
        application_ids: list[str],
        dry_run: bool = False
    ) -> dict[str, str]:
        """Submit applications with rate limiting and ethics checks."""
        
        # Check daily limit
        today = datetime.now().date()
        submitted_today = await self.db.count_submissions(date=today)
        
        if submitted_today >= self.MAX_DAILY_SUBMISSIONS:
            raise RateLimitError(f"Daily limit of {self.MAX_DAILY_SUBMISSIONS} reached")
        
        # Calculate remaining quota
        remaining = self.MAX_DAILY_SUBMISSIONS - submitted_today
        batch_size = min(len(application_ids), remaining)
        
        results = {}
        for app_id in application_ids[:batch_size]:
            # Ethics checks
            if not await self.passes_ethics_check(app_id):
                results[app_id] = "failed_ethics_check"
                continue
            
            # Submit
            if not dry_run:
                status = await self.submit_application(app_id)
                results[app_id] = status
                
                # Rate limiting: wait between submissions
                await asyncio.sleep(self.MIN_INTERVAL_SECONDS)
            else:
                results[app_id] = "dry_run_success"
        
        return results
    
    async def passes_ethics_check(self, app_id: str) -> bool:
        """Verify application meets ethical standards."""
        app = await self.db.get_application(app_id)
        job = await self.db.get_job(app.job_id)
        
        # Check 1: Not already applied to this company recently
        recent_apps = await self.db.get_recent_applications(
            company=job.company,
            days=30
        )
        if len(recent_apps) > 0:
            logger.warning(f"Already applied to {job.company} in last 30 days")
            return False
        
        # Check 2: Cover letter is personalized (not generic)
        cover_letter = await self.db.get_cover_letter(app.cover_letter_id)
        if self.is_generic_cover_letter(cover_letter.content):
            logger.warning(f"Cover letter too generic for {job.title}")
            return False
        
        # Check 3: Resume version matches role type
        expected_resume = select_resume_version(job)
        if app.resume_version != expected_resume:
            logger.warning(f"Resume mismatch: using {app.resume_version}, expected {expected_resume}")
            # Allow but log warning
        
        return True
    
    def is_generic_cover_letter(self, content: str) -> bool:
        """Check if cover letter is too generic."""
        generic_phrases = [
            "I am writing to express my interest",
            "I am excited to apply",
            "Please find my resume attached",
            "I look forward to hearing from you"
        ]
        
        generic_count = sum(1 for phrase in generic_phrases if phrase.lower() in content.lower())
        return generic_count >= 3  # Too many generic phrases
```

**Transparency & Compliance:**

- Include AI disclosure in cover letters: "This cover letter was drafted with AI assistance and reviewed for accuracy."
- Provide opt-out mechanism in emails
- Respect "Do Not Contact" preferences
- Log all submissions for audit trail
- GDPR/CCPA compliance: don't store unnecessary personal data

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goals:** Database setup, job discovery, basic scoring

**Tasks:**
1. ✅ Set up PostgreSQL with pgvector extension
2. ✅ Create database schema (jobs, applications, cover_letters, resume_versions)
3. ✅ Implement Adzuna API integration
4. ✅ Implement Greenhouse/Lever public job board scrapers
5. ✅ Create embedding service (voyage-3-large)
6. ✅ Implement basic scoring algorithm
7. ✅ Seed database with resume metadata

**Deliverables:**
- PostgreSQL database with sample job data
- Job discovery service with 3 sources
- Basic scoring (role match + tech stack)

---

### Phase 2: MCP Server (Week 2-3)

**Goals:** Build MCP server with core tools, test with Claude

**Tasks:**
1. ✅ Set up TypeScript MCP project (SDK, tsconfig, package.json)
2. ✅ Implement job discovery tools (`search_jobs`, `refresh_job_listings`)
3. ✅ Implement scoring/filtering tools (`score_job`, `filter_jobs`, `get_top_matches`)
4. ✅ Implement application tools (`create_application`, `get_application_status`)
5. ✅ Test with MCP Inspector
6. ✅ Write evaluations (10 complex questions)

**Deliverables:**
- Functioning MCP server with 12+ tools
- Zod schemas for all inputs/outputs
- Comprehensive error handling
- Evaluation suite

---

### Phase 3: AI Integration (Week 3-4)

**Goals:** Cover letter generation, resume selection, submission logic

**Tasks:**
1. ✅ Implement cover letter generator (Claude Sonnet)
2. ✅ Implement resume selection logic
3. ✅ Create application submission service
4. ✅ Add rate limiting and ethics checks
5. ✅ Test email-based submissions
6. ✅ Implement Greenhouse API submissions

**Deliverables:**
- Cover letter generator with 3 tone options
- Automated resume selection
- Submission service with rate limiting
- Ethics validation layer

---

### Phase 4: Orchestration & Automation (Week 4-5)

**Goals:** End-to-end automation, batch processing, monitoring

**Tasks:**
1. ✅ Create daily job discovery cron job
2. ✅ Create batch application submission workflow
3. ✅ Implement application tracker dashboard (simple web UI)
4. ✅ Add analytics (response rate, top companies, etc.)
5. ✅ Set up monitoring and alerting
6. ✅ Create user documentation

**Deliverables:**
- Automated daily workflow
- Web dashboard for tracking
- Analytics dashboard
- User guide

---

### Phase 5: Production Hardening (Week 5-6)

**Goals:** Security, scalability, reliability

**Tasks:**
1. ✅ Add authentication to MCP server (API keys)
2. ✅ Implement request logging and audit trail
3. ✅ Add error recovery and retry logic
4. ✅ Optimize database queries (indexes, materialized views)
5. ✅ Deploy to production (AWS/GCP/Railway)
6. ✅ Set up CI/CD pipeline
7. ✅ Load testing and performance optimization

**Deliverables:**
- Production-ready system
- Deployment documentation
- Backup and recovery procedures

---

## Technology Stack

### Core Technologies

**Backend:**
- **MCP Server:** TypeScript + MCP SDK + Streamable HTTP
- **API Services:** Python 3.11 + FastAPI + asyncio
- **Database:** PostgreSQL 15 + pgvector extension
- **Embeddings:** Voyage AI (voyage-3-large)
- **LLMs:** Claude Sonnet 4 (cover letters), GPT-4 (fallback)

**Infrastructure:**
- **Hosting:** Railway (simple deploy) or AWS (scalable)
- **Queue:** Redis (for rate limiting and job scheduling)
- **Cron:** GitHub Actions or Celery
- **Monitoring:** Sentry (errors) + Grafana (metrics)

**Frontend (Optional):**
- **Dashboard:** Next.js 14 + Tailwind CSS (reuse existing website stack)
- **Charts:** Recharts or Chart.js

---

## Ethical Considerations & Safeguards

### Principles

1. **Transparency:** Disclose AI usage in applications
2. **Quality over Quantity:** Personalized applications, not spam
3. **Respect:** Honor rate limits, robots.txt, and ToS
4. **Privacy:** Minimal data collection, GDPR/CCPA compliant
5. **Fairness:** No bias in job selection or application

### Safeguards

**Rate Limiting:**
- 50 applications/day maximum
- 5-minute intervals between submissions
- 1 application per company per 30 days

**Quality Checks:**
- Cover letter must be personalized (not generic)
- Resume must match role type
- Score threshold: minimum 70/100 to apply

**Compliance:**
- AI disclosure in cover letters
- Opt-out mechanism in emails
- Audit trail for all submissions
- Data retention policy (90 days)

**Human Oversight:**
- Weekly review of top applications
- Manual approval for FAANG roles
- Flag system for user review

---

## Success Metrics

### Application Metrics
- **Volume:** 50 applications/day = 1,500/month
- **Quality:** Average score ≥ 75/100
- **Response Rate:** Target 10-20% (industry average)
- **Interview Rate:** Target 5-10%
- **Offer Rate:** Target 1-3%

### System Metrics
- **Uptime:** 99.9%
- **Job Discovery:** 100+ new jobs/day
- **Scoring Speed:** < 2 seconds per job
- **Submission Success:** 95%+

### ROI Metrics
- **Time Saved:** 40+ hours/month (manual applications)
- **Cost:** < $100/month (APIs + hosting)
- **Opportunities:** 10x more applications than manual

---

## Risks & Mitigation

### Risk 1: API Rate Limits

**Mitigation:**
- Use free tiers conservatively (Adzuna: 33/day)
- Implement caching (24-hour TTL for job listings)
- Diversify sources (5+ job boards)

### Risk 2: Application Rejection/Blacklisting

**Mitigation:**
- Quality checks before submission
- Rate limiting per company
- Manual review for high-priority roles
- Transparent AI disclosure

### Risk 3: Poor Response Rate

**Mitigation:**
- Continuous scoring algorithm improvement
- A/B testing cover letter templates
- Resume optimization based on feedback
- Focus on quality over quantity

### Risk 4: Legal/Compliance Issues

**Mitigation:**
- Legal review of ToS for each platform
- GDPR/CCPA compliance from day 1
- Clear attribution of data sources
- Opt-out mechanism

---

## Cost Estimation

### Monthly Costs (Production)

**APIs:**
- Adzuna: $0 (free tier)
- Voyage AI Embeddings: $20 (5M tokens)
- Claude Sonnet 4: $40 (500 cover letters @ $0.08 each)
- OpenAI (fallback): $10

**Infrastructure:**
- Railway/AWS: $25 (PostgreSQL + API hosting)
- Redis: $10
- Domain/SSL: $2

**Total: ~$107/month**

**Break-even:** 1 job offer saves 100+ hours of manual searching and applying. System pays for itself immediately.

---

## Questions for User

Before implementing, please confirm:

1. **API Access:** Do you have Adzuna API key? (Free registration at developer.adzuna.com)

2. **LLM Preference:** Claude Sonnet 4 for cover letters, or GPT-4? (Both work, Claude tends to be more natural)

3. **Target Companies:** Any specific companies to prioritize or avoid?

4. **Application Frequency:** 50/day is aggressive. Start with 20/day for testing?

5. **Manual Review:** Should high-scoring roles (90+) be flagged for manual review before auto-submit?

6. **Email Setup:** Use personal email (e.pyupit@gmail.com) or create dedicated job-search email?

7. **LinkedIn:** Scrape LinkedIn (risky) or manual curation of LinkedIn jobs?

8. **Hosting:** Railway (simple, $25/mo) or AWS (complex, scalable, $40+/mo)?

9. **Dashboard:** Web UI needed immediately, or focus on MCP server first?

10. **Timeline:** 2-3 weeks for MVP acceptable? Or need faster/slower?

---

## Next Steps

Once you confirm the plan:

1. **Week 1:** Set up PostgreSQL, implement Adzuna API, create scoring algorithm
2. **Week 2:** Build MCP server, test with Claude Desktop
3. **Week 3:** Add cover letter generation, resume selection
4. **Week 4:** Implement submission service, test with 5-10 applications
5. **Week 5:** Deploy to production, monitor results
6. **Week 6:** Optimize based on real-world performance

**First Milestone:** 100 quality applications submitted within 30 days

---

## References

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Adzuna API Docs](https://developer.adzuna.com/)
- [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Voyage AI Embeddings](https://docs.voyageai.com/)
- [Ethical Job Application Automation](https://www.resumly.ai/blog/is-automated-job-application-ethical)
