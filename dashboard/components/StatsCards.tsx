"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { TrendingUp, Send, Calendar, Award } from "lucide-react";

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: analyticsApi.getStats,
  });

  const cards = [
    {
      title: "Total Applications",
      value: stats?.total_applications || 0,
      icon: Send,
      color: "text-blue-600",
    },
    {
      title: "Interviews",
      value: stats?.interviews || 0,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Offers",
      value: stats?.offers || 0,
      icon: Award,
      color: "text-purple-600",
    },
    {
      title: "Response Rate",
      value: `${stats?.response_rate || 0}%`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-card border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {card.title}
              </h3>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
