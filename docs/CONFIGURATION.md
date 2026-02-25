# Configuration Guide

## User Preferences Applied

Based on your requirements, the system is pre-configured with the following settings:

### Application Settings
- **Daily Limit:** 20 applications/day (conservative start)
- **Minimum Score:** 70/100 (quality threshold)
- **Manual Review:** Jobs scoring 90+ flagged for approval
- **Interval:** 5 minutes between submissions

### Target Companies
**Priority Companies:**
- Pinterest
- Google

**Company Types:**
- Growth startups
- AI startups
- FAANG companies

**Excluded:**
- Consulting firms
- Staffing agencies

### AI Configuration
- **Cover Letters:** Claude Sonnet 4 (Anthropic)
- **Embeddings:** Voyage AI (voyage-3-large, 1024 dimensions)
- **Fallback LLM:** OpenAI GPT-4 (optional)

### Contact Information
- **Email:** e.pyupit@gmail.com
- **SMTP:** Gmail (app password required)

### Job Sources
- **Adzuna API:** Primary source (requires account creation)
- **LinkedIn:** Manual curation only (no scraping)
- **Greenhouse:** Planned for Phase 2
- **Lever:** Planned for Phase 2

### Deployment
- **Platform:** Railway
- **Cost:** ~$25/month
- **Scaling:** Ready for easy horizontal scaling

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required for MVP
DATABASE_URL=postgresql://localhost:5432/job_automation
REDIS_URL=redis://localhost:6379

# Adzuna (create account at https://developer.adzuna.com/)
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key

# Anthropic (for Claude Sonnet 4)
ANTHROPIC_API_KEY=your_anthropic_key

# Voyage AI (for embeddings)
VOYAGE_API_KEY=your_voyage_key

# Gmail SMTP (create app password)
SMTP_USER=e.pyupit@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# Application Settings (pre-configured)
MAX_DAILY_APPLICATIONS=20
MIN_JOB_SCORE=70
MANUAL_REVIEW_THRESHOLD=90
APPLICATION_INTERVAL_SECONDS=300

# Target Companies
TARGET_COMPANIES=Pinterest,Google
COMPANY_TYPES=growth_startup,ai_startup,faang
EXCLUDE_COMPANY_TYPES=consulting,staffing

# Resume Paths
RESUME_PATH=/Users/emmanuel_pacheco/development/personal-website/website/public
RESUME_ENGINEERING_MANAGER=Emmanuel_Yupit_Engineering_Manager.pdf
RESUME_FULLSTACK=Emmanuel_Yupit_FullStack_Engineer.pdf
RESUME_SENIOR=Emmanuel_Yupit_Senior_Engineer.pdf
RESUME_FRONTEND=Emmanuel_Yupit_Frontend_Engineer.pdf

# Feature Flags
ENABLE_AUTO_SUBMIT=false  # Start with manual approval
ENABLE_MANUAL_REVIEW=true  # Flag 90+ scores
DRY_RUN_MODE=true  # Test mode initially
```

---

## API Key Setup

### 1. Adzuna API (Job Discovery)
**Status:** Need to create account

**Steps:**
1. Go to https://developer.adzuna.com/
2. Sign up for free account
3. Create new application
4. Copy `app_id` and `app_key`
5. Add to `.env`:
   ```
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```

**Free Tier:**
- 1,000 calls/month (~33/day)
- Sufficient for MVP

### 2. Anthropic API (Claude Sonnet 4)
**Purpose:** Cover letter generation

**Steps:**
1. Go to https://console.anthropic.com/
2. Sign up and add payment method
3. Create API key
4. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

**Cost Estimate:**
- $3 per million input tokens
- $15 per million output tokens
- ~500 cover letters/month = ~$20/mo

### 3. Voyage AI (Embeddings)
**Purpose:** Semantic job search

**Steps:**
1. Go to https://www.voyageai.com/
2. Sign up for account
3. Create API key
4. Add to `.env`:
   ```
   VOYAGE_API_KEY=pa-...
   ```

**Cost Estimate:**
- voyage-3-large: $0.13 per million tokens
- ~1,000 jobs/month = ~$5/mo

### 4. Gmail App Password (Email Submissions)
**Purpose:** Send application emails

**Steps:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Add to `.env`:
   ```
   SMTP_USER=e.pyupit@gmail.com
   SMTP_PASSWORD=your_16_char_password
   ```

---

## Scoring Configuration

### Default Weights
```python
SCORING_WEIGHTS = {
    "role_match": 0.30,      # 30% - Title alignment
    "tech_stack": 0.25,      # 25% - Required skills
    "company_stage": 0.20,   # 20% - Startup/Growth/FAANG
    "experience_level": 0.15, # 15% - 9 years experience
    "location": 0.10         # 10% - Remote preference
}
```

### Target Roles
```python
TARGET_ROLES = [
    "Engineering Manager",
    "Senior Frontend Engineer",
    "Senior Full-Stack Engineer",
    "Tech Lead",
    "Founding Engineer",
    "Staff Engineer"
]
```

### Required Tech Stack
```python
REQUIRED_SKILLS = [
    "React", "TypeScript", "Node.js",
    "Python", "AWS", "PostgreSQL",
    "Next.js", "FastAPI", "Docker"
]

BONUS_SKILLS = [
    "AI/ML", "LLM", "RAG", "Vector DB",
    "Microservices", "Kubernetes", "Terraform"
]
```

### Company Stage Preferences
```python
COMPANY_STAGE_SCORES = {
    "ai_startup": 100,      # Highest priority
    "growth_startup": 90,
    "faang": 85,
    "enterprise": 70,
    "consulting": 0,        # Excluded
    "staffing": 0           # Excluded
}
```

---

## Rate Limiting Configuration

### Application Submission
```python
# Daily limits
MAX_DAILY_APPLICATIONS = 20
MAX_WEEKLY_APPLICATIONS = 100

# Intervals
MIN_INTERVAL_SECONDS = 300  # 5 minutes between submissions
COMPANY_COOLDOWN_DAYS = 30  # 1 app per company per 30 days

# Burst protection
MAX_CONCURRENT_SUBMISSIONS = 3
```

### API Rate Limits
```python
# Adzuna
ADZUNA_CALLS_PER_DAY = 33
ADZUNA_CACHE_TTL_HOURS = 24

# Anthropic
ANTHROPIC_RPM = 50  # Requests per minute
ANTHROPIC_TPM = 100000  # Tokens per minute

# Voyage AI
VOYAGE_RPM = 300
```

---

## Ethics Configuration

### Validation Checks
```python
ETHICS_CHECKS = {
    "rate_limit": True,           # Enforce daily limit
    "company_cooldown": True,     # 30-day cooldown
    "duplicate_check": True,      # No duplicate apps
    "quality_threshold": True,    # Min score 70
    "cover_letter_quality": True, # Anti-generic checks
    "resume_match": True          # Resume aligns with role
}
```

### Manual Review Triggers
```python
MANUAL_REVIEW_TRIGGERS = {
    "score_threshold": 90,        # Jobs scoring 90+
    "target_companies": True,     # Pinterest, Google
    "faang_companies": True,      # All FAANG
    "c_level_roles": True,        # VP, Director, C-suite
    "first_application": True     # First app to new company
}
```

### Quality Thresholds
```python
QUALITY_THRESHOLDS = {
    "min_cover_letter_words": 200,
    "max_cover_letter_words": 400,
    "max_generic_phrases": 3,
    "min_company_mentions": 1,
    "min_role_mentions": 1
}
```

---

## Dashboard Configuration

### UI Preferences
```python
DASHBOARD_CONFIG = {
    "theme": "light",              # light/dark
    "items_per_page": 20,
    "auto_refresh_seconds": 30,
    "show_scores": True,
    "show_reasoning": True,
    "default_view": "top_matches"  # top_matches/all_jobs/applications
}
```

### Chart Settings
```python
ANALYTICS_CONFIG = {
    "default_date_range": "30_days",
    "chart_type": "line",          # line/bar
    "show_predictions": False,     # Phase 2 feature
    "export_format": "csv"         # csv/json/pdf
}
```

---

## Deployment Configuration

### Railway Settings
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on-failure"

[env]
NODE_ENV = "production"
PYTHON_VERSION = "3.11"
```

### Database Configuration
```python
DATABASE_CONFIG = {
    "pool_size": 20,
    "max_overflow": 10,
    "pool_timeout": 30,
    "pool_recycle": 3600,
    "echo": False  # Set True for SQL logging
}
```

### Redis Configuration
```python
REDIS_CONFIG = {
    "max_connections": 50,
    "socket_timeout": 5,
    "socket_connect_timeout": 5,
    "retry_on_timeout": True,
    "decode_responses": True
}
```

---

## Monitoring Configuration

### Sentry (Error Tracking)
```python
SENTRY_CONFIG = {
    "dsn": "your_sentry_dsn",
    "environment": "production",
    "traces_sample_rate": 0.1,  # 10% of transactions
    "profiles_sample_rate": 0.1
}
```

### Logging
```python
LOGGING_CONFIG = {
    "level": "INFO",              # DEBUG/INFO/WARNING/ERROR
    "format": "json",             # json/text
    "include_request_id": True,
    "log_sql_queries": False,
    "log_api_calls": True
}
```

---

## Testing Configuration

### Test Settings
```python
TEST_CONFIG = {
    "database_url": "postgresql://localhost:5432/job_automation_test",
    "redis_url": "redis://localhost:6379/1",
    "mock_external_apis": True,
    "coverage_threshold": 80
}
```

---

## Customization

### Adjusting Daily Limit
To increase from 20 to 50 applications/day:

```bash
# In .env
MAX_DAILY_APPLICATIONS=50
```

### Changing Score Threshold
To only apply to jobs scoring 80+:

```bash
# In .env
MIN_JOB_SCORE=80
```

### Disabling Manual Review
To auto-submit all applications:

```bash
# In .env
ENABLE_MANUAL_REVIEW=false
MANUAL_REVIEW_THRESHOLD=100  # Effectively disabled
```

### Adding Target Companies
```bash
# In .env
TARGET_COMPANIES=Pinterest,Google,Stripe,Notion,Figma
```

---

## Next Steps

1. **Create API Accounts:**
   - [ ] Adzuna developer account
   - [ ] Anthropic API key
   - [ ] Voyage AI API key
   - [ ] Gmail app password

2. **Configure Environment:**
   - [ ] Copy `.env.example` to `.env`
   - [ ] Add all API keys
   - [ ] Verify resume paths
   - [ ] Test database connection

3. **Test Configuration:**
   ```bash
   python backend/utils/config_validator.py
   # Should validate all settings
   ```

4. **Deploy to Railway:**
   - [ ] Create Railway project
   - [ ] Add environment variables
   - [ ] Deploy and test

---

**Configuration complete! Ready to start job hunting. 🎯**
