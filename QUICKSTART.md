# Quick Start Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+ (or use Docker)

## 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# Required API Keys
ANTHROPIC_API_KEY=your_key_here
VOYAGE_API_KEY=your_key_here
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=e.pyupit@gmail.com
SMTP_PASSWORD=your_app_password
```

## 2. Start with Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Dashboard)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The dashboard will be available at: **http://localhost:3000**
The API will be available at: **http://localhost:8000**

## 3. Manual Setup (Alternative)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
psql -U postgres -d job_automation -f db/schema.sql

# Start the API
python main.py
```

### Dashboard

```bash
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### MCP Server

```bash
cd mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start MCP server
npm start
```

## 4. Verify Installation

1. **Check API health**: http://localhost:8000/health
2. **Open Dashboard**: http://localhost:3000
3. **Check Database**: 
   ```bash
   docker exec -it job-automation-db psql -U postgres -d job_automation -c "SELECT COUNT(*) FROM jobs;"
   ```

## 5. Next Steps

1. **Configure Resume Paths**: Update `.env` with your resume file paths
2. **Set Target Companies**: Edit `TARGET_COMPANIES` in `.env`
3. **Run Job Discovery**: Use the dashboard or MCP tools to discover jobs
4. **Review Applications**: Check the Applications page for pending reviews

## Common Issues

### Port Already in Use
```bash
# Check what's using port 3000 or 8000
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Error
```bash
# Ensure PostgreSQL is running
docker ps | grep postgres

# Check database logs
docker logs job-automation-db
```

### Dashboard Not Loading
```bash
# Reinstall dependencies
cd dashboard
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

1. **Make code changes** in `backend/` or `dashboard/`
2. **Hot reload** is enabled - changes will auto-refresh
3. **View logs**: `docker-compose logs -f backend` or `docker-compose logs -f dashboard`
4. **Run tests**: `pytest` (backend) or `npm test` (dashboard)

## Production Deployment

See `docs/CONFIGURATION.md` for Railway deployment instructions.

## Support

- **Documentation**: See `docs/` folder
- **Architecture**: `docs/ARCHITECTURE.md`
- **Configuration**: `docs/CONFIGURATION.md`
- **Roadmap**: `docs/MVP_ROADMAP.md`
