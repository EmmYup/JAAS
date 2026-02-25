import { StatsCards } from "@/components/StatsCards";
import { ApplicationPipeline } from "@/components/ApplicationPipeline";
import { RecentJobs } from "@/components/RecentJobs";
import { Navigation } from "@/components/Navigation";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your job applications and discover new opportunities
          </p>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ApplicationPipeline />
          <RecentJobs />
        </div>
      </main>
    </div>
  );
}
