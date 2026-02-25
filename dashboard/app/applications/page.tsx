import { Navigation } from "@/components/Navigation";
import { ApplicationList } from "@/components/ApplicationList";
import { ApplicationStats } from "@/components/ApplicationStats";

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Applications</h1>
          <p className="text-muted-foreground">
            Manage and track your job applications
          </p>
        </div>

        <ApplicationStats />
        
        <div className="mt-6">
          <ApplicationList />
        </div>
      </main>
    </div>
  );
}
