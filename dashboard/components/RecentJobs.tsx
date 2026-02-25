"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api";
import { formatScore, getScoreColor } from "@/lib/utils";
import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

export function RecentJobs() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["top-matches"],
    queryFn: () => jobsApi.getTopMatches(5),
  });

  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Top Matches</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Matches</h2>
        <Link
          href="/jobs"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(job.overall_score)}`}>
                  {formatScore(job.overall_score)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location || "Remote"}
                </span>
                {job.remote && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                    Remote
                  </span>
                )}
              </div>
              
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View Job <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No jobs discovered yet. Run job discovery to get started.
          </p>
        )}
      </div>
    </div>
  );
}
