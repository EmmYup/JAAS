import { Navigation } from "@/components/Navigation";
import { JobList } from "@/components/JobList";
import { JobFilters } from "@/components/JobFilters";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">
            Browse and filter discovered jobs by score, company, and tech stack
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <JobFilters />
          </aside>
          
          <div className="lg:col-span-3">
            <JobList />
          </div>
        </div>
      </main>
    </div>
  );
}
