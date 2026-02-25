"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { CheckCircle2, Clock, XCircle, Trophy } from "lucide-react";

export function ApplicationStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: analyticsApi.getStats,
  });

  const statCards = [
    {
      label: "Submitted",
      value: stats?.submitted || 0,
      icon: CheckCircle2,
      color: "text-blue-600",
    },
    {
      label: "In Progress",
      value: (stats?.total_applications || 0) - (stats?.submitted || 0),
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Interviews",
      value: stats?.interviews || 0,
      icon: Trophy,
      color: "text-green-600",
    },
    {
      label: "Offers",
      value: stats?.offers || 0,
      icon: Trophy,
      color: "text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-card border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
