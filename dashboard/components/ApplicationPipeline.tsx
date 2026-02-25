"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ApplicationPipeline() {
  const { data: pipeline, isLoading } = useQuery({
    queryKey: ["pipeline"],
    queryFn: analyticsApi.getPipeline,
  });

  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Application Pipeline</h2>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const data = pipeline || [
    { status: "Draft", count: 0 },
    { status: "Submitted", count: 0 },
    { status: "Interview", count: 0 },
    { status: "Offer", count: 0 },
  ];

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Application Pipeline</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
