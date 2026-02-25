"use client";

export function JobFilters() {
  return (
    <div className="bg-card border rounded-lg p-6 sticky top-4">
      <h3 className="font-semibold mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Minimum Score
          </label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="70"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>70</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Company Stage
          </label>
          <div className="space-y-2">
            {["AI Startup", "Growth Startup", "FAANG", "Enterprise"].map((stage) => (
              <label key={stage} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">{stage}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm font-medium">Remote Only</span>
          </label>
        </div>

        <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
