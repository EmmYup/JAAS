"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api";
import { JobCard } from "./JobCard";

export function JobList() {
  const [filters, setFilters] = useState({
    min_score: 70,
    remote_only: false,
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobsApi.getJobs(filters),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-48 bg-card border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs && jobs.length > 0 ? (
        jobs.map((job) => <JobCard key={job.id} job={job} />)
      ) : (
        <div className="bg-card border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            No jobs found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
