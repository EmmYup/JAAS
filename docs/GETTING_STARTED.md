# Getting Started with AI Job Application System

This guide will walk you through setting up and running the AI-powered job application automation system.

## Prerequisites

### Required Software
- **Node.js** 20+ (for MCP server)
- **Python** 3.11+ (for backend services)
- **PostgreSQL** 15+ (for database)
- **Redis** (for rate limiting and caching)

### Required API Keys
- **Adzuna API** - Free tier (1000 calls/month)
  - Sign up at: https://developer.adzuna.com/
- **Voyage AI** - For embeddings
  - Sign up at: https://www.voyageai.com/
- **Anthropic** - For Claude Sonnet 4
  - Sign up at: https://www.anthropic.com/
- **OpenAI** (optional) - Fallback LLM
  - Sign up at: https://platform.openai.com/

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/EmmYup/ai-job-application-system.git
cd ai-job-application-system
```

### 2. Install PostgreSQL with pgvector

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew install pgvector
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql-15 postgresql-contrib
# Install pgvector from source or package
```

**Docker (Alternative):**
```bash
docker run -d \
  --name job-automation-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=job_automation \
  -p 5432:5432 \
  ankane/pgvector
```

### 3. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d --name redis -p 6379:6379 redis:7
```

### 4. Set Up Database

```bash
# Create database
createdb job_automation

# Run schema
psql job_automation < backend/db/schema.sql

# Verify pgvector is installed
psql job_automation -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 5. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

**Required variables:**
```env
DATABASE_URL=postgresql://localhost:5432/job_automation
REDIS_URL=redis://localhost:6379

ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here

VOYAGE_API_KEY=your_voyage_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

RESUME_PATH=/absolute/path/to/your/resumes
```

### 6. Install Python Dependencies

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 7. Install MCP Server Dependencies

```bash
cd ../mcp-server

# Install Node packages
npm install

# Build TypeScript
npm run build
```

---

## Running the System

### Start Backend API

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### Start MCP Server

```bash
cd mcp-server
npm start
```

### Test with MCP Inspector

```bash
cd mcp-server
npx @modelcontextprotocol/inspector dist/index.js
```

This opens a web UI to test MCP tools interactively.

---

## First Steps

### 1. Verify Database Connection

```bash
cd backend
python -c "from services.job_discovery import JobDiscoveryService; import asyncio; asyncio.run(JobDiscoveryService().close())"
```

### 2. Test Job Discovery

```bash
cd backend
python services/job_discovery.py
```

This should fetch some jobs from Adzuna.

### 3. Test MCP Tools

Open MCP Inspector and try:

```javascript
// Search for jobs
{
  "tool": "search_jobs",
  "arguments": {
    "keywords": ["Software Engineer", "React"],
    "location": "Remote",
    "remote_only": true,
    "limit": 10
  }
}

// Get job sources
{
  "tool": "get_job_sources",
  "arguments": {}
}
```

### 4. Run Daily Job Discovery (Optional)

```bash
cd scripts
python daily_job_discovery.py
```

---

## Usage Examples

### CLI: Search and Score Jobs

```bash
# Search for specific roles
python scripts/search_jobs.py \
  --role "Senior Frontend Engineer" \
  --tech "React,TypeScript,AWS" \
  --remote \
  --min-score 75

# View top matches
python scripts/get_top_matches.py --limit 20

# Create applications
python scripts/create_applications.py \
  --job-ids job-uuid-1,job-uuid-2 \
  --tone professional
```

### MCP: Autonomous Agent

Use with Claude Desktop or any MCP client:

```javascript
// Find and apply to top jobs automatically
const jobs = await mcp.call("search_jobs", {
  keywords: ["Engineering Manager", "Tech Lead"],
  remote_only: true
});

const topMatches = await mcp.call("get_top_matches", {
  limit: 5,
  filters: { min_score: 80 }
});

for (const job of topMatches) {
  await mcp.call("create_application", {
    job_id: job.id,
    cover_letter_tone: "professional"
  });
}

// Submit with rate limiting
await mcp.call("batch_submit_applications", {
  application_ids: [...],
  max_per_day: 20,
  dry_run: false
});
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql $DATABASE_URL
```

### pgvector Not Found

```bash
# Install pgvector extension
psql job_automation -c "CREATE EXTENSION vector;"

# Verify installation
psql job_automation -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### API Rate Limits

- **Adzuna**: Free tier = 1000 calls/month (~33/day)
- **Voyage AI**: Check your plan limits
- **Anthropic**: Monitor usage in dashboard

**Solution:** Use caching and reduce query frequency.

### MCP Server Won't Start

```bash
# Check Node version
node --version  # Should be 20+

# Rebuild TypeScript
cd mcp-server
rm -rf dist
npm run build
npm start
```

### Python Import Errors

```bash
# Verify virtual environment is activated
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## Next Steps

1. **Configure Resume Paths**: Update `RESUME_PATH` in `.env` to point to your PDF resumes
2. **Test Cover Letter Generation**: Ensure Anthropic API key is working
3. **Set Up Cron Jobs**: Automate daily job discovery
4. **Customize Scoring**: Adjust scoring weights in backend/services/scoring_engine.py
5. **Deploy to Production**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Development

### Running Tests

```bash
# Python tests
cd backend
pytest

# MCP server tests
cd mcp-server
npm test
```

### Code Quality

```bash
# Lint TypeScript
cd mcp-server
npm run lint

# Format Python
cd backend
black .
```

---

## Support

- **Issues**: https://github.com/EmmYup/ai-job-application-system/issues
- **Discussions**: https://github.com/EmmYup/ai-job-application-system/discussions
- **Email**: e.pyupit@gmail.com

---

**Ready to automate your job search! 🚀**
