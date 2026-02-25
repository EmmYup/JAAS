-- PostgreSQL Schema for AI Job Application System
-- Requires PostgreSQL 15+ with pgvector extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS application_stats CASCADE;
DROP TABLE IF EXISTS cover_letters CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS resume_versions CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Jobs table: stores all discovered job opportunities
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50) NOT NULL,
    
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
    company_stage VARCHAR(50),
    tech_stack TEXT[],
    
    -- Embeddings for semantic search (1024 dimensions for voyage-3-large)
    description_embedding vector(1024),
    requirements_embedding vector(1024),
    
    -- Scoring results
    overall_score FLOAT,
    role_match_score FLOAT,
    tech_stack_score FLOAT,
    company_stage_score FLOAT,
    experience_level_score FLOAT,
    location_score FLOAT,
    
    -- Additional metadata
    matched_keywords TEXT[],
    red_flags TEXT[],
    reasoning TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for jobs table
CREATE INDEX idx_jobs_score ON jobs(overall_score DESC NULLS LAST);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC NULLS LAST);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_remote ON jobs(remote) WHERE remote = true;

-- Vector similarity indexes (IVFFlat for fast approximate search)
CREATE INDEX idx_jobs_description_embedding ON jobs 
    USING ivfflat (description_embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX idx_jobs_requirements_embedding ON jobs 
    USING ivfflat (requirements_embedding vector_cosine_ops)
    WITH (lists = 100);

-- Resume versions table: metadata about available resume PDFs
CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    
    -- Metadata
    target_roles TEXT[] NOT NULL,
    highlights TEXT[],
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed resume versions
INSERT INTO resume_versions (name, file_path, target_roles, highlights, description) VALUES
(
    'Emmanuel_Yupit_Engineering_Manager.pdf',
    '/Users/emmanuel_pacheco/development/personal-website/website/public/Emmanuel_Yupit_Engineering_Manager.pdf',
    ARRAY['Engineering Manager', 'Tech Lead', 'Founding Engineer'],
    ARRAY['Led team of 7 engineers', '25% velocity improvement', '95% cost reduction', 'Zero attrition rate'],
    'Leadership-focused resume highlighting team management, hiring, and technical strategy'
),
(
    'Emmanuel_Yupit_FullStack_Engineer.pdf',
    '/Users/emmanuel_pacheco/development/personal-website/website/public/Emmanuel_Yupit_FullStack_Engineer.pdf',
    ARRAY['Senior Full-Stack', 'Tech Lead', 'Founding Engineer', 'Software Engineer'],
    ARRAY['React, Node.js, TypeScript', '150k+ active users', '$20M ARR systems', 'Event-driven architecture'],
    'Technical depth across frontend, backend, and infrastructure with scale metrics'
),
(
    'Emmanuel_Yupit_Senior_Engineer.pdf',
    '/Users/emmanuel_pacheco/development/personal-website/website/public/Emmanuel_Yupit_Senior_Engineer.pdf',
    ARRAY['Senior Engineer', 'Software Engineer', 'Tech Lead'],
    ARRAY['Distributed systems', '100k+ daily requests', '40% latency reduction', 'Multi-million $ impact'],
    'Balanced technical resume emphasizing backend systems, scale, and problem-solving'
),
(
    'Emmanuel_Yupit_Frontend_Engineer.pdf',
    '/Users/emmanuel_pacheco/development/personal-website/website/public/Emmanuel_Yupit_Frontend_Engineer.pdf',
    ARRAY['Senior Frontend', 'Frontend Engineer', 'Software Engineer'],
    ARRAY['React, Next.js, Vite', 'Micro-frontends', 'Performance optimization', 'Component libraries'],
    'UI/UX focused resume emphasizing React expertise and frontend architecture'
);

-- Cover letters table: cached generated cover letters
CREATE TABLE cover_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    tone VARCHAR(50) DEFAULT 'professional',
    
    -- Generation metadata
    model_used VARCHAR(50) NOT NULL,
    prompt_version VARCHAR(20),
    generation_time_ms INTEGER,
    
    -- Quality checks
    is_generic BOOLEAN DEFAULT false,
    word_count INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cover_letters_job_id ON cover_letters(job_id);

-- Applications table: tracking all job applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Application data
    resume_version VARCHAR(100) NOT NULL,
    cover_letter_id UUID REFERENCES cover_letters(id) ON DELETE SET NULL,
    custom_notes TEXT,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    response_date TIMESTAMP,
    
    -- Submission details
    submission_method VARCHAR(50),
    submission_url TEXT,
    contact_email VARCHAR(255),
    
    -- Ethics and quality
    ethics_check_passed BOOLEAN DEFAULT false,
    quality_score FLOAT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(job_id)
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at DESC NULLS LAST);
CREATE INDEX idx_applications_job_id ON applications(job_id);

-- Application stats table: daily aggregated statistics
CREATE TABLE application_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    
    -- Volume metrics
    applications_submitted INTEGER DEFAULT 0,
    interviews_received INTEGER DEFAULT 0,
    offers_received INTEGER DEFAULT 0,
    rejections_received INTEGER DEFAULT 0,
    
    -- Quality metrics
    avg_job_score FLOAT,
    avg_response_time_days FLOAT,
    
    -- Source breakdown
    applications_by_source JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_application_stats_date ON application_stats(date DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_versions_updated_at BEFORE UPDATE ON resume_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_stats_updated_at BEFORE UPDATE ON application_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View: Application pipeline summary
CREATE OR REPLACE VIEW application_pipeline AS
SELECT 
    status,
    COUNT(*) as count,
    ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(response_date, NOW()) - submitted_at)) / 86400)::numeric, 1) as avg_days_to_response
FROM applications
WHERE submitted_at IS NOT NULL
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'offer' THEN 1
        WHEN 'interview' THEN 2
        WHEN 'submitted' THEN 3
        WHEN 'rejected' THEN 4
        ELSE 5
    END;

-- View: Top companies by application count
CREATE OR REPLACE VIEW top_companies AS
SELECT 
    j.company,
    COUNT(a.id) as application_count,
    ROUND(AVG(j.overall_score)::numeric, 1) as avg_score,
    COUNT(CASE WHEN a.status = 'interview' THEN 1 END) as interviews,
    COUNT(CASE WHEN a.status = 'offer' THEN 1 END) as offers
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.company
ORDER BY application_count DESC
LIMIT 20;

-- View: Resume performance
CREATE OR REPLACE VIEW resume_performance AS
SELECT 
    a.resume_version,
    COUNT(a.id) as applications,
    COUNT(CASE WHEN a.status = 'interview' THEN 1 END) as interviews,
    COUNT(CASE WHEN a.status = 'offer' THEN 1 END) as offers,
    ROUND((COUNT(CASE WHEN a.status = 'interview' THEN 1 END)::float / NULLIF(COUNT(a.id), 0) * 100)::numeric, 1) as interview_rate,
    ROUND((COUNT(CASE WHEN a.status = 'offer' THEN 1 END)::float / NULLIF(COUNT(a.id), 0) * 100)::numeric, 1) as offer_rate
FROM applications a
WHERE a.submitted_at IS NOT NULL
GROUP BY a.resume_version
ORDER BY applications DESC;

-- Comments for documentation
COMMENT ON TABLE jobs IS 'Stores all discovered job opportunities with embeddings for semantic search';
COMMENT ON TABLE resume_versions IS 'Metadata about available resume PDF versions';
COMMENT ON TABLE cover_letters IS 'Generated cover letters cached for reuse';
COMMENT ON TABLE applications IS 'Tracks all job applications and their status';
COMMENT ON TABLE application_stats IS 'Daily aggregated application statistics';

COMMENT ON COLUMN jobs.description_embedding IS 'Vector embedding of job description (voyage-3-large, 1024 dimensions)';
COMMENT ON COLUMN jobs.requirements_embedding IS 'Vector embedding of job requirements (voyage-3-large, 1024 dimensions)';
COMMENT ON COLUMN jobs.overall_score IS 'Composite score 0-100 based on role match, tech stack, company stage, etc.';
