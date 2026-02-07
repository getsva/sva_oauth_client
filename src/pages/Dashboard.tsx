import { MetricCard } from "@/components/Dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

const Dashboard = () => {
  const timeRanges = ["1 hour", "6 hours", "12 hours", "1 day", "2 days", "4 days", "7 days", "14 days", "30 days"];

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">APIs & Services</h1>
          <p className="text-muted-foreground mt-1">Monitor usage and enable new APIs</p>
        </div>
        <Button variant="default" size="lg" className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Enable APIs and services
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {timeRanges.map((range, index) => (
          <button
            key={range}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              index === 3
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <MetricCard title="Traffic" />
        <MetricCard title="Errors" />
      </div>

      <div className="grid grid-cols-1 mb-6">
        <MetricCard title="Median latency" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <span className="text-sm text-muted-foreground">Apply filters to metrics</span>
      </div>
    </div>
  );
};

export default Dashboard;
