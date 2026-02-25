"use client";

import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { formatDate, getStatusColor } from "@/lib/utils";
import { FileText } from "lucide-react";

export function ApplicationList() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationsApi.getApplications(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-card border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">All Applications</h2>
      </div>
      
      <div className="divide-y">
        {applications && applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Application #{app.id.slice(0, 8)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(app.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {app.resume_version}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              No applications yet. Create your first application from the Jobs page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
