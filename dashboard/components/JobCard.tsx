"use client";

import { Job } from "@/lib/api";
import { formatScore, getScoreColor, formatDate } from "@/lib/utils";
import { MapPin, ExternalLink, Building2, Calendar } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
          <p className="text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {job.company}
          </p>
        </div>
        
        <div className="text-right">
          <div className={`text-4xl font-bold ${getScoreColor(job.overall_score)}`}>
            {formatScore(job.overall_score)}
          </div>
          <p className="text-xs text-muted-foreground">Match Score</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {job.location || "Remote"}
        </span>
        
        {job.remote && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            Remote
          </span>
        )}
        
        {job.company_stage && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
            {job.company_stage.replace('_', ' ')}
          </span>
        )}
        
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDate(job.posted_date || job.created_at)}
        </span>
      </div>

      {job.tech_stack && job.tech_stack.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.tech_stack.slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
              >
                {tech}
              </span>
            ))}
            {job.tech_stack.length > 6 && (
              <span className="px-2 py-1 text-muted-foreground text-xs">
                +{job.tech_stack.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View Job <ExternalLink className="h-4 w-4" />
        </a>
        
        <button className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
          Create Application
        </button>
      </div>
    </div>
  );
}
