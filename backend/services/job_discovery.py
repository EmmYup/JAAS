"""
Job Discovery Service

Aggregates job listings from multiple sources:
- Adzuna API
- Greenhouse public job boards
- Lever public job boards
- YC Jobs (web scraping)
"""

import os
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime
import httpx
from pydantic import BaseModel, Field


class Job(BaseModel):
    """Job listing model"""
    external_id: str
    source: str
    title: str
    company: str
    location: Optional[str] = None
    remote: bool = False
    url: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    posted_date: Optional[datetime] = None
    company_stage: Optional[str] = None  # startup, growth, faang
    tech_stack: List[str] = Field(default_factory=list)


class JobDiscoveryService:
    """Discovers jobs from multiple sources"""
    
    def __init__(self):
        self.adzuna_app_id = os.getenv("ADZUNA_APP_ID")
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY")
        self.http_client = httpx.AsyncClient(timeout=30.0)
    
    async def search_jobs(
        self,
        keywords: List[str],
        location: str = "Remote",
        remote_only: bool = False,
        page: int = 1,
        limit: int = 20
    ) -> List[Job]:
        """Search jobs from all sources"""
        
        jobs = []
        
        # Adzuna
        if self.adzuna_app_id and self.adzuna_app_key:
            adzuna_jobs = await self.fetch_adzuna_jobs(keywords, location, page, limit)
            jobs.extend(adzuna_jobs)
        
        # TODO: Add Greenhouse, Lever, YC Jobs
        
        # Filter for remote if needed
        if remote_only:
            jobs = [j for j in jobs if j.remote]
        
        return jobs[:limit]
    
    async def fetch_adzuna_jobs(
        self,
        keywords: List[str],
        location: str,
        page: int,
        limit: int
    ) -> List[Job]:
        """Fetch jobs from Adzuna API"""
        
        if not self.adzuna_app_id or not self.adzuna_app_key:
            return []
        
        query = " ".join(keywords)
        country = "us"  # Can be parameterized
        
        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
        params = {
            "app_id": self.adzuna_app_id,
            "app_key": self.adzuna_app_key,
            "results_per_page": min(limit, 50),
            "what": query,
            "where": location,
            "content-type": "application/json",
        }
        
        try:
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            jobs = []
            for item in data.get("results", []):
                job = Job(
                    external_id=f"adzuna_{item['id']}",
                    source="adzuna",
                    title=item.get("title", ""),
                    company=item.get("company", {}).get("display_name", "Unknown"),
                    location=item.get("location", {}).get("display_name"),
                    remote="remote" in item.get("title", "").lower() or "remote" in item.get("description", "").lower(),
                    url=item.get("redirect_url", ""),
                    description=item.get("description", ""),
                    salary_min=item.get("salary_min"),
                    salary_max=item.get("salary_max"),
                    posted_date=datetime.fromisoformat(item["created"]) if item.get("created") else None,
                )
                jobs.append(job)
            
            return jobs
        
        except Exception as e:
            print(f"Adzuna API error: {e}")
            return []
    
    async def fetch_greenhouse_jobs(self, company_list: List[str]) -> List[Job]:
        """Fetch jobs from Greenhouse public job boards"""
        
        # TODO: Implement Greenhouse API integration
        # Example: GET https://boards-api.greenhouse.io/v1/boards/{company}/jobs
        
        return []
    
    async def fetch_lever_jobs(self, company_list: List[str]) -> List[Job]:
        """Fetch jobs from Lever public job boards"""
        
        # TODO: Implement Lever API integration
        # Example: GET https://api.lever.co/v0/postings/{company}
        
        return []
    
    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()


# Example usage
if __name__ == "__main__":
    async def main():
        service = JobDiscoveryService()
        jobs = await service.search_jobs(
            keywords=["Software Engineer", "React", "TypeScript"],
            location="Remote",
            remote_only=True,
            limit=10
        )
        
        print(f"Found {len(jobs)} jobs:")
        for job in jobs:
            print(f"• {job.title} at {job.company} ({job.source})")
        
        await service.close()
    
    asyncio.run(main())
